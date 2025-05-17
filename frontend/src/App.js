import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

// API configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icons
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}

function SignalsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
    </svg>
  );
}

function TradesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function AlertIcon({ hasUnread }) {
  return (
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      {hasUnread && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

// Components
const Sidebar = ({ hasUnreadAlerts }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Check if a path is active
  const isActive = (path) => location.pathname === path;
  
  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('token');
          navigate('/login');
        }
      });
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">AI Investment Agent</h1>
      </div>
      
      <nav className="flex-1 pt-4">
        <ul>
          <li>
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/') ? 'bg-gray-800' : ''}`}
            >
              <HomeIcon />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/portfolio" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/portfolio') ? 'bg-gray-800' : ''}`}
            >
              <PortfolioIcon />
              <span>Portfolio</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/signals" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/signals') ? 'bg-gray-800' : ''}`}
            >
              <SignalsIcon />
              <span>Trading Signals</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/trades" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/trades') ? 'bg-gray-800' : ''}`}
            >
              <TradesIcon />
              <span>Trade History</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/alerts" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/alerts') ? 'bg-gray-800' : ''}`}
            >
              <AlertIcon hasUnread={hasUnreadAlerts} />
              <span>Alerts</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 ${isActive('/settings') ? 'bg-gray-800' : ''}`}
            >
              <SettingsIcon />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <UserIcon />
            <div className="text-sm">
              <div className="font-medium">{user.username}</div>
              <div className="text-gray-400 text-xs">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// Pages
const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [signals, setSignals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch portfolio summary
        const portfolioResponse = await axios.get(`${API}/portfolio/summary`, { headers });
        setPortfolio(portfolioResponse.data);
        
        // Fetch latest signals
        const signalsResponse = await axios.get(`${API}/signals`, { 
          headers,
          params: { active_only: true, limit: 5 }
        });
        setSignals(signalsResponse.data);
        
        // Fetch latest alerts
        const alertsResponse = await axios.get(`${API}/alerts`, { 
          headers,
          params: { unread_only: true, limit: 5 }
        });
        setAlerts(alertsResponse.data);
        
        // Fetch market data for a few popular assets
        const assets = ['AAPL', 'MSFT', 'BTC'];
        const marketDataPromises = assets.map(symbol => 
          axios.get(`${API}/market/data/${symbol}`, { headers })
        );
        
        const marketDataResults = await Promise.all(marketDataPromises);
        const marketDataBySymbol = {};
        
        marketDataResults.forEach(response => {
          const { symbol, data } = response.data;
          marketDataBySymbol[symbol] = data;
        });
        
        setMarketData(marketDataBySymbol);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Investment Dashboard</h1>
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Portfolio Value</h2>
          <p className="text-3xl font-bold">{portfolio && formatCurrency(portfolio.portfolio_value)}</p>
          <div className={`text-sm mt-2 ${portfolio && portfolio.day_change_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio && formatPercent(portfolio.day_change_pct)} today
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Cash Balance</h2>
          <p className="text-3xl font-bold">{portfolio && formatCurrency(portfolio.cash_balance)}</p>
          <div className="text-sm mt-2 text-gray-500">Available for trading</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total P&L</h2>
          <p className={`text-3xl font-bold ${portfolio && portfolio.total_pl > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio && formatCurrency(portfolio.total_pl)}
          </p>
          <div className="text-sm mt-2 text-gray-500">Overall performance</div>
        </div>
      </div>
      
      {/* Latest Signals */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Latest Trading Signals</h2>
          <Link to="/signals" className="text-blue-600 hover:text-blue-800">View all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {signals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signals.map(signal => (
                  <tr key={signal.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Symbol</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${signal.signal_type === 'buy' ? 'bg-green-100 text-green-800' :
                          signal.signal_type === 'sell' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {signal.signal_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round(signal.confidence * 100)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {signal.price_target ? formatCurrency(signal.price_target) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(signal.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No active trading signals. Generate signals in the Trading Signals page.
            </div>
          )}
        </div>
      </div>
      
      {/* Latest Alerts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Alerts</h2>
          <Link to="/alerts" className="text-blue-600 hover:text-blue-800">View all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {alerts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {alerts.map(alert => (
                <li key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${alert.is_read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent alerts.
            </div>
          )}
        </div>
      </div>
      
      {/* Market Overview */}
      <div>
        <h2 className="text-xl font-bold mb-4">Market Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(marketData).map(([symbol, data]) => {
            const latestData = data[data.length - 1];
            const previousData = data[data.length - 2];
            const priceChange = latestData.close - previousData.close;
            const percentChange = (priceChange / previousData.close) * 100;
            
            return (
              <div key={symbol} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{symbol}</h3>
                  <span className={`${percentChange >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                    {formatPercent(percentChange)}
                  </span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(latestData.close)}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Open</p>
                    <p className="font-medium">{formatCurrency(latestData.open)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">High</p>
                    <p className="font-medium">{formatCurrency(latestData.high)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Low</p>
                    <p className="font-medium">{formatCurrency(latestData.low)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-medium">{latestData.volume.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Portfolio Component
const Portfolio = () => {
  const [positions, setPositions] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch positions
        const positionsResponse = await axios.get(`${API}/portfolio/positions`, { headers });
        setPositions(positionsResponse.data);
        
        // Fetch portfolio history
        const historyResponse = await axios.get(`${API}/portfolio/history`, { headers });
        setPortfolioHistory(historyResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setIsLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, []);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      
      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Portfolio Value</h2>
        {portfolioHistory.length > 0 && (
          <div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(portfolioHistory[portfolioHistory.length - 1].portfolio_value)}
            </div>
            <div className="h-64 w-full">
              {/* In a real app, this would be a Chart from recharts */}
              <div className="h-full flex items-center justify-center bg-gray-100 rounded">
                Portfolio Value Chart (over time)
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Positions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Positions</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {positions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map(position => (
                  <tr key={position.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{position.asset?.symbol || 'Asset'}</div>
                      <div className="text-xs text-gray-500">{position.provider.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(position.avg_entry_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(position.current_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(position.market_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${position.unrealized_pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(position.unrealized_pl)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No positions in portfolio. Configure API keys in Settings to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Signals Component
const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch signals
        const signalsResponse = await axios.get(`${API}/signals`, { headers });
        setSignals(signalsResponse.data);
        
        // Fetch available assets
        const assetsResponse = await axios.get(`${API}/market/assets`, { headers });
        setAssets(assetsResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching signals data:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAssetSelect = (symbol) => {
    if (selectedAssets.includes(symbol)) {
      setSelectedAssets(selectedAssets.filter(asset => asset !== symbol));
    } else {
      setSelectedAssets([...selectedAssets, symbol]);
    }
  };
  
  const generateSignals = async () => {
    if (selectedAssets.length === 0) return;
    
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      await axios.post(`${API}/ai/generate_signals`, selectedAssets, { headers });
      
      // Refresh signals
      const signalsResponse = await axios.get(`${API}/signals`, { headers });
      setSignals(signalsResponse.data);
      
      setIsGenerating(false);
      setSelectedAssets([]);
    } catch (error) {
      console.error("Error generating signals:", error);
      setIsGenerating(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trading Signals</h1>
      
      {/* Generate Signals */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Generate New Signals</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Assets:</label>
          <div className="flex flex-wrap gap-2">
            {assets.map(asset => (
              <button
                key={asset.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedAssets.includes(asset.symbol)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => handleAssetSelect(asset.symbol)}
              >
                {asset.symbol}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={generateSignals}
          disabled={selectedAssets.length === 0 || isGenerating}
          className={`px-4 py-2 rounded text-white ${
            selectedAssets.length === 0 || isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Signals'}
        </button>
      </div>
      
      {/* Signals List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Active Signals</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {signals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeframe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signals.map(signal => (
                  <tr key={signal.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Symbol</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${signal.signal_type === 'buy' ? 'bg-green-100 text-green-800' :
                          signal.signal_type === 'sell' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {signal.signal_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round(signal.confidence * 100)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(signal.price_target)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(signal.stop_loss)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{signal.timeframe}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{signal.created_by}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(signal.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No active trading signals. Use the form above to generate signals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Trades Component
const Trades = () => {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const response = await axios.get(`${API}/trades`, { headers });
        setTrades(response.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trades:", error);
        setIsLoading(false);
      }
    };
    
    fetchTrades();
  }, []);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trade History</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {trades.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map(trade => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Symbol</div>
                    <div className="text-xs text-gray-500">{trade.provider.toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${trade.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(trade.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(trade.price * trade.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.order_type.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${trade.status === 'filled' ? 'bg-green-100 text-green-800' : 
                        trade.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {trade.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trade.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No trade history available. Configure API keys in Settings to start trading.
          </div>
        )}
      </div>
    </div>
  );
};

// Alerts Component
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const response = await axios.get(`${API}/alerts`, { headers });
        setAlerts(response.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);
  
  const markAlertAsRead = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      await axios.post(`${API}/alerts/${alertId}/read`, {}, { headers });
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alerts</h1>
      
      <div className="bg-white rounded-lg shadow">
        {alerts.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {alerts.map(alert => (
              <li 
                key={alert.id} 
                className={`p-4 hover:bg-gray-50 ${!alert.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-3 w-3 mt-1.5 rounded-full ${alert.is_read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-gray-900 flex-1">{alert.message}</div>
                      {!alert.is_read && (
                        <button 
                          onClick={() => markAlertAsRead(alert.id)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex justify-between">
                      <span>
                        {alert.alert_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No alerts available.
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  const [apiConfigs, setApiConfigs] = useState([]);
  const [riskSettings, setRiskSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("api");
  const [newApiConfig, setNewApiConfig] = useState({
    provider: "alpaca",
    api_key: "",
    api_secret: "",
    is_paper_trading: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch API configs
        const configsResponse = await axios.get(`${API}/trading/config`, { headers });
        setApiConfigs(configsResponse.data);
        
        // Fetch risk settings
        const riskResponse = await axios.get(`${API}/settings/risk`, { headers });
        setRiskSettings(riskResponse.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setErrorMessage("Failed to load settings. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleApiInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewApiConfig({
      ...newApiConfig,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleRiskInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRiskSettings({
      ...riskSettings,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    });
  };
  
  const saveApiConfig = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage("");
      
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await axios.post(
        `${API}/trading/config`,
        newApiConfig,
        { headers }
      );
      
      // Update configs list
      setApiConfigs([...apiConfigs.filter(c => c.provider !== newApiConfig.provider), response.data]);
      
      // Reset form
      setNewApiConfig({
        provider: "alpaca",
        api_key: "",
        api_secret: "",
        is_paper_trading: true
      });
      
      setSuccessMessage("API configuration saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving API config:", error);
      setErrorMessage("Failed to save API configuration. Please try again.");
      setIsSaving(false);
    }
  };
  
  const saveRiskSettings = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage("");
      
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      await axios.post(
        `${API}/settings/risk`,
        riskSettings,
        { headers }
      );
      
      setSuccessMessage("Risk settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving risk settings:", error);
      setErrorMessage("Failed to save risk settings. Please try again.");
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab("api")}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "api"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            API Configuration
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "risk"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Risk Management
          </button>
        </nav>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      {/* API Configuration Tab */}
      {activeTab === "api" && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Current API Configurations</h2>
            
            {apiConfigs.length > 0 ? (
              <div className="space-y-4">
                {apiConfigs.map(config => (
                  <div key={config.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{config.provider.toUpperCase()}</h3>
                        <p className="text-sm text-gray-500">API Key: {config.api_key.substring(0, 6)}...{config.api_key.substring(config.api_key.length - 4)}</p>
                        <p className="text-sm mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${config.is_paper_trading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {config.is_paper_trading ? 'Paper Trading' : 'Live Trading'}
                          </span>
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No API configurations found. Add one below.</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Add New API Configuration</h2>
            
            <form onSubmit={saveApiConfig}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    name="provider"
                    value={newApiConfig.provider}
                    onChange={handleApiInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="alpaca">Alpaca</option>
                    <option value="binance">Binance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    name="api_key"
                    value={newApiConfig.api_key}
                    onChange={handleApiInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    name="api_secret"
                    value={newApiConfig.api_secret}
                    onChange={handleApiInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_paper_trading"
                    id="is_paper_trading"
                    checked={newApiConfig.is_paper_trading}
                    onChange={handleApiInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_paper_trading" className="ml-2 text-sm text-gray-700">
                    Use Paper Trading (simulated, no real money)
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 rounded text-white ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Risk Management Tab */}
      {activeTab === "risk" && riskSettings && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Risk Management Settings</h2>
          
          <form onSubmit={saveRiskSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Position Size (% of portfolio)
                </label>
                <input
                  type="number"
                  name="max_position_size"
                  value={riskSettings.max_position_size}
                  onChange={handleRiskInputChange}
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The maximum percentage of your portfolio that can be allocated to a single position.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Loss Per Trade (% of portfolio)
                </label>
                <input
                  type="number"
                  name="max_loss_per_trade"
                  value={riskSettings.max_loss_per_trade}
                  onChange={handleRiskInputChange}
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The maximum percentage of your portfolio you're willing to lose on a single trade.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Stop Loss (% below entry)
                </label>
                <input
                  type="number"
                  name="default_stop_loss"
                  value={riskSettings.default_stop_loss}
                  onChange={handleRiskInputChange}
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The default percentage below entry price to set stop loss orders.
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="trailing_stop_loss"
                    id="trailing_stop_loss"
                    checked={riskSettings.trailing_stop_loss}
                    onChange={handleRiskInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trailing_stop_loss" className="ml-2 text-sm text-gray-700">
                    Use Trailing Stop Loss
                  </label>
                </div>
                
                {riskSettings.trailing_stop_loss && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trailing Stop Percentage
                    </label>
                    <input
                      type="number"
                      name="trailing_stop_pct"
                      value={riskSettings.trailing_stop_pct || ""}
                      onChange={handleRiskInputChange}
                      min="0.1"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required={riskSettings.trailing_stop_loss}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Trailing stops follow the price as it moves in your favor and help lock in profits.
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded text-white ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Risk Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Login Component
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      setIsLoading(true);
      
      if (isLogin) {
        // Handle login
        const response = await axios.post(`${API}/auth/token`, {
          username: formData.username,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        localStorage.setItem('token', response.data.access_token);
        navigate('/');
      } else {
        // Handle registration
        await axios.post(`${API}/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        // After registration, log in automatically
        const loginResponse = await axios.post(`${API}/auth/token`, {
          username: formData.username,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        localStorage.setItem('token', loginResponse.data.access_token);
        navigate('/');
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? (
              <>
                Or{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  create a new account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login');
        return;
      }
      
      try {
        // Verify token by making a request to the me endpoint
        await axios.get(`${API}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : null;
};

// Main App Component
function App() {
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  
  useEffect(() => {
    // Check for unread alerts on mount and periodically
    const checkUnreadAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`${API}/alerts`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { unread_only: true }
        });
        
        setHasUnreadAlerts(response.data.length > 0);
      } catch (error) {
        console.error("Error checking unread alerts:", error);
      }
    };
    
    checkUnreadAlerts();
    const interval = setInterval(checkUnreadAlerts, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-100">
              <Sidebar hasUnreadAlerts={hasUnreadAlerts} />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/signals" element={<Signals />} />
                  <Route path="/trades" element={<Trades />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;