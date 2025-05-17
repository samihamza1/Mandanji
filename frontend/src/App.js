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

// Dashboard Component
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