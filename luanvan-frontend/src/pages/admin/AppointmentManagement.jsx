import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar, 
  Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xác nhận', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
    { value: 'NO_SHOW', label: 'Không đến', color: 'gray' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAppointments();
      setAppointments(response.content || response || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await adminService.updateAppointmentStatus(appointmentId, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Lỗi khi cập nhật trạng thái: ' + error.message);
    }
  };

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'gray';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    const matchesDate = !dateFilter || 
      appointment.appointmentDateTime?.startsWith(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Lịch hẹn</h2>
          <div className="text-sm text-gray-500">
            Tổng: {filteredAppointments.length} lịch hẹn
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setDateFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lý do khám
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient?.phoneNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.doctor?.fullName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.specialty?.name || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {appointment.appointmentDateTime?.split('T')[0] || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.appointmentDateTime?.split('T')[1]?.split('.')[0] || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.appointmentId, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800`}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {appointment.reasonForVisit || 'Không có lý do khám'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openDetailsModal(appointment)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch hẹn</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || dateFilter 
                ? 'Không tìm thấy lịch hẹn phù hợp với bộ lọc.'
                : 'Chưa có lịch hẹn nào trong hệ thống.'}
            </p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chi tiết lịch hẹn #{selectedAppointment.appointmentId}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin bệnh nhân</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedAppointment.patient?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedAppointment.patient?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedAppointment.patient?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin bác sĩ</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedAppointment.doctor?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedAppointment.doctor?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Chuyên khoa: {selectedAppointment.specialty?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin lịch hẹn</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Ngày: {selectedAppointment.appointmentDateTime?.split('T')[0] || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Giờ: {selectedAppointment.appointmentDateTime?.split('T')[1]?.split('.')[0] || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Trạng thái: </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(selectedAppointment.status)}-100 text-${getStatusColor(selectedAppointment.status)}-800`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </div>

                  {selectedAppointment.reasonForVisit && (
                    <div>
                      <span className="text-sm font-medium">Lý do khám: </span>
                      <p className="text-sm text-gray-700 mt-1">{selectedAppointment.reasonForVisit}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Tạo lúc: {selectedAppointment.bookingTimestamp ? new Date(selectedAppointment.bookingTimestamp).toLocaleString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement; 