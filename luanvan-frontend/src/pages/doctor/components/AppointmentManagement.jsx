import React, { useState, useMemo } from 'react';
import { 
  Calendar, CheckCircle, XCircle, AlertCircle, Clock,
  User, Phone, Mail, Eye, Filter, SortAsc, SortDesc,
  Search, MapPin, Stethoscope, FileText, CalendarDays
} from 'lucide-react';

const AppointmentManagement = ({ 
  appointments, 
  stats, 
  handleViewAppointmentDetails 
}) => {
  const [sortBy, setSortBy] = useState('date'); // date, status, patient
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // today, tomorrow, week, all
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': case 'CANCELLED_BY_PATIENT': case 'CANCELLED_BY_CLINIC': 
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_PAYMENT': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': case 'CANCELLED_BY_PATIENT': case 'CANCELLED_BY_CLINIC': 
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PENDING_PAYMENT': return 'Chờ thanh toán';
      case 'CANCELLED': return 'Đã hủy';
      case 'CANCELLED_BY_PATIENT': return 'Bệnh nhân hủy';
      case 'CANCELLED_BY_CLINIC': return 'Phòng khám hủy';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  };

  // Filtered and sorted appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments.filter(apt => {
      // Filter by status
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
      
      // Filter by date
      const aptDate = new Date(apt.appointmentDateTime || apt.appointmentDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (filterDate) {
        case 'today':
          if (aptDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'tomorrow':
          if (aptDate.toDateString() !== tomorrow.toDateString()) return false;
          break;
        case 'week':
          if (aptDate < today || aptDate > nextWeek) return false;
          break;
        default:
          break;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const patientName = apt.patient?.fullName?.toLowerCase() || '';
        const patientPhone = apt.patient?.phoneNumber?.toLowerCase() || '';
        const reason = apt.reasonForVisit?.toLowerCase() || '';
        
        if (!patientName.includes(query) && 
            !patientPhone.includes(query) && 
            !reason.includes(query)) {
          return false;
        }
      }
      
      return true;
    });

    // Sort appointments
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date': {
          const dateA = new Date(a.appointmentDateTime || a.appointmentDate);
          const dateB = new Date(b.appointmentDateTime || b.appointmentDate);
          comparison = dateA - dateB;
          break;
        }
        case 'patient': {
          const nameA = a.patient?.fullName || '';
          const nameB = b.patient?.fullName || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'status': {
          comparison = a.status.localeCompare(b.status);
          break;
        }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [appointments, sortBy, sortOrder, filterStatus, filterDate, searchQuery]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDateTime || apt.appointmentDate).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDateTime || apt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status === 'CONFIRMED';
  })
  .sort((a, b) => new Date(a.appointmentDateTime || a.appointmentDate) - new Date(b.appointmentDateTime || b.appointmentDate))
  .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              Quản lý lịch hẹn
            </h2>
            <p className="text-blue-100 mt-2 text-lg">
              Theo dõi và quản lý tất cả lịch hẹn với bệnh nhân của bạn
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{stats.todayAppointments}</div>
            <div className="text-blue-100 text-sm">lịch hẹn hôm nay</div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</p>
              <p className="text-xs text-green-600">✓ Đã khám xong</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-10 w-10 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng cộng</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
              <p className="text-xs text-blue-600">📊 Tất cả lịch hẹn</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hôm nay</p>
              <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
              <p className="text-xs text-yellow-600">⏰ Lịch hẹn hôm nay</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã hủy</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cancelledAppointments}</p>
              <p className="text-xs text-red-600">✗ Bị hủy bỏ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-green-600" />
              Lịch hẹn hôm nay
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.appointment_id || appointment.appointmentId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patient?.fullName || 'Bệnh nhân'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{getStatusText(appointment.status)}</span>
                      </span>
                      <button
                        onClick={() => handleViewAppointmentDetails(appointment.appointment_id || appointment.appointmentId)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Không có lịch hẹn nào hôm nay</p>
                <p className="text-sm">Hãy nghỉ ngơi hoặc cập nhật lịch làm việc!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
              Lịch hẹn sắp tới
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.appointment_id || appointment.appointmentId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patient?.fullName || 'Bệnh nhân'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewAppointmentDetails(appointment.appointment_id || appointment.appointmentId)}
                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Không có lịch hẹn nào sắp tới</p>
                <p className="text-sm">Tất cả lịch hẹn đã được hoàn thành!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters and Search */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả ngày</option>
                <option value="today">Hôm nay</option>
                <option value="tomorrow">Ngày mai</option>
                <option value="week">Tuần này</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị {filteredAndSortedAppointments.length} / {appointments.length} lịch hẹn
        </div>
      </div>

      {/* Enhanced Appointments Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Danh sách lịch hẹn ({filteredAndSortedAppointments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('patient')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Bệnh nhân</span>
                    {getSortIcon('patient')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Ngày & Giờ</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý do khám
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Trạng thái</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedAppointments.length > 0 ? (
                filteredAndSortedAppointments.map((appointment) => (
                  <tr key={appointment.appointment_id || appointment.appointmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.fullName || 'Chưa có thông tin'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.patient?.phoneNumber || 'N/A'}</span>
                          </div>
                          {appointment.patient?.email && (
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{appointment.patient.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="flex items-start space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {appointment.reasonForVisit || 'Khám tổng quát'}
                          </span>
                        </div>
                      </div>
                      {appointment.specialty && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {appointment.specialty.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{getStatusText(appointment.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewAppointmentDetails(appointment.appointment_id || appointment.appointmentId)}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
                      <p className="text-gray-500">
                        {searchQuery || filterStatus !== 'all' || filterDate !== 'all' 
                          ? 'Thử điều chỉnh bộ lọc để xem thêm kết quả'
                          : 'Chưa có lịch hẹn nào được tạo'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
