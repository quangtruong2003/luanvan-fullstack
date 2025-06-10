import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Calendar, Users, FileText, Settings, 
  Clock, CheckCircle, XCircle, AlertCircle,
  User, Phone, Mail, Edit, LogOut
} from 'lucide-react';
import { doctorService, apiService } from '../../services/api';

const DoctorDashboardNew = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Parallel API calls
      const [appointmentsRes, scheduleRes] = await Promise.all([
        doctorService.getMyAppointments(),
        doctorService.getMySchedule()
      ]);
      
      const appointmentList = appointmentsRes.content || appointmentsRes || [];
      setAppointments(appointmentList);
      setSchedule(scheduleRes.content || scheduleRes || []);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayAppointments = appointmentList.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      );
      
      setStats({
        todayAppointments: todayAppointments.length,
        totalAppointments: appointmentList.length,
        completedAppointments: appointmentList.filter(apt => apt.status === 'COMPLETED').length,
        cancelledAppointments: appointmentList.filter(apt => apt.status === 'CANCELLED').length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: Home },
    { id: 'appointments', name: 'Lịch hẹn', icon: Calendar },
    { id: 'schedule', name: 'Lịch làm việc', icon: Clock },
    { id: 'patients', name: 'Bệnh nhân', icon: Users },
    { id: 'articles', name: 'Bài viết', icon: FileText },
    { id: 'profile', name: 'Hồ sơ', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_PAYMENT': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Lịch hẹn hôm nay
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.todayAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đã hoàn thành
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.completedAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng bệnh nhân
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.totalAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đã hủy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.cancelledAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lịch hẹn hôm nay</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments
            .filter(apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString())
            .slice(0, 5)
            .map((appointment) => (
              <div key={appointment.appointmentId} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient?.fullName || 'Bệnh nhân'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.appointmentTime} - {appointment.reasonForVisit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1">{appointment.status}</span>
                  </span>
                </div>
              </div>
            ))}
          {appointments.filter(apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()).length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              Không có lịch hẹn nào hôm nay
            </div>
          )}
        </div>
        {appointments.filter(apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()).length > 5 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Xem tất cả lịch hẹn
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Tất cả lịch hẹn</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày giờ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lý do khám
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient?.fullName || 'Bệnh nhân'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.patient?.phoneNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-gray-500">
                    {appointment.appointmentTime}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {appointment.reasonForVisit || 'Khám tổng quát'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1">{appointment.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Xem
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'appointments':
        return renderAppointments();
      case 'schedule':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Lịch làm việc</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'patients':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bệnh nhân</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'articles':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bài viết</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'profile':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Hồ sơ cá nhân</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Bảng điều khiển Bác sĩ
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, <span className="font-medium">BS. {currentUser?.fullName || 'Doctor'}</span>
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

export default DoctorDashboardNew; 