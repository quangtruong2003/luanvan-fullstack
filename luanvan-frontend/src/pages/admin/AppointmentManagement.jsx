import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Calendar, 
  Clock, User, CheckCircle, XCircle, AlertCircle, Save, Building, Stethoscope, Sun, Moon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminService, apiService, API_BASE_URL } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

const AppointmentManagement = ({ filters, setFilters }) => {
  // Notification system
  const { showSuccess, showError, showApiError } = useNotification();
  
  // Helper function to extract a more detailed error message from API responses
  const getApiErrorMessage = (error, defaultMessage) => {
    if (error?.response?.data?.message) {
      // Message from backend's structured error response
      return error.response.data.message;
    }
    // Fallback to the general error message
    return error.message || defaultMessage;
  };

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;
  
  // Local filter states are now controlled by the parent component's state
  const searchTerm = filters?.searchTerm || '';
  const statusFilter = filters?.statusFilter || '';
  const dateFilter = filters?.dateFilter || '';
  const clinicFilter = filters?.clinicId || '';
  const doctorFilter = filters?.doctorId || '';
  const timeOfDayFilter = filters?.timeOfDay || ''; // 'morning', 'afternoon'
  const specialtyFilter = filters?.specialtyId || '';

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
    status: 'PENDING_PAYMENT',
    slotId: null,
  });

  // State for cascading dropdowns and slot selection
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableClinics, setAvailableClinics] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // sắp xếp theo ngày hẹn 
  const [bookingSortOrder, setBookingSortOrder] = useState('asc'); // sắp xếp theo thời gian đặt lịch (mới nhất trước)
  const [primarySort, setPrimarySort] = useState('appointment'); // 'appointment' hoặc 'booking' 

  // State for cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [appointmentToCancel, setAppointmentToCancel] = useState(null); // {id, status}

  // Fetch appointments function - moved here to avoid hoisting issues
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAppointments();
      const appointmentsData = response.content || response || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showApiError(error, 'tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  // Other fetch functions - moved here to avoid hoisting issues
  const fetchDoctors = async () => {
    try {
      const response = await apiService.getDoctors();
      const doctorsData = response.content || response || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await adminService.getAllUsers();
      const allUsers = response.content || response || [];
      const patientUsers = allUsers.filter(user => 
        (user.roleName || user.role_name || user.role?.name) === 'PATIENT'
      );
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

  // Effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, clinicFilter, doctorFilter, timeOfDayFilter, specialtyFilter]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchClinics();
    fetchSpecialties();
  }, [fetchAppointments]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // fetchAppointments(); -> Loại bỏ dòng này để không fetch lại khi filter
  }, [filters, sortOrder, bookingSortOrder, primarySort]); // Re-sort when any sort parameter changes

  const statusOptions = [
    { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán', color: 'orange' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    //{ value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED_BY_PATIENT', label: 'Hủy bởi bệnh nhân', color: 'red' },
    { value: 'CANCELLED_BY_CLINIC', label: 'Hủy bởi phòng khám', color: 'red' },
    { value: 'PAYMENT_FAILED', label: 'Thanh toán thất bại', color: 'gray' },
    //{ value: 'NO_SHOW', label: 'Không đến', color: 'gray' }
  ];

  const handleStatusChange = async (appointmentId, newStatus) => {
    const isCancellation = newStatus === 'CANCELLED_BY_PATIENT' || newStatus === 'CANCELLED_BY_CLINIC';

    if (isCancellation) {
      setAppointmentToCancel({ id: appointmentId, status: newStatus });
      setCancellationReason('');
      setIsCancelModalOpen(true);
      return; // Stop execution here and wait for modal input
    }
    
    // Existing logic for other status changes
    try {
      // For non-cancellation, we send a simple status update
      await adminService.updateAppointmentStatus(appointmentId, { status: newStatus });
      showSuccess('Trạng thái lịch hẹn đã được cập nhật.');
      await fetchAppointments(); // Refetch to ensure UI consistency
    } catch (error) {
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      const errorMessage = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật trạng thái.');
      showError(errorMessage);
    }
  };
  
  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) return;

    const { id, status } = appointmentToCancel;
    const reason = cancellationReason.trim() || 'Không có lý do cụ thể';

    try {
      // Pass the reason to the API
      const payload = {
        status: status,
        cancellationReason: reason
      };
      await adminService.updateAppointmentStatus(id, payload);
      
      // Update local state by refetching
      await fetchAppointments();
      showSuccess('Lịch hẹn đã được hủy thành công.');
    } catch (error) {
       console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      const errorMessage = getApiErrorMessage(error, 'Có lỗi xảy ra khi hủy lịch hẹn.');
      showError(errorMessage);
    } finally {
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason('');
    }
  };

  const openCreateModal = () => {
    console.log('📋 Opening create modal');
    console.log('📋 Initial data - Patients:', patients.length, 'Doctors:', doctors.length, 'Specialties:', specialties.length, 'Clinics:', clinics.length);
    resetForm();
    setAvailableSpecialties(specialties);
    setAvailableClinics(clinics);
    setShowCreateModal(true);
  };

  const openEditModal = (appointment) => {
    console.log('🔧 Opening edit modal for appointment:', appointment);
    
    // Kiểm tra trạng thái lịch hẹn trước khi cho phép chỉnh sửa
    if (appointment.status !== 'CONFIRMED') {
      const statusText = statusOptions.find(s => s.value === appointment.status)?.label || appointment.status;
      showError(`Chỉ có thể chỉnh sửa lịch hẹn ở trạng thái 'Đã xác nhận'. Trạng thái hiện tại: ${statusText}`, 'Không thể chỉnh sửa');
      return;
    }
    
    setSelectedAppointment(appointment);
    
    // Extract appointment data
    const dateTimeValue = appointment.appointmentDateTime || appointment.appointment_date_time || '';
    const appointmentDate = dateTimeValue.split('T')[0] || '';
    const appointmentTime = dateTimeValue.split('T')[1]?.substring(0, 5) || '';
    
    // Extract IDs - try multiple possible field names for robustness
    const patientId = appointment.patient?.userId || 
                     appointment.patient?.user_id || 
                     appointment.patient?.user?.userId ||
                     appointment.patient?.user?.user_id ||
                     appointment.patient?.id || '';
                     
    const doctorId = appointment.doctor?.doctorId || 
                    appointment.doctor?.doctor_id || 
                    appointment.doctor?.userId ||
                    appointment.doctor?.user_id ||
                    appointment.doctor?.user?.userId ||
                    appointment.doctor?.user?.user_id ||
                    appointment.doctor?.id || '';
                    
    const specialtyId = appointment.specialty?.specialtyId || 
                       appointment.specialty?.specialty_id || 
                       appointment.specialty?.id || '';
                       
    const clinicId = appointment.clinic?.clinicId || 
                    appointment.clinic?.clinic_id || 
                    appointment.clinic?.id || '';

    console.log('🔧 Extracted IDs:', { patientId, doctorId, specialtyId, clinicId });

    // Start with all available options (same as create modal)
    setAvailableSpecialties(specialties);
    setAvailableClinics(clinics);
    setAvailableSlots([]);
    setSelectedDate(appointmentDate);

    // Set form data
    setFormData({
      patientId: patientId,
      doctorId: doctorId,
      specialtyId: specialtyId,
      clinicId: clinicId,
      appointmentDateTime: `${appointmentDate}T${appointmentTime}`,
      reasonForVisit: appointment.reasonForVisit || appointment.reason_for_visit || '',
      status: appointment.status || 'PENDING_PAYMENT',
      slotId: appointment.slot?.slotId || appointment.slot?.slot_id || null,
    });

    // Now apply the cascading logic (same as create modal)
    // Step 1: If doctor is selected, filter specialties
    if (doctorId) {
      const selectedDoctor = doctors.find(d => (d.doctorId || d.doctor_id) == doctorId);
      console.log('🔧 Found doctor for edit:', selectedDoctor);
      
      if (selectedDoctor && selectedDoctor.specialties && selectedDoctor.specialties.length > 0) {
        console.log('🔧 Setting doctor specialties:', selectedDoctor.specialties);
        setAvailableSpecialties(selectedDoctor.specialties);
      } else {
        console.log('🔧 No doctor specialties found, using all specialties');
        setAvailableSpecialties(specialties);
      }
    }

    // Step 2: If specialty is selected, filter clinics
    if (specialtyId) {
      // Find specialty in the available specialties (not all specialties)
      const selectedSpecialty = specialties.find(s => (s.specialtyId || s.specialty_id) == specialtyId);
      console.log('🔧 Found specialty for edit:', selectedSpecialty);
      
      if (selectedSpecialty && selectedSpecialty.clinic) {
        console.log('🔧 Setting specialty clinic:', selectedSpecialty.clinic);
        setAvailableClinics([selectedSpecialty.clinic]);
      } else {
        console.log('🔧 No specific clinic for specialty, using all clinics');
        setAvailableClinics(clinics);
      }
    }

    setShowEditModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    console.log('🔄 Resetting form');
    const newFormData = {
      patientId: '',
      doctorId: '',
      specialtyId: '',
      clinicId: '',
      appointmentDateTime: '',
      reasonForVisit: '',
      status: 'PENDING_PAYMENT',
      slotId: null,
    };
    console.log('🔄 New form data:', newFormData);
    setFormData(newFormData);
    setAvailableSpecialties([]);
    setAvailableClinics([]);
    setAvailableSlots([]);
    setSelectedDate('');
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      // Detailed validation with specific error messages
      console.log('🔍 Form validation - current formData:', formData);

      if (!formData.patientId) {
        showError('Vui lòng chọn bệnh nhân.');
        return;
      }
      if (!formData.doctorId) {
        showError('Vui lòng chọn bác sĩ.');
        return;
      }
      if (!formData.specialtyId) {
        showError('Vui lòng chọn chuyên khoa.');
        return;
      }
      if (!formData.clinicId) {
        showError('Vui lòng chọn phòng khám.');
        return;
      }
      if (!selectedDate) {
        showError('Vui lòng chọn ngày hẹn.');
        return;
      }
      if (!formData.slotId) {
        showError('Vui lòng chọn khung giờ hẹn.');
        return;
      }
      if (!formData.appointmentDateTime) {
        showError('Thời gian hẹn không hợp lệ.');
        return;
      }

      // Convert to integers and validate
      const patientId = parseInt(formData.patientId);
      const doctorId = parseInt(formData.doctorId);
      const specialtyId = parseInt(formData.specialtyId);
      const clinicId = parseInt(formData.clinicId);
      const slotId = parseInt(formData.slotId);

      if (isNaN(patientId) || isNaN(doctorId) || isNaN(specialtyId) || isNaN(clinicId) || isNaN(slotId)) {
        showError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }

      const appointmentData = {
        patientId: patientId,
        doctorId: doctorId,
        specialtyId: specialtyId,
        clinicId: clinicId,
        appointmentDateTime: formData.appointmentDateTime,
        reasonForVisit: formData.reasonForVisit || '',
        depositAmount: 0,
        isDepositPaid: true,
        slotId: slotId,
      };

      console.log('📤 Sending appointment data:', appointmentData);

      await adminService.createAppointment(appointmentData);
      await fetchAppointments();
      setShowCreateModal(false);
      resetForm();
      showSuccess('Lịch hẹn đã được tạo thành công!', 'Tạo thành công');
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = getApiErrorMessage(error, 'Lỗi khi tạo lịch hẹn');
      showError(errorMessage, 'Lỗi khi tạo lịch hẹn');
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
      const errorMessage = getApiErrorMessage(error, 'Lỗi khi cập nhật lịch hẹn');
      showError(errorMessage, 'Lỗi khi cập nhật lịch hẹn');
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
      const errorMessage = getApiErrorMessage(error, 'Lỗi khi xóa lịch hẹn');

      // Provide a more specific message for conflict errors (e.g., appointment is paid)
      if (error.response && error.response.status === 409) {
          showError('Không thể xóa lịch hẹn này. Lịch hẹn có thể đã được thanh toán hoặc có các ràng buộc khác.', 'Xóa Thất Bại');
      } else {
          showError(errorMessage, 'Lỗi khi xóa lịch hẹn');
      }
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'gray';
  };

  const normalizeText = (text = '') =>
    text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = appointment.patient?.user?.fullName || 
                       appointment.patient?.user?.full_name ||
                       appointment.patient?.fullName || 
                       appointment.patient?.full_name ||
                       appointment.patient?.name || '';
                       
    const patientPhone = appointment.patient?.user?.phoneNumber ||
                        appointment.patient?.user?.phone_number ||
                        appointment.patient?.phoneNumber ||
                        appointment.patient?.phone_number || '';

    const doctorName = appointment.doctor?.user?.fullName || 
                      appointment.doctor?.user?.full_name ||
                      appointment.doctor?.fullName || 
                      appointment.doctor?.full_name ||
                      appointment.doctor?.name || '';
                      
    const doctorPhone = appointment.doctor?.user?.phoneNumber ||
                       appointment.doctor?.user?.phone_number || '';

    const reasonForVisit = appointment.reasonForVisit || appointment.reason_for_visit || '';
    
    const preparedSearchTerm = normalizeText(searchTerm.trim());

    const matchesSearch = 
      normalizeText(patientName).includes(preparedSearchTerm) ||
      normalizeText(doctorName).includes(preparedSearchTerm) ||
      normalizeText(patientPhone).includes(preparedSearchTerm) ||
      normalizeText(doctorPhone).includes(preparedSearchTerm) ||
      normalizeText(reasonForVisit).includes(preparedSearchTerm);
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    
    const appointmentDateTime = appointment.appointmentDateTime || appointment.appointment_date_time || '';
    const matchesDate = !dateFilter || appointmentDateTime.startsWith(dateFilter);
    
    const appointmentClinicId = appointment.clinic?.clinicId?.toString() || appointment.clinic?.clinic_id?.toString();
    const matchesClinic = !clinicFilter || appointmentClinicId === clinicFilter.toString();

    // Corrected logic: Use userId as the consistent key for filtering
    const appointmentDoctorUserId = (
      appointment.doctor?.user?.userId ||
      appointment.doctor?.user?.user_id ||
      appointment.doctor?.userId ||
      appointment.doctor?.user_id
    )?.toString();
    const matchesDoctor = !doctorFilter || (appointmentDoctorUserId && appointmentDoctorUserId === doctorFilter.toString());

    const appointmentSpecialtyId = appointment.specialty?.specialtyId?.toString() || 
                                   appointment.specialty?.specialty_id?.toString() ||
                                   appointment.specialty?.id?.toString();
    const matchesSpecialty = !specialtyFilter || appointmentSpecialtyId === specialtyFilter.toString();

    const appointmentTime = (appointment.appointmentDateTime || appointment.appointment_date_time)?.split('T')[1];
    let matchesTimeOfDay = true;
    if (timeOfDayFilter && appointmentTime) {
      const hour = parseInt(appointmentTime.substring(0, 2));
      if (timeOfDayFilter === 'morning') {
        matchesTimeOfDay = hour < 12;
      } else if (timeOfDayFilter === 'afternoon') {
        matchesTimeOfDay = hour >= 12;
      }
    }

    return matchesSearch && matchesStatus && matchesDate && matchesClinic && matchesDoctor && matchesTimeOfDay && matchesSpecialty;
  });

  // Sorting logic
  const sortedAppointments = filteredAppointments.slice().sort((a, b) => {
    if (primarySort === 'booking') {
      // Primary sort: booking timestamp
      const bookingA = new Date(a.bookingTimestamp || a.booking_timestamp || a.createdAt || a.created_at).getTime();
      const bookingB = new Date(b.bookingTimestamp || b.booking_timestamp || b.createdAt || b.created_at).getTime();
      const bookingSort = bookingSortOrder === 'asc' ? bookingA - bookingB : bookingB - bookingA;
      
      // If booking timestamps are equal, secondary sort by appointment date
      if (bookingSort === 0) {
        const dateA = new Date(a.appointmentDateTime || a.appointment_date_time).getTime();
        const dateB = new Date(b.appointmentDateTime || b.appointment_date_time).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      return bookingSort;
    } else {
      // Primary sort: appointment date/time
      const dateA = new Date(a.appointmentDateTime || a.appointment_date_time).getTime();
      const dateB = new Date(b.appointmentDateTime || b.appointment_date_time).getTime();
      const appointmentSort = sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      
      // If appointment dates are equal, secondary sort by booking timestamp
      if (appointmentSort === 0) {
        const bookingA = new Date(a.bookingTimestamp || a.booking_timestamp || a.createdAt || a.created_at).getTime();
        const bookingB = new Date(b.bookingTimestamp || b.booking_timestamp || b.createdAt || b.created_at).getTime();
        return bookingSortOrder === 'asc' ? bookingA - bookingB : bookingB - bookingA;
      }
      
      return appointmentSort;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- Handlers for cascading dropdowns and slot fetching ---

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const handleDoctorChange = (doctorId) => {
    console.log('🏥 Doctor selected:', doctorId);
    const selectedDoctor = doctors.find(d => (d.doctorId || d.doctor_id) == doctorId);
    console.log('🏥 Selected doctor object:', selectedDoctor);

    setFormData(prev => ({
        ...prev,
        doctorId: doctorId,
        specialtyId: '',
        clinicId: '',
        slotId: null,
        appointmentDateTime: ''
    }));

    if (selectedDoctor && selectedDoctor.specialties && selectedDoctor.specialties.length > 0) {
      console.log('🏥 Doctor specialties:', selectedDoctor.specialties);
      setAvailableSpecialties(selectedDoctor.specialties);
    } else {
      console.log('🏥 No specialties found for doctor, using all specialties');
      setAvailableSpecialties(specialties);
    }
    
    setAvailableClinics([]);
    setAvailableSlots([]);
    setSelectedDate('');
  };

  const handleSpecialtyChange = (specialtyId) => {
    console.log('🩺 Specialty selected:', specialtyId);
    const selectedSpecialty = availableSpecialties.find(s => (s.specialtyId || s.specialty_id) == specialtyId);
    console.log('🩺 Selected specialty object:', selectedSpecialty);
    
    let newClinicId = '';
    let availableClinicsToSet = [];
    
    if (selectedSpecialty && selectedSpecialty.clinic) {
      console.log('🩺 Specialty has specific clinic:', selectedSpecialty.clinic);
      availableClinicsToSet = [selectedSpecialty.clinic];
      newClinicId = selectedSpecialty.clinic.clinicId || selectedSpecialty.clinic.clinic_id;
    } else {
      console.log('🩺 No specific clinic found for specialty, using all clinics');
      availableClinicsToSet = clinics;
      // Auto-select first clinic if there's only one, or leave empty if multiple
      if (clinics.length === 1) {
        newClinicId = clinics[0].clinicId || clinics[0].clinic_id;
        console.log('🩺 Auto-selected single clinic:', newClinicId);
      }
    }
    
    setAvailableClinics(availableClinicsToSet);
    
    setFormData(prev => ({
      ...prev,
      specialtyId: specialtyId,
      clinicId: newClinicId,
      slotId: null,
      appointmentDateTime: ''
    }));
    
    setAvailableSlots([]);
    setSelectedDate('');

    console.log('🩺 Updated formData with specialty:', { specialtyId, clinicId: newClinicId, availableClinics: availableClinicsToSet.length });
  };

  const handleDateChange = async (date) => {
    console.log('📅 Date selected:', date);
    setSelectedDate(date);
    setAvailableSlots([]);
    setFormData(prev => ({...prev, slotId: null, appointmentDateTime: ''}));
    
    const doctorId = formData.doctorId;
    console.log('📅 Doctor ID for slots:', doctorId);
    
    if (!doctorId || !date) {
      console.log('📅 Missing doctorId or date, skipping slot fetch');
      return;
    }

    setSlotsLoading(true);
    try {
      console.log('📅 Fetching slots for doctor:', doctorId, 'date:', date);
      const slots = await apiService.getAvailableSlots(doctorId, date);
      console.log('📅 Retrieved slots:', slots);
      
      const availableSlots = Array.isArray(slots) 
        ? slots.filter(slot => slot.status === 'AVAILABLE')
        : [];
      
      console.log('📅 Available slots:', availableSlots);
      setAvailableSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      showError('Không thể tải danh sách lịch trống của bác sĩ.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    console.log('⏰ Slot selected:', slot);
    const timeString = slot.startTime || slot.start_time;
    const slotId = slot.slotId || slot.slot_id;

    console.log('⏰ Slot details:', { timeString, slotId, selectedDate });

    if (selectedDate && timeString && slotId) {
      // Backend expects format: YYYY-MM-DDTHH:mm:ss
      // Ensure time string is in HH:mm:ss format for consistency
      let formattedTime = timeString;
      if (formattedTime.length === 5) { // Handles HH:mm
        formattedTime = `${formattedTime}:00`;
      } else if (formattedTime.includes('.')) { // Handles HH:mm:ss.sss
        formattedTime = formattedTime.split('.')[0];
      }

      const fullDateTime = `${selectedDate}T${formattedTime}`;
      console.log('⏰ Setting datetime:', fullDateTime, 'slotId:', slotId);
      
      setFormData(prev => ({
        ...prev,
        slotId: slotId,
        appointmentDateTime: fullDateTime,
      }));
    } else {
      console.log('⏰ Missing required data for slot selection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Nhập lý do hủy lịch hẹn</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              rows="4"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Ví dụ: Bệnh nhân yêu cầu đổi lịch, bác sĩ có việc đột xuất..."
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>

      {/* Main content */}
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Lịch hẹn</h1>
        </div>
        {/* Header */}
        <div className="bg-white shadow rounded-lg mx-4 sm:mx-6 lg:mx-8 p-6">
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
          <div className="space-y-4">
            {/* Main Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-grow min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân, bác sĩ, SĐT..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative flex-grow min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
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

              <div className="relative flex-grow min-w-[150px]">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative flex-grow min-w-[150px]">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={timeOfDayFilter}
                  onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Cả ngày</option>
                  <option value="morning">Buổi sáng</option>
                  <option value="afternoon">Buổi chiều</option>
                </select>
              </div>
            </div>
            
            {/* Entity Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-grow min-w-[150px]">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={clinicFilter}
                  onChange={(e) => handleFilterChange('clinicId', e.target.value)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả phòng khám</option>
                  {clinics.map(clinic => (
                    <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative flex-grow min-w-[150px]">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={doctorFilter}
                  onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả bác sĩ</option>
                  {doctors.map(doctor => {
                    const docUser = doctor.user || {};
                    const userId = docUser.userId || docUser.user_id;
                    if (!userId) return null;
                    return (
                      <option key={doctor.doctorId || doctor.doctor_id} value={userId}>
                        {docUser.fullName || docUser.full_name || 'N/A'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="relative flex-grow min-w-[150px]">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={specialtyFilter}
                  onChange={(e) => handleFilterChange('specialtyId', e.target.value)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specialties.map(specialty => (
                    <option key={specialty.specialtyId || specialty.specialty_id} value={specialty.specialtyId || specialty.specialty_id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setFilters({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex-shrink-0"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white shadow rounded-lg mx-4 sm:mx-6 lg:mx-8 overflow-hidden">
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
                    <button 
                      onClick={() => {
                        setPrimarySort('appointment');
                        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="flex items-center space-x-1 focus:outline-none hover:text-gray-800 transition-colors"
                    >
                      <span>NGÀY GIỜ HẸN</span>
                      <span className="text-base">
                        {primarySort === 'appointment' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => {
                        setPrimarySort('booking');
                        setBookingSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="flex items-center space-x-1 focus:outline-none hover:text-gray-800 transition-colors"
                    >
                      <span>THỜI GIAN ĐẶT</span>
                      <span className="text-base">
                        {primarySort === 'booking' ? (bookingSortOrder === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    </button>
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
                {paginatedAppointments.map((appointment) => {
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
                      <div className="text-sm text-gray-900">
                        {appointment.bookingTimestamp || appointment.booking_timestamp || appointment.createdAt || appointment.created_at ? 
                          new Date(appointment.bookingTimestamp || appointment.booking_timestamp || appointment.createdAt || appointment.created_at).toLocaleDateString('vi-VN') : 
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.bookingTimestamp || appointment.booking_timestamp || appointment.createdAt || appointment.created_at ? 
                          new Date(appointment.bookingTimestamp || appointment.booking_timestamp || appointment.createdAt || appointment.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : 
                          'N/A'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.appointmentId || appointment.appointment_id || appointment.id, e.target.value)}
                        className="text-xs font-medium px-2 py-1 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{
                          backgroundColor: getStatusColor(appointment.status) === 'orange' ? '#FEF3C7' :
                                         getStatusColor(appointment.status) === 'blue' ? '#DBEAFE' :
                                         getStatusColor(appointment.status) === 'green' ? '#D1FAE5' :
                                         getStatusColor(appointment.status) === 'red' ? '#FEE2E2' :
                                         getStatusColor(appointment.status) === 'gray' ? '#F3F4F6' : '#F3F4F6',
                          color: getStatusColor(appointment.status) === 'orange' ? '#92400E' :
                                 getStatusColor(appointment.status) === 'blue' ? '#1E40AF' :
                                 getStatusColor(appointment.status) === 'green' ? '#065F46' :
                                 getStatusColor(appointment.status) === 'red' ? '#991B1B' :
                                 getStatusColor(appointment.status) === 'gray' ? '#374151' : '#374151'
                        }}
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
                        {appointment.status === 'CONFIRMED' ? (
                          <button
                            onClick={() => openEditModal(appointment)}
                            className="text-green-600 hover:text-green-900"
                            title="Chỉnh sửa lịch hẹn"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-400 cursor-not-allowed"
                            title={`Chỉ có thể chỉnh sửa lịch hẹn ở trạng thái 'Đã xác nhận'. Trạng thái hiện tại: ${statusOptions.find(s => s.value === appointment.status)?.label || appointment.status}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(appointment)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa lịch hẹn"
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

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  Hiển thị {startIndex + 1} đến {Math.min(endIndex, sortedAppointments.length)} của {sortedAppointments.length} kết quả
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm px-2">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch hẹn</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || dateFilter || clinicFilter || doctorFilter || timeOfDayFilter || specialtyFilter
                  ? 'Không tìm thấy lịch hẹn phù hợp với bộ lọc.'
                  : 'Chưa có lịch hẹn nào trong hệ thống.'}
              </p>
            </div>
          )}
        </div>
      </div>

        {/* Create Appointment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo lịch hẹn mới</h3>
                {/* Debug info */}
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  Debug: Patients: {patients.length}, Doctors: {doctors.length}, 
                  Available Specialties: {availableSpecialties.length}, 
                  Available Clinics: {availableClinics.length},
                  Available Slots: {availableSlots.length}
                </div>
                <form onSubmit={handleCreateAppointment}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bệnh nhân * ({patients.length} bệnh nhân)
                      </label>
                      <select
                        required
                        value={formData.patientId}
                        onChange={(e) => {
                          console.log('👤 Patient selected:', e.target.value);
                          setFormData({...formData, patientId: e.target.value});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn bệnh nhân</option>
                        {patients.map(patient => {
                          const patientId = patient.userId || patient.user_id;
                          const patientName = patient.fullName || patient.full_name;
                          return (
                            <option key={patientId} value={patientId}>
                              {patientName} - {patient.email}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bác sĩ *
                      </label>
                      <select
                        required
                        value={formData.doctorId}
                        onChange={(e) => handleDoctorChange(e.target.value)}
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
                        onChange={(e) => handleSpecialtyChange(e.target.value)}
                        disabled={!formData.doctorId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                        Phòng khám * ({availableClinics.length} phòng khám)
                      </label>
                      <select
                        required
                        value={formData.clinicId}
                        onChange={(e) => {
                          console.log('🏥 Clinic selected:', e.target.value);
                          setFormData({...formData, clinicId: e.target.value});
                        }}
                        disabled={!formData.specialtyId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        title={`Specialty selected: ${formData.specialtyId}, Available clinics: ${availableClinics.length}`}
                      >
                        <option value="">Chọn phòng khám</option>
                        {availableClinics.map(clinic => {
                          const clinicId = clinic.clinicId || clinic.clinic_id;
                          return (
                            <option key={clinicId} value={clinicId}>
                              {clinic.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn ngày hẹn *
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        disabled={!formData.specialtyId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {/* Slot selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn khung giờ *
                      </label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {availableSlots.length > 0 ? (
                            availableSlots.map(slot => {
                              const time = slot.startTime || slot.start_time;
                              const currentSlotId = slot.slotId || slot.slot_id;
                              const isSelected = formData.slotId === currentSlotId;
                              return (
                                <button
                                  type="button"
                                  key={currentSlotId}
                                  onClick={() => {
                                    console.log('⏰ Slot clicked:', slot);
                                    handleSlotSelect(slot);
                                  }}
                                  className={`px-2 py-2 text-sm rounded-lg text-center border ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-blue-700 border-blue-500 hover:bg-blue-50'
                                  }`}
                                  title={`Slot ID: ${currentSlotId}, Time: ${time}, Selected: ${isSelected}`}
                                >
                                  {time ? time.substring(0, 5) : 'N/A'}
                                </button>
                              )
                            })
                          ) : (
                            selectedDate && <p className="text-sm text-gray-500 col-span-full">Không có lịch trống trong ngày này.</p>
                          )}
                        </div>
                      )}
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

                  {/* Current form values debug */}
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Current Form Values:</strong><br/>
                    PatientId: {formData.patientId}<br/>
                    DoctorId: {formData.doctorId}<br/>
                    SpecialtyId: {formData.specialtyId}<br/>
                    ClinicId: {formData.clinicId}<br/>
                    SlotId: {formData.slotId}<br/>
                    SelectedDate: {selectedDate}<br/>
                    AppointmentDateTime: {formData.appointmentDateTime}<br/>
                    ReasonForVisit: {formData.reasonForVisit}
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
                  Chỉnh sửa lịch hẹn #{selectedAppointment.appointmentId || selectedAppointment.appointment_id || selectedAppointment.id}
                </h3>
                {/* Debug info */}
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  Debug: Patients: {patients.length}, Doctors: {doctors.length}, 
                  Available Specialties: {availableSpecialties.length}, 
                  Available Clinics: {availableClinics.length},
                  Available Slots: {availableSlots.length}
                </div>
                <form onSubmit={handleUpdateAppointment}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bệnh nhân * ({patients.length} bệnh nhân)
                      </label>
                      <select
                        required
                        value={formData.patientId}
                        onChange={(e) => {
                          console.log('👤 Patient selected:', e.target.value);
                          setFormData({...formData, patientId: e.target.value});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn bệnh nhân</option>
                        {patients.map(patient => {
                          const patientId = patient.userId || patient.user_id;
                          const patientName = patient.fullName || patient.full_name;
                          return (
                            <option key={patientId} value={patientId}>
                              {patientName} - {patient.email}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bác sĩ *
                      </label>
                      <select
                        required
                        value={formData.doctorId}
                        onChange={(e) => handleDoctorChange(e.target.value)}
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
                        onChange={(e) => handleSpecialtyChange(e.target.value)}
                        disabled={!formData.doctorId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                        Phòng khám * ({availableClinics.length} phòng khám)
                      </label>
                      <select
                        required
                        value={formData.clinicId}
                        onChange={(e) => {
                          console.log('🏥 Clinic selected:', e.target.value);
                          setFormData({...formData, clinicId: e.target.value});
                        }}
                        disabled={!formData.specialtyId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        title={`Specialty selected: ${formData.specialtyId}, Available clinics: ${availableClinics.length}`}
                      >
                        <option value="">Chọn phòng khám</option>
                        {availableClinics.map(clinic => {
                          const clinicId = clinic.clinicId || clinic.clinic_id;
                          return (
                            <option key={clinicId} value={clinicId}>
                              {clinic.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn ngày hẹn *
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        disabled={!formData.specialtyId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {/* Slot selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn khung giờ *
                      </label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {availableSlots.length > 0 ? (
                            availableSlots.map(slot => {
                              const time = slot.startTime || slot.start_time;
                              const currentSlotId = slot.slotId || slot.slot_id;
                              const isSelected = formData.slotId === currentSlotId;
                              return (
                                <button
                                  type="button"
                                  key={currentSlotId}
                                  onClick={() => {
                                    console.log('⏰ Slot clicked:', slot);
                                    handleSlotSelect(slot);
                                  }}
                                  className={`px-2 py-2 text-sm rounded-lg text-center border ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-blue-700 border-blue-500 hover:bg-blue-50'
                                  }`}
                                  title={`Slot ID: ${currentSlotId}, Time: ${time}, Selected: ${isSelected}`}
                                >
                                  {time ? time.substring(0, 5) : 'N/A'}
                                </button>
                              )
                            })
                          ) : (
                            selectedDate && <p className="text-sm text-gray-500 col-span-full">Không có lịch trống trong ngày này.</p>
                          )}
                        </div>
                      )}
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

                    <div className="md:col-span-1">
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

                  {/* Current form values debug */}
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Current Form Values:</strong><br/>
                    PatientId: {formData.patientId}<br/>
                    DoctorId: {formData.doctorId}<br/>
                    SpecialtyId: {formData.specialtyId}<br/>
                    ClinicId: {formData.clinicId}<br/>
                    SlotId: {formData.slotId}<br/>
                    SelectedDate: {selectedDate}<br/>
                    AppointmentDateTime: {formData.appointmentDateTime}<br/>
                    ReasonForVisit: {formData.reasonForVisit}
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