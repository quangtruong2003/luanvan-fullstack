import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Users, UserCog, Building, Stethoscope, Calendar, 
  FileText, Settings, DollarSign, BarChart3, Clock,
  Activity, TrendingUp, AlertCircle, CheckCircle, LogOut
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';
import UserManagement from './UserManagement';
import DoctorManagement from './DoctorManagement';
import ClinicManagement from './ClinicManagement';
import AppointmentManagement from './AppointmentManagement';
import PaymentManagement from './PaymentManagement';
import SystemSettings from './SystemSettings';
import AuthErrorHandler from '../../components/AuthErrorHandler';
import { NotificationProvider } from '../../components/NotificationSystem';

const AdminDashboardNew = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalClinics: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [authError, setAuthError] = useState(null);
  // Cache refs
  const statsCache = useRef(null);
  const lastFetchTime = useRef(0);
  const fetchTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000;

  // Simple fetch function with cache
  const fetchStatsWithCache = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Check if we have valid cache
      if (statsCache.current && timeSinceLastFetch < CACHE_DURATION) {
        console.log('📦 Using cached dashboard stats');
        setStats(statsCache.current);
        setConnectionStatus('online');
        return;
      }
      
      fetchDashboardStats();
    }, 500); // 500ms debounce
  }, []);

  useEffect(() => {
    // Only fetch when switching to dashboard tab or first load
    if (activeTab === 'dashboard') {
      fetchStatsWithCache();
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Auto refresh only when on dashboard tab and not loading
    if (activeTab === 'dashboard') {
      intervalRef.current = setInterval(() => {
        if (!loading) {
          fetchStatsWithCache();
        }
      }, 60000); // Refresh every 60 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTab, loading, fetchStatsWithCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setConnectionStatus('checking');
      setAuthError(null);
      
      const now = Date.now();
      lastFetchTime.current = now;
      
      console.log('🔄 Fetching dashboard stats...');
      
      // Parallel API calls
      const [usersRes, doctorsRes, clinicsRes, todayAppointmentsRes] = await Promise.all([
        adminService.getAllUsers().catch((err) => {
          console.warn('Users API failed:', err.message);
          if (err.message.includes('Session expired') || err.message.includes('Access denied')) {
            throw err;
          }
          return { totalElements: 0, content: [] };
        }),
        apiService.getDoctors().catch((err) => {
          console.warn('Doctors API failed:', err.message);
          if (err.message.includes('Session expired') || err.message.includes('Access denied')) {
            throw err;
          }
          return { totalElements: 0, content: [] };
        }),
        apiService.getClinics().catch((err) => {
          console.warn('Clinics API failed:', err.message);
          if (err.message.includes('Session expired') || err.message.includes('Access denied')) {
            throw err;
          }
          return { totalElements: 0, content: [] };
        }),
        adminService.getAllAppointments({ date: new Date().toISOString().split('T')[0] }).catch((err) => {
          console.warn('Appointments API failed:', err.message);
          if (err.message.includes('Session expired') || err.message.includes('Access denied')) {
            throw err;
          }
          return { totalElements: 0, content: [] };
        })
      ]);
      
      // Calculate stats with support for both array and Page object
      const totalUsers = usersRes.totalElements || (Array.isArray(usersRes) ? usersRes.length : (usersRes.content?.length || 0));
      const totalDoctors = doctorsRes.totalElements || (Array.isArray(doctorsRes) ? doctorsRes.length : (doctorsRes.content?.length || 0));
      const totalClinics = clinicsRes.totalElements || (Array.isArray(clinicsRes) ? clinicsRes.length : (clinicsRes.content?.length || 0));
      const todayAppointments = todayAppointmentsRes.totalElements || (Array.isArray(todayAppointmentsRes) ? todayAppointmentsRes.length : (todayAppointmentsRes.content?.length || 0));
      

      
      const newStats = {
        totalUsers,
        totalDoctors,
        totalAppointments: todayAppointments,
        totalClinics
      };
      
      // Cache the results
      statsCache.current = newStats;
      setStats(newStats);
        
      setLastUpdated(new Date());
      setConnectionStatus('online');
      
      console.log('✅ Dashboard stats updated successfully');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Handle authentication errors
      if (error.message.includes('Session expired') || error.message.includes('Access denied')) {
        setAuthError(error);
        return;
      }
      
      setConnectionStatus('offline');
      
      // Set default values on error only if no cache
      if (!statsCache.current) {
        setStats({
          totalUsers: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          totalClinics: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Optimized tab switching with debouncing
  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return; // Prevent unnecessary changes
    
    console.log(`🔄 Switching to tab: ${tabId}`);
    setActiveTab(tabId);
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: Home, color: 'blue' },
    { id: 'users', name: 'Người dùng', icon: Users, color: 'green' },
    { id: 'doctors', name: 'Bác sĩ', icon: UserCog, color: 'purple' },
    { id: 'clinics', name: 'Phòng khám', icon: Building, color: 'orange' },
    { id: 'appointments', name: 'Lịch hẹn', icon: Calendar, color: 'yellow' },
    { id: 'articles', name: 'Bài viết', icon: FileText, color: 'cyan', disabled: true },
    { id: 'payments', name: 'Thanh toán', icon: DollarSign, color: 'emerald' },
    { id: 'settings', name: 'Cài đặt', icon: Settings, color: 'gray' }
  ];

  const getTabColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-700' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-100 text-green-700 border-green-700' : 'text-green-600 hover:bg-green-50',
      purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-700' : 'text-purple-600 hover:bg-purple-50',
      orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-700' : 'text-orange-600 hover:bg-orange-50',
      yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-700' : 'text-yellow-600 hover:bg-yellow-50',
      indigo: isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-700' : 'text-indigo-600 hover:bg-indigo-50',
      cyan: isActive ? 'bg-cyan-100 text-cyan-700 border-cyan-700' : 'text-cyan-600 hover:bg-cyan-50',
      emerald: isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-700' : 'text-emerald-600 hover:bg-emerald-50',
      gray: isActive ? 'bg-gray-100 text-gray-700 border-gray-700' : 'text-gray-600 hover:bg-gray-50'
    };
    return colors[color] || colors.gray;
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* System Status Banner */}
      <div className={`p-4 rounded-lg border ${
        connectionStatus === 'online' 
          ? 'bg-green-50 border-green-200' 
          : connectionStatus === 'offline'
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {connectionStatus === 'online' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : connectionStatus === 'offline' ? (
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          ) : (
            <Activity className="h-5 w-5 text-yellow-600 mr-2 animate-pulse" />
          )}
          <div className="flex-1">
            <h4 className={`font-medium ${
              connectionStatus === 'online' ? 'text-green-800' : 
              connectionStatus === 'offline' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {connectionStatus === 'online' ? 'Hệ thống hoạt động bình thường' : 
               connectionStatus === 'offline' ? 'Mất kết nối với backend' : 'Đang kiểm tra kết nối...'}
            </h4>
            <p className={`text-sm mt-1 ${
              connectionStatus === 'online' ? 'text-green-700' : 
              connectionStatus === 'offline' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {connectionStatus === 'online' ? 'Tất cả dịch vụ đang hoạt động tốt' : 
               connectionStatus === 'offline' ? 'Vui lòng kiểm tra backend server và kết nối mạng' : 'Đang kiểm tra trạng thái các dịch vụ...'}
            </p>
          </div>
          {connectionStatus === 'offline' && (
            <button
              onClick={fetchDashboardStats}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-white shadow-sm hover:bg-red-50"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Thử lại
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi hoạt động của hệ thống</p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              loading
                ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <BarChart3 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-200 ${
            connectionStatus === 'online' ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
          }`}
          onClick={() => connectionStatus === 'online' && handleTabChange('users')}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng người dùng
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.totalUsers.toLocaleString()
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm text-blue-700 font-medium">
              {connectionStatus === 'online' ? 'Click để xem chi tiết →' : 'Chờ kết nối...'}
            </div>
          </div>
        </div>

        <div 
          className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-200 ${
            connectionStatus === 'online' ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
          }`}
          onClick={() => connectionStatus === 'online' && handleTabChange('doctors')}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <UserCog className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng bác sĩ
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.totalDoctors.toLocaleString()
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm text-green-700 font-medium">
              {connectionStatus === 'online' ? 'Click để xem chi tiết →' : 'Chờ kết nối...'}
            </div>
          </div>
        </div>

        <div 
          className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-200 ${
            connectionStatus === 'online' ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
          }`}
          onClick={() => connectionStatus === 'online' && handleTabChange('clinics')}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng phòng khám
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.totalClinics.toLocaleString()
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-3">
            <div className="text-sm text-purple-700 font-medium">
              {connectionStatus === 'online' ? 'Click để xem chi tiết →' : 'Chờ kết nối...'}
            </div>
          </div>
        </div>

        <div 
          className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-200 ${
            connectionStatus === 'online' ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
          }`}
          onClick={() => connectionStatus === 'online' && handleTabChange('appointments')}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Lịch hẹn hôm nay
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.totalAppointments.toLocaleString()
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-5 py-3">
            <div className="text-sm text-yellow-700 font-medium">
              {connectionStatus === 'online' ? 'Click để xem chi tiết →' : 'Chờ kết nối...'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            onClick={() => setActiveTab('doctors')}
            disabled={connectionStatus !== 'online'}
            className={`inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md transition-colors ${
              connectionStatus === 'online'
                ? 'text-purple-700 bg-purple-100 hover:bg-purple-200'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Quản lý bác sĩ
          </button>
          
          <button
            onClick={() => setActiveTab('clinics')}
            disabled={connectionStatus !== 'online'}
            className={`inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md transition-colors ${
              connectionStatus === 'online'
                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <Building className="h-4 w-4 mr-2" />
            Quản lý phòng khám
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            disabled={connectionStatus !== 'online'}
            className={`inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md transition-colors ${
              connectionStatus === 'online'
                ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt hệ thống
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    // Don't render content if there's an auth error
    if (authError) return null;
    
    try {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboardOverview();
        case 'users':
          return <UserManagement onAuthError={setAuthError} />;
        case 'doctors':
          return <DoctorManagement onAuthError={setAuthError} />;
        case 'clinics':
          return <ClinicManagement onAuthError={setAuthError} />;
        case 'appointments':
          return <AppointmentManagement onAuthError={setAuthError} />;
        case 'articles':
          return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bài viết</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
        case 'payments':
          return <PaymentManagement onAuthError={setAuthError} />;
        case 'settings':
          return <SystemSettings onAuthError={setAuthError} />;
        default:
          return renderDashboardOverview();
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      if (error.message.includes('Session expired') || error.message.includes('Access denied')) {
        setAuthError(error);
      }
      return null;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bảng điều khiển Admin
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Xin chào, <span className="font-medium">{currentUser?.fullName || 'Admin'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <nav className="bg-white shadow rounded-lg p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 px-3 py-2">
                    Admin Dashboard
                  </h2>
                  <div className={`px-3 py-1 text-xs rounded-full inline-block ${
                    connectionStatus === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : connectionStatus === 'offline'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {connectionStatus === 'online' ? '● Kết nối' : 
                     connectionStatus === 'offline' ? '● Mất kết nối' : '● Kiểm tra...'}
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isDisabled = tab.disabled || (connectionStatus !== 'online' && tab.id !== 'dashboard');
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => !isDisabled && handleTabChange(tab.id)}
                          disabled={isDisabled}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            isDisabled
                              ? 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                              : isActive
                              ? `${getTabColorClasses(tab.color, true)} shadow-sm`
                              : `${getTabColorClasses(tab.color, false)} hover:shadow-sm`
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isDisabled ? 'opacity-50' : ''}`} />
                          <span className={isDisabled ? 'line-through' : ''}>{tab.name}</span>
                          {tab.disabled && (
                            <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1 rounded">
                              Soon
                            </span>
                          )}
                          {isActive && !isDisabled && (
                            <div className="ml-auto w-2 h-2 bg-current rounded-full"></div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Connection Status Details */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Phiên bản:</span>
                      <span className="font-mono">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-mono">
                        {lastUpdated ? `${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backend:</span>
                      <span className={`font-mono ${
                        connectionStatus === 'online' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {connectionStatus === 'online' ? 'OK' : 'ERROR'}
                      </span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white shadow rounded-lg p-6 min-h-[600px]">
                {connectionStatus === 'offline' && activeTab !== 'dashboard' ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Mất kết nối với backend
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Không thể tải dữ liệu cho tab này. Vui lòng kiểm tra kết nối backend và thử lại.
                    </p>
                    <button
                      onClick={fetchDashboardStats}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Thử kết nối lại
                    </button>
                  </div>
                ) : (
                  renderTabContent()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Auth Error Handler */}
        <AuthErrorHandler 
          error={authError}
          onRetry={() => {
            setAuthError(null);
            fetchDashboardStats();
          }}
          onLogout={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
        />
      </div>
    </NotificationProvider>
  );
};

export default AdminDashboardNew; 