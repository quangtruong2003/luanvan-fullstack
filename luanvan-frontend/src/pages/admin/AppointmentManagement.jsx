import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar, 
  Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Save
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

const AppointmentManagement = () => {
  // Notification system
  const { showSuccess, showError } = useNotification();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    specialtyId: '',
    clinicId: '',
    appointmentDateTime: '',
    reasonForVisit: '',
    status: 'PENDING'
  });

  // State for cascading dropdowns
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableClinics, setAvailableClinics] = useState([]);

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xác nhận', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
    { value: 'NO_SHOW', label: 'Không đến', color: 'gray' }
  ];

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchClinics();
    fetchSpecialties();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAppointments();
      const appointmentsData = response.content || response || [];
      
      console.log('🏥 Raw appointments response:', response);
      console.log('🏥 Appointments data array:', appointmentsData);
      console.log('🏥 First appointment structure:', appointmentsData[0]);
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showError('Không thể tải danh sách lịch hẹn', 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiService.getDoctors();
      const doctorsData = response.content || response || [];
      console.log('👨‍⚕️ Doctors data:', doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await adminService.getAllUsers();
      const allUsers = response.content || response || [];
      console.log('👥 All users data:', allUsers);
      
      const patientUsers = allUsers.filter(user => 
        (user.roleName || user.role_name || user.role?.name) === 'PATIENT'
      );
      console.log('🤒 Patient users:', patientUsers);
      setPatients(patientUsers);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await apiService.getClinics();
      setClinics(response.content || response || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await apiService.getSpecialties();
      setSpecialties(response.content || response || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await adminService.updateAppointmentStatus(appointmentId, { status: newStatus });
      await fetchAppointments();
      const statusText = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
      showSuccess(`Trạng thái cuộc hẹn đã được cập nhật thành: ${statusText}`, 'Cập nhật thành công');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showError(error.message, 'Lỗi khi cập nhật trạng thái');
    }
  };

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setAvailableSpecialties(specialties);
    setAvailableClinics(clinics);
    setShowCreateModal(true);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    const dateTimeValue = appointment.appointmentDateTime || appointment.appointment_date_time || '';
    const appointmentDate = dateTimeValue.split('T')[0] || '';
    const appointmentTime = dateTimeValue.split('T')[1]?.substring(0, 5) || '';
    
    console.log('🔧 Edit appointment data:', appointment);
    
    setFormData({
      patientId: appointment.patient?.userId || 
                appointment.patient?.user_id || 
                appointment.patient?.user?.userId ||
                appointment.patient?.user?.user_id ||
                appointment.patient?.id || '',
      doctorId: appointment.doctor?.doctorId || 
               appointment.doctor?.doctor_id || 
               appointment.doctor?.userId ||
               appointment.doctor?.user_id ||
               appointment.doctor?.user?.userId ||
               appointment.doctor?.user?.user_id ||
               appointment.doctor?.id || '',
      specialtyId: appointment.specialty?.specialtyId || 
                  appointment.specialty?.specialty_id || 
                  appointment.specialty?.id || '',
      clinicId: appointment.clinic?.clinicId || 
               appointment.clinic?.clinic_id || 
               appointment.clinic?.id || '',
      appointmentDateTime: `${appointmentDate}T${appointmentTime}`,
      reasonForVisit: appointment.reasonForVisit || appointment.reason_for_visit || '',
      status: appointment.status || 'PENDING'
    });

    // Populate dropdowns for edit modal
    const doctorId = appointment.doctor?.doctorId || appointment.doctor?.doctor_id;
    if (doctorId) {
        const selectedDoctor = doctors.find(d => (d.doctorId || d.doctor_id) == doctorId);
        setAvailableSpecialties(selectedDoctor?.specialties || []);
    }

    const specialtyId = appointment.specialty?.specialtyId || appointment.specialty?.specialty_id;
    if (specialtyId) {
        const selectedSpecialty = specialties.find(s => (s.specialtyId || s.specialty_id) == specialtyId);
        setAvailableClinics(selectedSpecialty?.clinic ? [selectedSpecialty.clinic] : []);
    }

    setShowEditModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      specialtyId: '',
      clinicId: '',
      appointmentDateTime: '',
      reasonForVisit: '',
      status: 'PENDING'
    });
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        specialtyId: parseInt(formData.specialtyId),
        clinicId: parseInt(formData.clinicId),
        appointmentDateTime: formData.appointmentDateTime,
        reasonForVisit: formData.reasonForVisit,
        depositAmount: 0,
        isDepositPaid: false,
        isDepositNonRefundable: false
      };

      await adminService.createAppointment(appointmentData);
      await fetchAppointments();
      setShowCreateModal(false);
      resetForm();
      showSuccess('Lịch hẹn đã được tạo thành công!', 'Tạo thành công');
    } catch (error) {
      console.error('Error creating appointment:', error);
      showError(error.message, 'Lỗi khi tạo lịch hẹn');
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentId = selectedAppointment?.appointmentId || selectedAppointment?.appointment_id || selectedAppointment?.id;
      if (!appointmentId) {
          showError('Không tìm thấy ID lịch hẹn.');
          return;
      }

      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        specialtyId: parseInt(formData.specialtyId),
        clinicId: parseInt(formData.clinicId),
        appointmentDateTime: formData.appointmentDateTime,
        reasonForVisit: formData.reasonForVisit,
        status: formData.status
      };

      await adminService.updateAppointment(appointmentId, appointmentData);
      await fetchAppointments();
      setShowEditModal(false);
      resetForm();
      showSuccess('Lịch hẹn đã được cập nhật thành công!', 'Cập nhật thành công');
    } catch (error) {
      console.error('Error updating appointment:', error);
      showError(error.message, 'Lỗi khi cập nhật lịch hẹn');
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      const appointmentId = selectedAppointment?.appointmentId || selectedAppointment?.appointment_id || selectedAppointment?.id;
      if (!appointmentId) {
          showError('Không tìm thấy ID lịch hẹn.');
          setShowDeleteModal(false);
          return;
      }
      await adminService.deleteAppointment(appointmentId);
      await fetchAppointments();
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      showSuccess('Lịch hẹn đã được xóa thành công!', 'Xóa thành công');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showError(error.message, 'Lỗi khi xóa lịch hẹn');
    }
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
    const patientName = appointment.patient?.user?.fullName || 
                       appointment.patient?.user?.full_name ||
                       appointment.patient?.fullName || 
                       appointment.patient?.full_name ||
                       appointment.patient?.name || '';

    const doctorName = appointment.doctor?.user?.fullName || 
                      appointment.doctor?.user?.full_name ||
                      appointment.doctor?.fullName || 
                      appointment.doctor?.full_name ||
                      appointment.doctor?.name || '';

    const reasonForVisit = appointment.reasonForVisit || appointment.reason_for_visit || '';

    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    const appointmentDateTime = appointment.appointmentDateTime || appointment.appointment_date_time || '';
    const matchesDate = !dateFilter || appointmentDateTime.startsWith(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Debug filtered appointments
  console.log('📊 All appointments:', appointments);
  console.log('📊 Filtered appointments:', filteredAppointments);
  console.log('📊 Search term:', searchTerm);
  console.log('📊 Status filter:', statusFilter);
  console.log('📊 Date filter:', dateFilter);

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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Tổng: {filteredAppointments.length} lịch hẹn
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm lịch hẹn
            </button>
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
              {filteredAppointments.map((appointment) => {
                console.log('🔍 Rendering appointment:', appointment);
                return (
                <tr key={appointment.appointmentId || appointment.appointment_id || appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.user?.fullName || 
                           appointment.patient?.user?.full_name ||
                           appointment.patient?.fullName || 
                           appointment.patient?.full_name ||
                           appointment.patient?.name ||
                           'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient?.user?.phoneNumber || 
                           appointment.patient?.user?.phone_number ||
                           appointment.patient?.phoneNumber || 
                           appointment.patient?.phone_number ||
                           'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.doctor?.user?.fullName || 
                       appointment.doctor?.user?.full_name ||
                       appointment.doctor?.fullName || 
                       appointment.doctor?.full_name ||
                       appointment.doctor?.name ||
                       'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.specialty?.name || 
                       appointment.specialty?.specialty_name ||
                       'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {(appointment.appointmentDateTime || appointment.appointment_date_time)?.split('T')[0] || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {(appointment.appointmentDateTime || appointment.appointment_date_time)?.split('T')[1]?.split('.')[0] || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(
                        appointment.appointmentId || appointment.appointment_id || appointment.id, 
                        e.target.value
                      )}
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
                      {appointment.reasonForVisit || appointment.reason_for_visit || 'Không có lý do khám'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openDetailsModal(appointment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(appointment)}
                        className="text-green-600 hover:text-green-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(appointment)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
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
                      <span className="text-sm">
                        {selectedAppointment.patient?.user?.fullName || 
                         selectedAppointment.patient?.user?.full_name ||
                         selectedAppointment.patient?.fullName || 
                         selectedAppointment.patient?.full_name ||
                         selectedAppointment.patient?.name ||
                         'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {selectedAppointment.patient?.user?.phoneNumber || 
                         selectedAppointment.patient?.user?.phone_number ||
                         selectedAppointment.patient?.phoneNumber || 
                         selectedAppointment.patient?.phone_number ||
                         'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {selectedAppointment.patient?.user?.email || 
                         selectedAppointment.patient?.email ||
                         'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin bác sĩ</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {selectedAppointment.doctor?.user?.fullName || 
                         selectedAppointment.doctor?.user?.full_name ||
                         selectedAppointment.doctor?.fullName || 
                         selectedAppointment.doctor?.full_name ||
                         selectedAppointment.doctor?.name ||
                         'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {selectedAppointment.doctor?.user?.phoneNumber || 
                         selectedAppointment.doctor?.user?.phone_number ||
                         selectedAppointment.doctor?.phoneNumber || 
                         selectedAppointment.doctor?.phone_number ||
                         'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Chuyên khoa: {selectedAppointment.specialty?.name || 
                                   selectedAppointment.specialty?.specialty_name ||
                                   'N/A'}
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

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo lịch hẹn mới</h3>
              <form onSubmit={handleCreateAppointment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bệnh nhân *
                    </label>
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn bệnh nhân</option>
                      {patients.map(patient => (
                        <option key={patient.userId || patient.user_id} value={patient.userId || patient.user_id}>
                          {patient.fullName || patient.full_name} - {patient.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bác sĩ *
                    </label>
                    <select
                      required
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map(doctor => (
                        <option key={doctor.doctorId || doctor.doctor_id} value={doctor.doctorId || doctor.doctor_id}>
                          {doctor.user?.fullName || doctor.user?.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên khoa *
                    </label>
                    <select
                      required
                      value={formData.specialtyId}
                      onChange={(e) => setFormData({...formData, specialtyId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn chuyên khoa</option>
                      {availableSpecialties.map(specialty => (
                        <option key={specialty.specialtyId || specialty.specialty_id} value={specialty.specialtyId || specialty.specialty_id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng khám *
                    </label>
                    <select
                      required
                      value={formData.clinicId}
                      onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn phòng khám</option>
                      {availableClinics.map(clinic => (
                        <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian hẹn *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.appointmentDateTime}
                      onChange={(e) => setFormData({...formData, appointmentDateTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do khám
                    </label>
                    <textarea
                      rows="3"
                      value={formData.reasonForVisit}
                      onChange={(e) => setFormData({...formData, reasonForVisit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập lý do khám..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Tạo lịch hẹn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa lịch hẹn #{selectedAppointment.appointmentId}
              </h3>
              <form onSubmit={handleUpdateAppointment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bệnh nhân *
                    </label>
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn bệnh nhân</option>
                      {patients.map(patient => (
                        <option key={patient.userId || patient.user_id} value={patient.userId || patient.user_id}>
                          {patient.fullName || patient.full_name} - {patient.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bác sĩ *
                    </label>
                    <select
                      required
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map(doctor => (
                        <option key={doctor.doctorId || doctor.doctor_id} value={doctor.doctorId || doctor.doctor_id}>
                          {doctor.user?.fullName || doctor.user?.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên khoa *
                    </label>
                    <select
                      required
                      value={formData.specialtyId}
                      onChange={(e) => setFormData({...formData, specialtyId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn chuyên khoa</option>
                      {availableSpecialties.map(specialty => (
                        <option key={specialty.specialtyId || specialty.specialty_id} value={specialty.specialtyId || specialty.specialty_id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng khám *
                    </label>
                    <select
                      required
                      value={formData.clinicId}
                      onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn phòng khám</option>
                      {availableClinics.map(clinic => (
                        <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian hẹn *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.appointmentDateTime}
                      onChange={(e) => setFormData({...formData, appointmentDateTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do khám
                    </label>
                    <textarea
                      rows="3"
                      value={formData.reasonForVisit}
                      onChange={(e) => setFormData({...formData, reasonForVisit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập lý do khám..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Appointment Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa lịch hẹn</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Bạn có chắc chắn muốn xóa lịch hẹn này không?
                </p>
                
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm font-medium">Lịch hẹn #{selectedAppointment.appointmentId || selectedAppointment.appointment_id || selectedAppointment.id}</p>
                  <p className="text-sm text-gray-600">
                    Bệnh nhân: {
                      selectedAppointment.patient?.user?.fullName ||
                      selectedAppointment.patient?.user?.full_name ||
                      selectedAppointment.patient?.fullName ||
                      selectedAppointment.patient?.full_name ||
                      selectedAppointment.patient?.name ||
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    Bác sĩ: {
                      selectedAppointment.doctor?.user?.fullName ||
                      selectedAppointment.doctor?.user?.full_name ||
                      selectedAppointment.doctor?.fullName ||
                      selectedAppointment.doctor?.full_name ||
                      selectedAppointment.doctor?.name ||
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    Thời gian: {(selectedAppointment.appointmentDateTime || selectedAppointment.appointment_date_time) ? 
                      new Date(selectedAppointment.appointmentDateTime || selectedAppointment.appointment_date_time).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                
                <p className="text-xs text-red-600 mt-2">
                  * Hành động này không thể hoàn tác
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAppointment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa lịch hẹn
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