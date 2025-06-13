import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext'; // Commented out vì header bị comment
import { 
  Home, Users, UserCog, Building, Stethoscope, Calendar, 
  FileText, Settings, DollarSign, BarChart3, Clock
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';
import UserManagement from './UserManagement';
import DoctorManagement from './DoctorManagement';
import ClinicManagement from './ClinicManagement';
import SpecialtyManagement from './SpecialtyManagement';
import AppointmentManagement from './AppointmentManagement';
import SystemSettings from './SystemSettings';
import StandardWorkShiftManagement from './StandardWorkShiftManagement';

const AdminDashboardNew = () => {
  // const { currentUser, logout } = useAuth(); // Commented out vì header bị comment
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalClinics: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    
    // Auto refresh stats every 30 seconds when on dashboard tab
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        fetchDashboardStats();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Parallel API calls for better performance
      const [usersRes, doctorsRes, clinicsRes, todayAppointmentsRes] = await Promise.all([
        adminService.getAllUsers().catch(() => ({ totalElements: 0, content: [] })),
        apiService.getDoctors().catch(() => ({ totalElements: 0, content: [] })),
        apiService.getClinics().catch(() => ({ totalElements: 0, content: [] })),
        adminService.getAllAppointments({ date: new Date().toISOString().split('T')[0] }).catch(() => ({ totalElements: 0, content: [] }))
      ]);
      
      // Calculate stats với support cho cả array và Page object
      const totalUsers = usersRes.totalElements || (Array.isArray(usersRes) ? usersRes.length : (usersRes.content?.length || 0));
      const totalDoctors = doctorsRes.totalElements || (Array.isArray(doctorsRes) ? doctorsRes.length : (doctorsRes.content?.length || 0));
      const totalClinics = clinicsRes.totalElements || (Array.isArray(clinicsRes) ? clinicsRes.length : (clinicsRes.content?.length || 0));
      const todayAppointments = todayAppointmentsRes.totalElements || (Array.isArray(todayAppointmentsRes) ? todayAppointmentsRes.length : (todayAppointmentsRes.content?.length || 0));
      
              setStats({
          totalUsers,
          totalDoctors,
          totalAppointments: todayAppointments,
          totalClinics
        });
        
        setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalClinics: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   await logout();
  //   window.location.href = '/login';
  // };

  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: Home },
    { id: 'users', name: 'Người dùng', icon: Users },
    { id: 'doctors', name: 'Bác sĩ', icon: UserCog },
    { id: 'clinics', name: 'Phòng khám', icon: Building },
    { id: 'specialties', name: 'Chuyên khoa', icon: Stethoscope },
    { id: 'appointments', name: 'Lịch hẹn', icon: Calendar },
    { id: 'articles', name: 'Bài viết', icon: FileText },
    { id: 'payments', name: 'Thanh toán', icon: DollarSign },
    { id: 'standardWorkShifts', name: 'Ca làm việc (Tập trung)', icon: Clock },
    { id: 'settings', name: 'Cài đặt', icon: Settings }
  ];

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Tổng quan hệ thống</h2>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <BarChart3 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => setActiveTab('users')}
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
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm text-blue-700 font-medium">
              Click để xem chi tiết →
            </div>
          </div>
        </div>

        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => setActiveTab('doctors')}
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
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalDoctors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm text-green-700 font-medium">
              Click để xem chi tiết →
            </div>
          </div>
        </div>

        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => setActiveTab('clinics')}
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
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalClinics}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-3">
            <div className="text-sm text-purple-700 font-medium">
              Click để xem chi tiết →
            </div>
          </div>
        </div>

        <div 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => setActiveTab('appointments')}
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
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-5 py-3">
            <div className="text-sm text-yellow-700 font-medium">
              Click để xem chi tiết →
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setActiveTab('doctors')}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <UserCog className="h-4 w-4 mr-2" />
            Quản lý bác sĩ
          </button>
          
          <button
            onClick={() => setActiveTab('clinics')}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
          >
            <Building className="h-4 w-4 mr-2" />
            Quản lý phòng khám
          </button>
          
          <button
            onClick={() => setActiveTab('standardWorkShifts')}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
          >
            <Clock className="h-4 w-4 mr-2" />
            Quản lý ca làm việc
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt hệ thống
          </button>
        </div>
      </div>


    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'users':
        return <UserManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'clinics':
        return <ClinicManagement />;
      case 'specialties':
        return <SpecialtyManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'articles':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bài viết</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'payments':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý thanh toán</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'settings':
        return <SystemSettings />;
      case 'standardWorkShifts':
        return <StandardWorkShiftManagement />;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {/* <header className="bg-white shadow">
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
      </header> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white shadow rounded-lg p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew; 