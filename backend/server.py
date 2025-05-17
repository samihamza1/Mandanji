from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
from pathlib import Path
from datetime import datetime, timedelta
import uuid
import os
import logging
import json
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
import pandas as pd
import numpy as np

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ai_investment_agent')]

# Security settings
SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")  # In production, use a proper env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Create the main app without a prefix
app = FastAPI(title="AI Investment Agent")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

#-------------
# Models
#-------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserInDB(User):
    hashed_password: str

class TradingAPIConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    provider: str  # 'alpaca' or 'binance'
    api_key: str
    api_secret: str
    is_paper_trading: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TradingAPIConfigCreate(BaseModel):
    provider: str
    api_key: str
    api_secret: str
    is_paper_trading: bool = True

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str
    name: str
    asset_type: str  # stock, crypto, etc.
    exchange: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Position(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset_id: str
    provider: str  # alpaca, binance
    quantity: float
    avg_entry_price: float
    current_price: Optional[float] = None
    unrealized_pl: Optional[float] = None
    market_value: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Trade(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset_id: str
    provider: str  # alpaca, binance
    order_id: str
    side: str  # buy, sell
    quantity: float
    price: float
    order_type: str  # market, limit, etc.
    status: str  # open, filled, canceled, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Signal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset_id: str
    signal_type: str  # buy, sell, hold
    confidence: float
    price_target: Optional[float] = None
    stop_loss: Optional[float] = None
    timeframe: str  # short_term, medium_term, long_term
    rationale: str
    created_by: str  # model name or strategy that generated the signal
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset_id: Optional[str] = None
    alert_type: str  # price_target, signal_generated, trade_executed
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RiskSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    max_position_size: float  # % of portfolio
    max_loss_per_trade: float  # % of portfolio
    default_stop_loss: float  # % below entry
    trailing_stop_loss: bool = False
    trailing_stop_pct: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AIModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    model_type: str  # sentiment, price_prediction, etc.
    enabled: bool = True
    config: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PortfolioSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    cash_balance: float
    portfolio_value: float
    day_change_pct: float
    total_pl: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    timestamp: datetime
    interval: str  # 1m, 5m, 1h, 1d, etc.
    source: str  # alpaca, binance, etc.

class NewsSentiment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset_id: str
    title: str
    source: str
    url: str
    sentiment_score: float  # -1 to 1
    importance: float  # 0 to 1
    published_at: datetime
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)

#-------------
# Security Utils
#-------------

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(username: str):
    user_dict = await db.users.find_one({"username": username})
    if user_dict:
        return UserInDB(**user_dict)
    return None

async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = await get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

#-------------
# Auth Routes
#-------------

@api_router.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/register", response_model=User)
async def register_user(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        **user.model_dump(exclude={"password"}),
        hashed_password=hashed_password
    )
    
    await db.users.insert_one(user_in_db.model_dump())
    return User(**user_in_db.model_dump(exclude={"hashed_password"}))

@api_router.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

#-------------
# API Config Routes
#-------------

@api_router.post("/trading/config", response_model=TradingAPIConfig)
async def create_api_config(
    config: TradingAPIConfigCreate,
    current_user: User = Depends(get_current_active_user)
):
    # Check if config for this provider already exists
    existing_config = await db.api_configs.find_one({
        "user_id": current_user.id,
        "provider": config.provider
    })
    
    api_config = TradingAPIConfig(
        user_id=current_user.id,
        provider=config.provider,
        api_key=config.api_key,
        api_secret=config.api_secret,
        is_paper_trading=config.is_paper_trading
    )
    
    if existing_config:
        # Update existing config
        await db.api_configs.update_one(
            {"_id": existing_config["_id"]},
            {"$set": api_config.model_dump(exclude={"id"})}
        )
        api_config.id = str(existing_config["_id"])
    else:
        # Create new config
        result = await db.api_configs.insert_one(api_config.model_dump())
        api_config.id = str(result.inserted_id)
    
    return api_config

@api_router.get("/trading/config", response_model=List[TradingAPIConfig])
async def get_api_configs(current_user: User = Depends(get_current_active_user)):
    configs = await db.api_configs.find({"user_id": current_user.id}).to_list(length=10)
    return [TradingAPIConfig(**config) for config in configs]

@api_router.delete("/trading/config/{config_id}")
async def delete_api_config(
    config_id: str,
    current_user: User = Depends(get_current_active_user)
):
    result = await db.api_configs.delete_one({
        "_id": config_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Config not found or not authorized to delete"
        )
    
    return {"message": "Config deleted successfully"}

#-------------
# Portfolio Routes
#-------------

@api_router.get("/portfolio/summary", response_model=PortfolioSnapshot)
async def get_portfolio_summary(current_user: User = Depends(get_current_active_user)):
    # In a real app, this would fetch live data from Alpaca/Binance
    # For demonstration, we'll create a mock portfolio
    
    latest_snapshot = await db.portfolio_snapshots.find_one(
        {"user_id": current_user.id},
        sort=[("timestamp", -1)]  # Get the most recent
    )
    
    if not latest_snapshot:
        # Create a mock portfolio if none exists
        mock_portfolio = PortfolioSnapshot(
            user_id=current_user.id,
            cash_balance=10000.0,
            portfolio_value=15000.0,
            day_change_pct=1.2,
            total_pl=500.0
        )
        await db.portfolio_snapshots.insert_one(mock_portfolio.model_dump())
        return mock_portfolio
    
    return PortfolioSnapshot(**latest_snapshot)

@api_router.get("/portfolio/positions", response_model=List[Position])
async def get_positions(current_user: User = Depends(get_current_active_user)):
    positions = await db.positions.find({"user_id": current_user.id}).to_list(length=100)
    
    if not positions:
        # Create mock positions for demonstration
        sample_assets = [
            {"symbol": "AAPL", "name": "Apple Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "BTC", "name": "Bitcoin", "asset_type": "crypto", "exchange": "Binance"}
        ]
        
        mock_positions = []
        for asset in sample_assets:
            # Create the asset if it doesn't exist
            existing_asset = await db.assets.find_one({"symbol": asset["symbol"]})
            if not existing_asset:
                new_asset = Asset(**asset)
                result = await db.assets.insert_one(new_asset.model_dump())
                asset_id = str(result.inserted_id)
            else:
                asset_id = str(existing_asset["_id"])
            
            # Create a position
            position = Position(
                user_id=current_user.id,
                asset_id=asset_id,
                provider="alpaca" if asset["asset_type"] == "stock" else "binance",
                quantity=10 if asset["asset_type"] == "stock" else 0.5,
                avg_entry_price=150.0 if asset["asset_type"] == "stock" else 30000.0,
                current_price=165.0 if asset["asset_type"] == "stock" else 32000.0,
                unrealized_pl=150.0 if asset["asset_type"] == "stock" else 1000.0,
                market_value=1650.0 if asset["asset_type"] == "stock" else 16000.0
            )
            await db.positions.insert_one(position.model_dump())
            mock_positions.append(position)
        
        return mock_positions
    
    # Enrich positions with asset details
    result = []
    for position in positions:
        asset = await db.assets.find_one({"_id": position["asset_id"]})
        position["asset"] = asset
        result.append(Position(**position))
    
    return result

@api_router.get("/portfolio/history", response_model=List[PortfolioSnapshot])
async def get_portfolio_history(current_user: User = Depends(get_current_active_user)):
    snapshots = await db.portfolio_snapshots.find(
        {"user_id": current_user.id}
    ).sort("timestamp", -1).to_list(length=30)  # Last 30 snapshots
    
    if not snapshots:
        # Create mock historical data
        mock_history = []
        base_value = 15000.0
        base_date = datetime.utcnow() - timedelta(days=30)
        
        for i in range(30):
            day_offset = timedelta(days=i)
            daily_change = np.random.normal(0.001, 0.01)  # Random daily change
            
            snapshot = PortfolioSnapshot(
                user_id=current_user.id,
                cash_balance=10000.0,
                portfolio_value=base_value * (1 + daily_change * i),
                day_change_pct=daily_change * 100,
                total_pl=base_value * (1 + daily_change * i) - base_value,
                timestamp=base_date + day_offset
            )
            await db.portfolio_snapshots.insert_one(snapshot.model_dump())
            mock_history.append(snapshot)
        
        return sorted(mock_history, key=lambda x: x.timestamp)
    
    return [PortfolioSnapshot(**snapshot) for snapshot in snapshots]

#-------------
# Signals Routes
#-------------

@api_router.get("/signals", response_model=List[Signal])
async def get_signals(
    current_user: User = Depends(get_current_active_user),
    active_only: bool = Query(True),
    limit: int = Query(20)
):
    query = {"user_id": current_user.id}
    if active_only:
        query["is_active"] = True
    
    signals = await db.signals.find(query).sort("created_at", -1).to_list(length=limit)
    
    if not signals:
        # Generate mock signals
        mock_signals = []
        assets = await db.assets.find().to_list(length=10)
        
        if not assets:
            # If no assets, create some
            sample_assets = [
                {"symbol": "AAPL", "name": "Apple Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
                {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_type": "stock", "exchange": "NASDAQ"},
                {"symbol": "GOOGL", "name": "Alphabet Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
                {"symbol": "AMZN", "name": "Amazon.com Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
                {"symbol": "BTC", "name": "Bitcoin", "asset_type": "crypto", "exchange": "Binance"},
                {"symbol": "ETH", "name": "Ethereum", "asset_type": "crypto", "exchange": "Binance"}
            ]
            
            for asset_data in sample_assets:
                asset = Asset(**asset_data)
                result = await db.assets.insert_one(asset.model_dump())
                assets.append({"_id": result.inserted_id, **asset_data})
        
        signal_types = ["buy", "sell", "hold"]
        timeframes = ["short_term", "medium_term", "long_term"]
        models = ["sentiment_analyzer", "price_predictor", "trend_detector", "hybrid_model"]
        
        for _ in range(10):
            asset = np.random.choice(assets)
            signal_type = np.random.choice(signal_types)
            
            signal = Signal(
                user_id=current_user.id,
                asset_id=str(asset["_id"]),
                signal_type=signal_type,
                confidence=round(np.random.uniform(0.6, 0.95), 2),
                price_target=round(np.random.uniform(100, 200), 2) if signal_type != "hold" else None,
                stop_loss=round(np.random.uniform(80, 95), 2) if signal_type == "buy" else None,
                timeframe=np.random.choice(timeframes),
                rationale=f"Based on technical analysis and recent {asset['symbol']} performance.",
                created_by=np.random.choice(models),
                created_at=datetime.utcnow() - timedelta(hours=np.random.randint(1, 72)),
                expires_at=datetime.utcnow() + timedelta(days=np.random.randint(1, 7)),
                is_active=True
            )
            
            await db.signals.insert_one(signal.model_dump())
            mock_signals.append(signal)
        
        return mock_signals
    
    return [Signal(**signal) for signal in signals]

#-------------
# Trades Routes
#-------------

@api_router.get("/trades", response_model=List[Trade])
async def get_trades(
    current_user: User = Depends(get_current_active_user),
    limit: int = Query(20)
):
    trades = await db.trades.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=limit)
    
    if not trades:
        # Generate mock trades
        mock_trades = []
        assets = await db.assets.find().to_list(length=10)
        
        for _ in range(10):
            asset = np.random.choice(assets)
            side = np.random.choice(["buy", "sell"])
            price = round(np.random.uniform(100, 200), 2)
            quantity = round(np.random.uniform(1, 10), 2)
            
            trade = Trade(
                user_id=current_user.id,
                asset_id=str(asset["_id"]),
                provider="alpaca" if asset["asset_type"] == "stock" else "binance",
                order_id=str(uuid.uuid4()),
                side=side,
                quantity=quantity,
                price=price,
                order_type="market",
                status="filled",
                created_at=datetime.utcnow() - timedelta(days=np.random.randint(0, 30))
            )
            
            await db.trades.insert_one(trade.model_dump())
            mock_trades.append(trade)
        
        return sorted(mock_trades, key=lambda x: x.created_at, reverse=True)
    
    return [Trade(**trade) for trade in trades]

#-------------
# Alerts Routes
#-------------

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(
    current_user: User = Depends(get_current_active_user),
    unread_only: bool = Query(False)
):
    query = {"user_id": current_user.id}
    if unread_only:
        query["is_read"] = False
    
    alerts = await db.alerts.find(query).sort("created_at", -1).to_list(length=50)
    
    if not alerts:
        # Generate mock alerts
        mock_alerts = []
        assets = await db.assets.find().to_list(length=10)
        
        for i in range(10):
            asset = np.random.choice(assets)
            alert_types = ["price_target", "signal_generated", "trade_executed"]
            alert_type = np.random.choice(alert_types)
            
            if alert_type == "price_target":
                message = f"{asset['symbol']} has reached your price target of ${round(np.random.uniform(100, 200), 2)}"
            elif alert_type == "signal_generated":
                signal_type = np.random.choice(["buy", "sell", "hold"])
                message = f"New {signal_type} signal generated for {asset['symbol']} with {round(np.random.uniform(0.6, 0.95), 2)*100}% confidence"
            else:
                side = np.random.choice(["buy", "sell"])
                qty = round(np.random.uniform(1, 10), 2)
                price = round(np.random.uniform(100, 200), 2)
                message = f"Successfully {side} {qty} {asset['symbol']} at ${price}"
            
            alert = Alert(
                user_id=current_user.id,
                asset_id=str(asset["_id"]),
                alert_type=alert_type,
                message=message,
                is_read=i < 5,  # Make about half read
                created_at=datetime.utcnow() - timedelta(hours=np.random.randint(1, 72))
            )
            
            await db.alerts.insert_one(alert.model_dump())
            mock_alerts.append(alert)
        
        return sorted(mock_alerts, key=lambda x: x.created_at, reverse=True)
    
    return [Alert(**alert) for alert in alerts]

@api_router.post("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(get_current_active_user)
):
    result = await db.alerts.update_one(
        {"_id": alert_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found or already marked as read"
        )
    
    return {"message": "Alert marked as read"}

#-------------
# Settings Routes
#-------------

@api_router.get("/settings/risk", response_model=RiskSettings)
async def get_risk_settings(current_user: User = Depends(get_current_active_user)):
    settings = await db.risk_settings.find_one({"user_id": current_user.id})
    
    if not settings:
        # Create default settings
        default_settings = RiskSettings(
            user_id=current_user.id,
            max_position_size=5.0,  # 5% of portfolio
            max_loss_per_trade=1.0,  # 1% of portfolio
            default_stop_loss=2.0,   # 2% below entry
            trailing_stop_loss=False,
            trailing_stop_pct=None
        )
        await db.risk_settings.insert_one(default_settings.model_dump())
        return default_settings
    
    return RiskSettings(**settings)

@api_router.post("/settings/risk", response_model=RiskSettings)
async def update_risk_settings(
    settings: RiskSettings,
    current_user: User = Depends(get_current_active_user)
):
    # Ensure the user can only update their own settings
    if settings.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update settings for another user"
        )
    
    existing_settings = await db.risk_settings.find_one({"user_id": current_user.id})
    
    if existing_settings:
        await db.risk_settings.update_one(
            {"_id": existing_settings["_id"]},
            {"$set": {**settings.model_dump(exclude={"id", "created_at"}), "updated_at": datetime.utcnow()}}
        )
        return RiskSettings(**settings.model_dump(), id=str(existing_settings["_id"]))
    else:
        result = await db.risk_settings.insert_one(settings.model_dump())
        return RiskSettings(**settings.model_dump(), id=str(result.inserted_id))

#-------------
# AI Models Routes
#-------------

@api_router.get("/ai/models", response_model=List[AIModel])
async def get_ai_models():
    models = await db.ai_models.find().to_list(length=100)
    
    if not models:
        # Create default AI models
        default_models = [
            AIModel(
                name="Sentiment Analyzer",
                description="Analyzes news and social media for market sentiment",
                model_type="sentiment",
                config={"sources": ["news", "twitter", "reddit"], "update_frequency": "hourly"}
            ),
            AIModel(
                name="Price Predictor",
                description="Predicts price movements using historical data",
                model_type="price_prediction",
                config={"timeframes": ["1h", "1d", "1w"], "features": ["price", "volume", "indicators"]}
            ),
            AIModel(
                name="Trend Detector",
                description="Identifies market trends using technical analysis",
                model_type="trend_detection",
                config={"indicators": ["moving_average", "rsi", "macd"], "threshold": 0.7}
            ),
            AIModel(
                name="Hybrid Strategy",
                description="Combines multiple signals for more robust predictions",
                model_type="hybrid",
                config={"models": ["sentiment", "price_prediction", "trend_detection"], "weights": [0.3, 0.4, 0.3]}
            )
        ]
        
        for model in default_models:
            await db.ai_models.insert_one(model.model_dump())
        
        return default_models
    
    return [AIModel(**model) for model in models]

@api_router.post("/ai/generate_signals")
async def generate_signals(
    asset_symbols: List[str] = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    # This would normally use actual AI models to analyze data and generate signals
    # For demonstration, we'll create mock signals
    
    signals_created = []
    for symbol in asset_symbols:
        asset = await db.assets.find_one({"symbol": symbol})
        
        if not asset:
            # Create the asset if it doesn't exist
            asset_type = "crypto" if symbol in ["BTC", "ETH"] else "stock"
            exchange = "Binance" if asset_type == "crypto" else "NASDAQ"
            
            new_asset = Asset(
                symbol=symbol,
                name=f"{symbol} Asset",
                asset_type=asset_type,
                exchange=exchange
            )
            result = await db.assets.insert_one(new_asset.model_dump())
            asset_id = str(result.inserted_id)
        else:
            asset_id = str(asset["_id"])
        
        # Generate a random signal
        signal_types = ["buy", "sell", "hold"]
        timeframes = ["short_term", "medium_term", "long_term"]
        models = ["sentiment_analyzer", "price_predictor", "trend_detector", "hybrid_model"]
        
        signal_type = np.random.choice(signal_types, p=[0.5, 0.3, 0.2])  # Bias towards buys
        
        signal = Signal(
            user_id=current_user.id,
            asset_id=asset_id,
            signal_type=signal_type,
            confidence=round(np.random.uniform(0.6, 0.95), 2),
            price_target=round(np.random.uniform(100, 200), 2) if signal_type != "hold" else None,
            stop_loss=round(np.random.uniform(80, 95), 2) if signal_type == "buy" else None,
            timeframe=np.random.choice(timeframes),
            rationale=f"AI analysis detected favorable patterns for a {signal_type} signal on {symbol}.",
            created_by=np.random.choice(models),
            expires_at=datetime.utcnow() + timedelta(days=np.random.randint(1, 7)),
            is_active=True
        )
        
        await db.signals.insert_one(signal.model_dump())
        signals_created.append(signal)
        
        # Create an alert for the new signal
        alert = Alert(
            user_id=current_user.id,
            asset_id=asset_id,
            alert_type="signal_generated",
            message=f"New {signal_type} signal generated for {symbol} with {int(signal.confidence*100)}% confidence",
            is_read=False
        )
        await db.alerts.insert_one(alert.model_dump())
    
    return {"message": f"Generated {len(signals_created)} signals", "signals": signals_created}

#-------------
# Market Data Routes
#-------------

@api_router.get("/market/assets", response_model=List[Asset])
async def get_assets(asset_type: Optional[str] = None):
    query = {}
    if asset_type:
        query["asset_type"] = asset_type
    
    assets = await db.assets.find(query).to_list(length=100)
    
    if not assets:
        # Create sample assets
        sample_assets = [
            {"symbol": "AAPL", "name": "Apple Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "TSLA", "name": "Tesla, Inc.", "asset_type": "stock", "exchange": "NASDAQ"},
            {"symbol": "BTC", "name": "Bitcoin", "asset_type": "crypto", "exchange": "Binance"},
            {"symbol": "ETH", "name": "Ethereum", "asset_type": "crypto", "exchange": "Binance"},
            {"symbol": "SOL", "name": "Solana", "asset_type": "crypto", "exchange": "Binance"},
            {"symbol": "AVAX", "name": "Avalanche", "asset_type": "crypto", "exchange": "Binance"},
            {"symbol": "DOGE", "name": "Dogecoin", "asset_type": "crypto", "exchange": "Binance"}
        ]
        
        for asset_data in sample_assets:
            if asset_type and asset_data["asset_type"] != asset_type:
                continue
                
            asset = Asset(**asset_data)
            await db.assets.insert_one(asset.model_dump())
            assets.append(asset.model_dump())
    
    return [Asset(**asset) for asset in assets]

@api_router.get("/market/data/{symbol}")
async def get_market_data(
    symbol: str,
    interval: str = Query("1d", description="1m, 5m, 15m, 1h, 4h, 1d"),
    limit: int = Query(30, ge=1, le=1000)
):
    # In a real app, this would fetch data from Alpaca/Binance APIs
    # For demonstration, we'll generate mock market data
    
    asset = await db.assets.find_one({"symbol": symbol})
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with symbol {symbol} not found"
        )
    
    # Generate mock price data
    end_date = datetime.utcnow()
    
    if interval == "1m":
        start_date = end_date - timedelta(minutes=limit)
        delta = timedelta(minutes=1)
    elif interval == "5m":
        start_date = end_date - timedelta(minutes=5*limit)
        delta = timedelta(minutes=5)
    elif interval == "15m":
        start_date = end_date - timedelta(minutes=15*limit)
        delta = timedelta(minutes=15)
    elif interval == "1h":
        start_date = end_date - timedelta(hours=limit)
        delta = timedelta(hours=1)
    elif interval == "4h":
        start_date = end_date - timedelta(hours=4*limit)
        delta = timedelta(hours=4)
    else:  # 1d
        start_date = end_date - timedelta(days=limit)
        delta = timedelta(days=1)
    
    # Determine base price based on asset type
    base_price = 150.0 if asset["asset_type"] == "stock" else 30000.0
    
    # Generate price data with random walk
    data = []
    current_date = start_date
    current_price = base_price
    
    while current_date <= end_date:
        price_change = np.random.normal(0, 0.01) * current_price
        current_price = max(0.01, current_price + price_change)
        
        high = current_price * (1 + abs(np.random.normal(0, 0.005)))
        low = current_price * (1 - abs(np.random.normal(0, 0.005)))
        open_price = current_price * (1 + np.random.normal(0, 0.005))
        volume = np.random.randint(1000, 1000000)
        
        data.append({
            "timestamp": current_date.isoformat(),
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(current_price, 2),
            "volume": volume
        })
        
        current_date += delta
    
    return {"symbol": symbol, "interval": interval, "data": data}

#-------------
# News and Sentiment Routes
#-------------

@api_router.get("/news", response_model=List[NewsSentiment])
async def get_news(
    symbol: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    query = {}
    if symbol:
        asset = await db.assets.find_one({"symbol": symbol})
        if asset:
            query["asset_id"] = str(asset["_id"])
    
    news = await db.news.find(query).sort("published_at", -1).to_list(length=limit)
    
    if not news:
        # Generate mock news
        mock_news = []
        assets = await db.assets.find().to_list(length=10)
        
        news_sources = ["Bloomberg", "CNBC", "Reuters", "Wall Street Journal", "Financial Times"]
        
        for _ in range(limit):
            asset = np.random.choice(assets) if not symbol else await db.assets.find_one({"symbol": symbol})
            sentiment = np.random.normal(0, 0.5)  # range roughly -1 to 1
            
            # Create more interesting titles based on sentiment
            if sentiment > 0.3:
                title = f"{asset['symbol']} Surges on Strong Earnings Report"
            elif sentiment > 0:
                title = f"Analysts Positive on {asset['symbol']} Future Growth"
            elif sentiment > -0.3:
                title = f"{asset['symbol']} Faces Market Challenges Amid Economic Uncertainty"
            else:
                title = f"{asset['symbol']} Drops After Missing Quarterly Expectations"
            
            news_item = NewsSentiment(
                asset_id=str(asset["_id"]),
                title=title,
                source=np.random.choice(news_sources),
                url=f"https://example.com/news/{uuid.uuid4()}",
                sentiment_score=round(sentiment, 2),
                importance=round(np.random.uniform(0.3, 0.9), 2),
                published_at=datetime.utcnow() - timedelta(hours=np.random.randint(1, 72))
            )
            
            await db.news.insert_one(news_item.model_dump())
            mock_news.append(news_item)
        
        return sorted(mock_news, key=lambda x: x.published_at, reverse=True)
    
    return [NewsSentiment(**item) for item in news]

@api_router.get("/")
async def root():
    return {"message": "AI Investment Agent API"}

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
