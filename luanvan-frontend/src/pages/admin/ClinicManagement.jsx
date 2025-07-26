import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Building, 
  MapPin, Phone, Mail, Clock, Users, AlertCircle, Calendar,
  Star, StarOff, ChevronDown, ChevronUp, Stethoscope, BookOpen,
  Wifi, WifiOff, RefreshCcw, Database, CalendarOff, Repeat, Calendar as CalendarIcon, Save
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';
import { clinicOfflineService } from '../../services/clinicOfflineService';

// Add custom animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
  .animate-slideIn { animation: slideIn 0.4s ease-out forwards; }
  .animate-pulse-blue { animation: pulse 1.5s infinite; }
  .transition-height { transition: max-height 0.3s ease-in-out; }
`;

const ClinicManagement = ({ onAuthError, onNavigate }) => {
  console.log('🎯 ClinicManagement component rendered');
  
  // Add the animation style to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Notification system
  const { showSuccess, showError, showWarning } = useNotification();
  
  // Check authentication status
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  console.log('🔐 Auth status:', { 
    hasToken: !!token, 
    tokenLength: token?.length, 
    userRole 
  });
  
  const [clinics, setClinics] = useState([]);
  const [standardWorkShifts, setStandardWorkShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showWorkShiftModal, setShowWorkShiftModal] = useState(false);

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [expandedClinics, setExpandedClinics] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: ''
  });

  const [specialtyFormData, setSpecialtyFormData] = useState({
    name: '',
    description: '',
    isEdit: false,
    specialtyId: null
  });

  const [workShiftFormData, setWorkShiftFormData] = useState({
    shifts: ['morning'],
    selectedDays: [],
    morningStart: '08:00',
    morningEnd: '12:00',
    afternoonStart: '13:00',
    afternoonEnd: '17:00',
    isDefault: false
  });

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Thứ 2', short: 'T2' },
    { value: 'TUESDAY', label: 'Thứ 3', short: 'T3' },
    { value: 'WEDNESDAY', label: 'Thứ 4', short: 'T4' },
    { value: 'THURSDAY', label: 'Thứ 5', short: 'T5' },
    { value: 'FRIDAY', label: 'Thứ 6', short: 'T6' },
    { value: 'SATURDAY', label: 'Thứ 7', short: 'T7' },
    { value: 'SUNDAY', label: 'Chủ nhật', short: 'CN' }
  ];

  const shiftTypes = [
    { value: 'morning', label: 'Ca sáng', icon: '🌅' },
    { value: 'afternoon', label: 'Ca chiều', icon: '🌇' }
  ];

  const [activeTab, setActiveTab] = useState('workShifts'); // 'workShifts' or 'offlineDates'
  const [offlineDates, setOfflineDates] = useState([]);
  const [loadingOfflineDates, setLoadingOfflineDates] = useState(false);
  const [offlineDateFormData, setOfflineDateFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
    reason: '',
    isRecurring: false,
    recurringType: 'NONE'
  });

  useEffect(() => {
    console.log('🚀 ClinicManagement useEffect triggered');
    const initializeData = async () => {
      await checkApiStatus();
      await fetchClinics();
      await fetchStandardWorkShifts();
    };
    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkApiStatus = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';
      const response = await fetch(`${API_BASE_URL}/health-check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch {
      console.warn('⚠️ API health check failed, trying clinics endpoint');
      try {
        await apiService.getClinics();
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    }
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching clinics...');
      console.log('🔐 Auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Try simple fetch first to avoid CORS issues
      console.log('📡 Trying simple fetch first...');
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';
        const response = await fetch(`${API_BASE_URL}/clinics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📨 Simple fetch response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Simple fetch success:', data);
          
          const clinicData = data?.content || data || [];
          console.log('📊 Clinic data extracted:', clinicData);
          
          setClinics(Array.isArray(clinicData) ? clinicData : []);
          setApiStatus('online');
          return;
        } else {
          console.log('⚠️ Simple fetch failed, trying apiService...');
        }
      } catch (simpleError) {
        console.log('⚠️ Simple fetch error, trying apiService:', simpleError.message);
      }

      // Fallback to apiService
      console.log('📡 API call: apiService.getClinics()');
      const response = await apiService.getClinics();
      console.log('📨 Raw response:', response);
      
      // Handle both paginated and direct array responses
      const clinicData = response?.content || response || [];
      console.log('✅ Fetched clinic data:', clinicData);
      console.log('📊 Clinic data type:', typeof clinicData, Array.isArray(clinicData));
      
      setClinics(Array.isArray(clinicData) ? clinicData : []);
      setApiStatus('online');
    } catch (error) {
      console.error('❌ Error fetching clinics:', error);
      setError(`Lỗi tải dữ liệu phòng khám: ${error.message}`);
      setClinics([]);
      
      // Check if it's an auth error
      if (error.message.includes('Session expired') || error.message.includes('Access denied') || 
          error.message.includes('401') || error.message.includes('token') || error.message.includes('Unauthorized')) {
        setApiStatus('offline');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Notify parent component about auth error
        if (onAuthError) {
          onAuthError(error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStandardWorkShifts = async () => {
    try {
      const response = await adminService.getAllStandardWorkShifts();
      const shiftData = response.content || response || [];
      setStandardWorkShifts(shiftData);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
    }
  };

  // FOR DISPLAY: Use working_hours (easier to observe)
  const getClinicWorkShiftsForDisplay = (clinicId) => {
    const clinic = clinics.find(c => (c.clinic_id || c.clinicId) === parseInt(clinicId));
    
    console.log('🔍 getClinicWorkShiftsForDisplay for clinicId:', clinicId);
    
    // Use working_hours for display (easier to observe)
    if (clinic?.working_hours && Array.isArray(clinic.working_hours)) {
      console.log('📍 Using working_hours for display:', clinic.working_hours.length);
      return clinic.working_hours;
    }
    
    console.log('📍 No working_hours available for display');
    return [];
  };

  // FOR EDITING: Use standardWorkShifts (correct mapping)
  const getClinicWorkShiftsForEdit = (clinicId) => {
    const clinic = clinics.find(c => (c.clinic_id || c.clinicId) === parseInt(clinicId));
    
    console.log('🔍 getClinicWorkShiftsForEdit for clinicId:', clinicId);
    console.log('🔍 Found clinic:', clinic ? {
      id: clinic.clinic_id || clinic.clinicId,
      name: clinic.name,
      hasStandardWorkShifts: !!clinic.standardWorkShifts,
      standardWorkShiftsCount: clinic.standardWorkShifts?.length || 0,
      standardWorkShifts: clinic.standardWorkShifts
    } : 'NOT_FOUND');
    
    if (clinic?.standardWorkShifts && Array.isArray(clinic.standardWorkShifts)) {
      console.log('📍 Using standardWorkShifts for edit:', clinic.standardWorkShifts.length);
      return clinic.standardWorkShifts;
    }
    
    // Fallback to global standardWorkShifts array (old approach)
    if (!standardWorkShifts || !Array.isArray(standardWorkShifts)) {
      console.log('📍 No global standardWorkShifts available for edit');
      return [];
    }
    
    const filtered = standardWorkShifts.filter(shift => {
      const shiftClinicId = shift.clinic?.clinic_id || shift.clinic?.clinicId;
      return shiftClinicId === parseInt(clinicId);
    });
    
    console.log('📍 Using fallback standardWorkShifts for edit:', filtered.length);
    return filtered;
  };

  // CRUD Operations for Clinics
  const handleCreateClinic = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = [];
    
    if (!formData.name.trim()) {
      validationErrors.push('Tên phòng khám không được để trống');
    }
    
    if (!formData.address.trim() || formData.address.length < 10 || formData.address.length > 500) {
      validationErrors.push('Địa chỉ phải từ 10-500 ký tự');
    }
    
    if (!formData.phoneNumber.trim()) {
      validationErrors.push('Số điện thoại không được để trống');
    } else {
      // Validate phone number pattern: ^[0-9+\-\s()]{10,15}$
      const phonePattern = /^[0-9+\-\s()]{10,15}$/;
      if (!phonePattern.test(formData.phoneNumber)) {
        validationErrors.push('Số điện thoại không hợp lệ (10-15 ký tự, chỉ số, +, -, khoảng trắng, dấu ngoặc)');
      }
    }
    
    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        validationErrors.push('Email không hợp lệ');
      }
    }
    
    if (!formData.description.trim()) {
      validationErrors.push('Mô tả không được để trống');
    }
    
    if (validationErrors.length > 0) {
      showError(validationErrors.join(', '), 'Lỗi validation');
      return;
    }
    
    try {
      await adminService.createClinic(formData);
      await fetchClinics();
      setShowCreateModal(false);
      resetForm();
      showSuccess('Phòng khám đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating clinic:', error);
      
      // Handle backend validation errors
      if (error.message.includes('Dữ liệu đầu vào không hợp lệ')) {
        // Try to extract specific validation errors from API response
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';
          const response = await fetch(`${API_BASE_URL}/clinics`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.log('Backend validation errors:', errorData);
            
            if (errorData.details) {
              const errorMessages = Object.entries(errorData.details)
                .map(([field, message]) => `${field}: ${message}`)
                .join(', ');
              showError(errorMessages, 'Lỗi validation từ server');
            } else {
              showError(error.message, 'Lỗi validation');
            }
          }
        } catch {
          showError(error.message, 'Lỗi khi tạo phòng khám');
        }
      } else {
        showError(error.message, 'Lỗi khi tạo phòng khám');
      }
    }
  };

  const handleUpdateClinic = async (e) => {
    e.preventDefault();
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    if (!clinicId) {
      showError('Không tìm thấy ID phòng khám. Vui lòng thử lại.');
      return;
    }

    // Client-side validation (same as create)
    const validationErrors = [];
    
    if (!formData.name.trim()) {
      validationErrors.push('Tên phòng khám không được để trống');
    }
    
    if (!formData.address.trim() || formData.address.length < 10 || formData.address.length > 500) {
      validationErrors.push('Địa chỉ phải từ 10-500 ký tự');
    }
    
    if (!formData.phoneNumber.trim()) {
      validationErrors.push('Số điện thoại không được để trống');
    } else {
      const phonePattern = /^[0-9+\-\s()]{10,15}$/;
      if (!phonePattern.test(formData.phoneNumber)) {
        validationErrors.push('Số điện thoại không hợp lệ (10-15 ký tự, chỉ số, +, -, khoảng trắng, dấu ngoặc)');
      }
    }
    
    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        validationErrors.push('Email không hợp lệ');
      }
    }
    
    if (!formData.description.trim()) {
      validationErrors.push('Mô tả không được để trống');
    }
    
    if (validationErrors.length > 0) {
      showError(validationErrors.join(', '), 'Lỗi validation');
      return;
    }
    
    try {
      await adminService.updateClinic(clinicId, formData);
      
      await fetchClinics();
      setShowEditModal(false);
      resetForm();
      showSuccess('Phòng khám đã được cập nhật thành công!');
    } catch (error) {
      console.error('Error updating clinic:', error);
      
      // Handle backend validation errors (same as create)
      if (error.message.includes('Dữ liệu đầu vào không hợp lệ')) {
        showError('Vui lòng kiểm tra dữ liệu đầu vào.', 'Lỗi validation từ server');
      } else {
        showError(error.message, 'Lỗi khi cập nhật phòng khám');
      }
    }
  };

  const handleDeleteClinic = async () => {
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    console.log('🗑️ Attempting to delete clinic:', {
      selectedClinic,
      clinicId,
      clinicName: selectedClinic?.name
    });
    
    if (!clinicId) {
      console.error('❌ No clinic ID found for deletion');
      showError('Không tìm thấy ID phòng khám.');
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      console.log('🔄 Calling adminService.deleteClinic with ID:', clinicId);
      await adminService.deleteClinic(clinicId);
      
      console.log('✅ Clinic deleted successfully, refreshing data...');
      await fetchClinics();
      await fetchStandardWorkShifts();
      
      setShowDeleteModal(false);
      setSelectedClinic(null);
      showSuccess('Phòng khám đã được xóa thành công!');
      showWarning('Tất cả ca làm việc liên quan cũng đã bị xóa.', 'Lưu ý');
    } catch (error) {
      console.error('❌ Error deleting clinic:', {
        error,
        message: error.message,
        stack: error.stack,
        clinicId,
        selectedClinic
      });
      
      // Enhanced error message handling
      let errorTitle = 'Lỗi khi xóa phòng khám';
      let errorMessage = error.message;
      
      if (error.message?.includes('Lỗi hệ thống')) {
        errorTitle = 'Lỗi hệ thống';
        // Keep the detailed message as is - it already contains useful info
      } else if (error.message?.includes('Server error')) {
        errorTitle = 'Lỗi máy chủ';
        errorMessage = 'Không thể xóa phòng khám do lỗi hệ thống. Có thể do:\n• Phòng khám có dữ liệu liên kết\n• Lỗi database\n• Vui lòng thử lại sau hoặc liên hệ admin.';
      }
      
      showError(errorMessage, errorTitle);
      
      // Don't close modal on error to allow retry
      // setShowDeleteModal(false);
      // setSelectedClinic(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // CRUD Operations for Specialties
  const handleCreateSpecialty = async (e) => {
    e.preventDefault();
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    if (!clinicId) {
      showError('Không tìm thấy ID phòng khám.');
      return;
    }

    setLoading(true);
    try {
      await adminService.createClinicSpecialty(clinicId, {
        name: specialtyFormData.name,
        description: specialtyFormData.description
      });
      await fetchClinics(); // Refresh to get updated specialty data
      setShowSpecialtyModal(false);
      resetSpecialtyForm();
      showSuccess('Chuyên khoa đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating specialty:', error);
      showError(error.message, 'Lỗi khi tạo chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpecialty = async (e) => {
    e.preventDefault();
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    const specialtyId = specialtyFormData.specialtyId;
    
    if (!clinicId || !specialtyId) {
      showError('Thông tin không đầy đủ.');
      return;
    }

    setLoading(true);
    try {
      // FIX: Add clinicId to the request body to match SpecialtyDTO
      await adminService.updateClinicSpecialty(clinicId, specialtyId, {
        name: specialtyFormData.name,
        description: specialtyFormData.description,
        clinicId: parseInt(clinicId) // Ensure clinicId is sent and is a number
      });
      await fetchClinics();
      setShowSpecialtyModal(false);
      resetSpecialtyForm();
      showSuccess('Chuyên khoa đã được cập nhật thành công!');
    } catch (error) {
      console.error('Error updating specialty:', error);
      showError(error.message, 'Lỗi khi cập nhật chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialty = async (clinicId, specialtyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyên khoa này? Hành động này không thể hoàn tác.')) {
      return;
    }
    setLoading(true);
    try {
      await adminService.deleteClinicSpecialty(clinicId, specialtyId);
      await fetchClinics();
      showSuccess('Chuyên khoa đã được xóa thành công!');
    } catch (error) {
      console.error('Error deleting specialty:', error);
      showError(error.message, 'Lỗi khi xóa chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkShifts = async () => {
    try {
      const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
      
      if (!workShiftFormData.selectedDays.length) {
        showWarning('Vui lòng chọn ít nhất 1 ngày trong tuần', 'Thiếu thông tin');
        return;
      }
      
      if (!workShiftFormData.shifts.length) {
        showWarning('Vui lòng chọn ít nhất 1 ca làm việc', 'Thiếu thông tin');
        return;
      }

      // Delete existing shifts (use edit data - standardWorkShifts)
      const currentShifts = getClinicWorkShiftsForEdit(clinicId);
      
      for (const shift of currentShifts) {
        try {
          await adminService.deleteStandardWorkShift(shift.shiftId);
        } catch (error) {
          console.warn('Failed to delete shift:', shift.shiftId, error);
        }
      }

      // Create new shifts
      const shiftsToCreate = [];
      let shiftCounter = 1;
      
      // Use a Set to track unique shifts to prevent duplicates
      const uniqueShifts = new Set();
      
      for (const day of workShiftFormData.selectedDays) {
        for (const shiftType of workShiftFormData.shifts) {
          const startTime = shiftType === 'morning' ? workShiftFormData.morningStart : workShiftFormData.afternoonStart;
          const endTime = shiftType === 'morning' ? workShiftFormData.morningEnd : workShiftFormData.afternoonEnd;
          
          // Create a unique key for the shift
          const shiftKey = `${day}-${shiftType}-${startTime}-${endTime}`;

          if (uniqueShifts.has(shiftKey)) {
            console.log(`Skipping duplicate shift: ${shiftKey}`);
            continue;
          }
          uniqueShifts.add(shiftKey);
          
          const dayLabel = daysOfWeek.find(d => d.value === day)?.label || day;
          const shiftData = {
            shiftName: `${shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều'} ${dayLabel} #${shiftCounter++}`,
            dayOfWeek: day,
            startTime: startTime.length === 5 ? startTime + ':00' : startTime,
            endTime: endTime.length === 5 ? endTime + ':00' : endTime,
            clinicId: parseInt(clinicId),
            isDefault: Boolean(workShiftFormData.isDefault)
          };
          
          shiftsToCreate.push(shiftData);
        }
      }

      if (shiftsToCreate.length === 0) {
        showWarning('Không có ca làm việc mới hợp lệ nào để tạo.', 'Cảnh báo');
        // It's possible all new shifts were duplicates of existing ones
        // or the form was submitted without any valid new shifts.
        // We still need to refresh the data in case some old shifts were deleted.
        await Promise.all([
          fetchClinics(),
          fetchStandardWorkShifts()
        ]);
        setShowWorkShiftModal(false);
        resetWorkShiftForm();
        return;
      }
      
      for (const shiftData of shiftsToCreate) {
        await adminService.createStandardWorkShift(shiftData);
      }

      // Refresh both clinic data and standard work shifts to ensure consistency
      await Promise.all([
        fetchClinics(),
        fetchStandardWorkShifts()
      ]);
      
      // Simple success message
      showSuccess(`Đã cập nhật thành công ${shiftsToCreate.length} ca làm việc.`, 'Hoàn thành');
      
      // Close the modal after successful save
      setShowWorkShiftModal(false);
      resetWorkShiftForm();
    } catch (error) {
      console.error('Error saving work shifts:', error);
      showError(error.message, 'Lỗi khi lưu ca làm việc');
    }
  };

  const handleDeleteWorkShift = async (shiftId) => {
    // Use modern confirm dialog instead of window.confirm
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?');
    if (!confirmed) return;
    
    try {
      await adminService.deleteStandardWorkShift(shiftId);
      // Refresh both clinic data and standard work shifts to ensure consistency
      await Promise.all([
        fetchClinics(),
        fetchStandardWorkShifts()
      ]);
      showSuccess('Đã xóa ca làm việc thành công');
    } catch (error) {
      console.error('Error deleting work shift:', error);
      showError(error.message, 'Lỗi khi xóa ca làm việc');
    }
  };

  // Form Reset Functions
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: ''
    });
    setSelectedClinic(null);
  };

  const resetSpecialtyForm = () => {
    setSpecialtyFormData({
      name: '',
      description: '',
      isEdit: false,
      specialtyId: null
    });
  };

  const resetWorkShiftForm = () => {
    setWorkShiftFormData({
      shifts: ['morning'],
      selectedDays: [],
      morningStart: '08:00',
      morningEnd: '12:00',
      afternoonStart: '13:00',
      afternoonEnd: '17:00',
      isDefault: false
    });
  };

  // Modal Open Functions
  const openEditModal = (clinic) => {
    console.log('Opening edit modal for clinic:', clinic);
    setSelectedClinic(clinic);
    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      phoneNumber: clinic.phone_number || clinic.phoneNumber || '',
      email: clinic.email || '',
      description: clinic.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (clinic) => {
    setSelectedClinic(clinic);
    setShowDeleteModal(true);
  };

  const openSpecialtyModal = (clinic, specialty = null) => {
    setSelectedClinic(clinic);
    if (specialty) {
      setSpecialtyFormData({
        name: specialty.name,
        description: specialty.description,
        isEdit: true,
        specialtyId: specialty.specialty_id || specialty.specialtyId
      });
    } else {
      resetSpecialtyForm();
    }
    setShowSpecialtyModal(true);
  };

  const openWorkShiftModal = (clinic) => {
    console.log('Opening work shift modal for clinic:', clinic);
    setSelectedClinic(clinic);
    loadWorkShiftsForEdit(clinic.clinic_id || clinic.clinicId);
    fetchOfflineDates(clinic.clinic_id || clinic.clinicId);
    setShowWorkShiftModal(true);
    setActiveTab('workShifts'); // Mặc định hiển thị tab ca làm việc
  };

  const loadWorkShiftsForEdit = (clinicId) => {
    // Use edit data (standardWorkShifts) for loading edit form
    const shifts = getClinicWorkShiftsForEdit(clinicId);
    if (shifts.length === 0) {
      resetWorkShiftForm();
      return;
    }

    const daySet = new Set();
    const shiftSet = new Set();
    let morningStart = '08:00', morningEnd = '12:00';
    let afternoonStart = '13:00', afternoonEnd = '17:00';
    let isDefault = false;

    shifts.forEach(shift => {
      daySet.add(shift.dayOfWeek);
      isDefault = shift.isDefault || isDefault;

      if (shift.shiftName.includes('sáng') || shift.startTime <= '12:00') {
        shiftSet.add('morning');
        morningStart = formatTime(shift.startTime);
        morningEnd = formatTime(shift.endTime);
      } else {
        shiftSet.add('afternoon');
        afternoonStart = formatTime(shift.startTime);
        afternoonEnd = formatTime(shift.endTime);
      }
    });

    setWorkShiftFormData({
      shifts: Array.from(shiftSet),
      selectedDays: Array.from(daySet),
      morningStart,
      morningEnd,
      afternoonStart,
      afternoonEnd,
      isDefault
    });
  };

  // Utility Functions
  const getDayLabel = (dayOfWeek) => {
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.label : dayOfWeek;
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const normalizeText = (text = '') =>
    text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredClinics = clinics.filter(clinic => {
    const preparedSearchTerm = normalizeText(searchTerm);
    return normalizeText(clinic.name).includes(preparedSearchTerm) ||
    normalizeText(clinic.address).includes(preparedSearchTerm) ||
    normalizeText(clinic.description).includes(preparedSearchTerm)
  }
  );

  // Sort clinics
  const sortedClinics = [...filteredClinics].sort((a, b) => {
    let compareValue = 0;
    if (sortBy === 'name') {
      compareValue = (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'specialties') {
      const aCount = a.specialties?.length || 0;
      const bCount = b.specialties?.length || 0;
      compareValue = aCount - bCount;
    } else if (sortBy === 'created') {
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      compareValue = aDate - bDate;
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  console.log('🔍 Debug Info:', {
    clinicsLength: clinics.length,
    filteredClinicsLength: filteredClinics.length,
    searchTerm,
    clinics: clinics,
    loading
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu phòng khám...</span>
      </div>
    );
  }

  const toggleExpandClinic = (clinicId) => {
    if (expandedClinics.includes(clinicId)) {
      setExpandedClinics(expandedClinics.filter(id => id !== clinicId));
    } else {
      setExpandedClinics([...expandedClinics, clinicId]);
    }
  };

  // Thêm hàm fetch ngày nghỉ
  const fetchOfflineDates = async (clinicId) => {
    if (!clinicId) return;
    
    setLoadingOfflineDates(true);
    try {
      const data = await clinicOfflineService.getAllClinicOfflineDates(clinicId);
      setOfflineDates(data || []);
    } catch (error) {
      console.error('Error fetching offline dates:', error);
      showError('Không thể tải danh sách ngày nghỉ');
    } finally {
      setLoadingOfflineDates(false);
    }
  };
  
  // Thêm lại hàm resetOfflineDateForm
  const resetOfflineDateForm = () => {
    setOfflineDateFormData({
      date: new Date().toISOString().split('T')[0],
      reason: '',
      isRecurring: false,
      recurringType: 'NONE'
    });
  };
  
  // Xử lý thêm ngày nghỉ mới
  const handleAddOfflineDate = async () => {
    if (!selectedClinic) return;
    
    const clinicId = selectedClinic.clinic_id || selectedClinic.clinicId;
    
    try {
      // Validate dữ liệu
      if (!offlineDateFormData.date) {
        showError('Vui lòng chọn ngày nghỉ');
        return;
      }
      
      // Gửi request tạo ngày nghỉ mới
      await clinicOfflineService.createClinicOfflineDate(clinicId, offlineDateFormData);
      
      // Tải lại danh sách
      await fetchOfflineDates(clinicId);
      
      // Reset form và hiện thông báo
      resetOfflineDateForm();
      showSuccess('Đã thêm ngày nghỉ thành công');
    } catch (error) {
      console.error('Error adding offline date:', error);
      showError(error.message || 'Không thể thêm ngày nghỉ');
    }
  };
  
  // Xử lý xóa ngày nghỉ
  const handleDeleteOfflineDate = async (offlineDateId) => {
    if (!selectedClinic || !offlineDateId) return;
    
    const clinicId = selectedClinic.clinic_id || selectedClinic.clinicId;
    
    try {
      // Xác nhận xóa
      if (!window.confirm('Bạn có chắc chắn muốn xóa ngày nghỉ này?')) {
        return;
      }
      
      // Gửi request xóa
      await clinicOfflineService.deleteClinicOfflineDate(clinicId, offlineDateId);
      
      // Tải lại danh sách
      await fetchOfflineDates(clinicId);
      
      // Hiện thông báo
      showSuccess('Đã xóa ngày nghỉ thành công');
    } catch (error) {
      console.error('Error deleting offline date:', error);
      showError(error.message || 'Không thể xóa ngày nghỉ');
    }
  };
  
  // Định dạng ngày hiển thị
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Định dạng loại lặp lại
  const getRecurringTypeLabel = (recurringType) => {
    switch (recurringType) {
      case 'WEEKLY': return 'Hàng tuần';
      case 'MONTHLY': return 'Hàng tháng';
      case 'YEARLY': return 'Hàng năm';
      default: return 'Không lặp lại';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {(error || apiStatus === 'offline') && (
        <div className={`p-4 rounded-lg border ${
          apiStatus === 'offline' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center">
            {apiStatus === 'offline' ? (
              <WifiOff className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <div className="flex-1">
              <h4 className="font-medium">
                {apiStatus === 'offline' ? 'Mất kết nối API' : 'Thông báo'}
              </h4>
              <p className="text-sm mt-1">
                {error || 'Không thể kết nối tới backend server. Vui lòng kiểm tra backend và thử lại.'}
              </p>
            </div>
            <button
              onClick={() => {
                setError(null);
                checkApiStatus();
                fetchClinics();
              }}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-white shadow-sm hover:bg-gray-50"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Header - Function Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý Phòng khám & Chuyên khoa</h2>
            <div className="flex items-center space-x-2">
              {apiStatus === 'online' ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-sm">Kết nối</span>
                </div>
              ) : apiStatus === 'offline' ? (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span className="text-sm">Mất kết nối</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <Database className="h-4 w-4 mr-1 animate-spin" />
                  <span className="text-sm">Kiểm tra...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="specialties-asc">Ít chuyên khoa</option>
                <option value="specialties-desc">Nhiều chuyên khoa</option>
                <option value="created-asc">Cũ nhất</option>
                <option value="created-desc">Mới nhất</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>


            
            <button 
              onClick={() => setShowCreateModal(true)}
              disabled={loading || apiStatus === 'offline'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phòng khám
            </button>
          </div>
        </div>
        
        {/* Search Box */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        
        {/* Stats */}
        <div className="mt-4 text-sm text-gray-500">
          Hiển thị {sortedClinics.length} / {clinics.length} phòng khám
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {sortedClinics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span>Thông tin phòng khám</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4 text-purple-600" />
                      <span>Chuyên khoa</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>Ca làm việc</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end space-x-2">
                      <Edit className="h-4 w-4 text-gray-600" />
                      <span>Thao tác</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedClinics.map((clinic, index) => (
                  <React.Fragment key={clinic.clinic_id || clinic.clinicId}>
                    <tr className={`hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}>
                    
                    {/* Clinic Info Column - Tên, địa chỉ, liên hệ */}
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                            <Building className="h-7 w-7 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {clinic.name || 'N/A'}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ID: {clinic.clinic_id || clinic.clinicId}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{clinic.address || 'Chưa có địa chỉ'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span>{clinic.phone_number || clinic.phoneNumber || 'N/A'}</span>
                              </div>
                              
                              {(clinic.email) && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <Mail className="h-4 w-4 text-blue-500" />
                                  <span className="truncate max-w-[150px]">{clinic.email}</span>
                                </div>
                              )}
                            </div>
                            
                            {clinic.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {clinic.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specialties Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {clinic.specialties && clinic.specialties.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                {clinic.specialties.length} chuyên khoa
                              </span>
                              <button
                                onClick={() => openSpecialtyModal(clinic)}
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                title="Quản lý chuyên khoa"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-1">
                              {clinic.specialties.slice(0, 3).map(specialty => (
                                <div key={specialty.specialty_id || specialty.specialtyId}
                                     className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100 group">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-purple-900">
                                      {specialty.name}
                                    </div>
                                    <div className="text-xs text-purple-700">
                                      {specialty.doctor_count || specialty.doctorCount || 0} bác sĩ
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openSpecialtyModal(clinic, specialty)} className="p-1 hover:bg-purple-100 rounded">
                                      <Edit className="w-3 h-3 text-purple-600" />
                                    </button>
                                    <button onClick={() => handleDeleteSpecialty(clinic.clinic_id || clinic.clinicId, specialty.specialty_id || specialty.specialtyId)} className="p-1 hover:bg-red-100 rounded">
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {clinic.specialties.length > 3 && (
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    +{clinic.specialties.length - 3} chuyên khoa khác
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-400 mb-2">
                              <Stethoscope className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Chưa có chuyên khoa</p>
                            <button
                              onClick={() => openSpecialtyModal(clinic)}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Thêm chuyên khoa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Work Shifts Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).length} ca làm việc
                              </span>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => openWorkShiftModal(clinic)}
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                    title="Cấu hình ca làm việc"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                              <button
                                onClick={() => {
                                  const id = clinic.clinic_id || clinic.clinicId;
                                      toggleExpandClinic(id);
                                }}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Xem chi tiết ca làm việc"
                              >
                                    {expandedClinics.includes(clinic.clinic_id || clinic.clinicId) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                              {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).slice(0, 2).map(shift => (
                                <div key={shift.shiftId || shift.workingHoursId || shift.working_hours_id}
                                     className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-green-900">
                                      {getDayLabel(shift.dayOfWeek || shift.day_of_week)}
                                    </div>
                                    <div className="text-xs text-green-700">
                                      {formatTime(shift.startTime || shift.start_time)} - {formatTime(shift.endTime || shift.end_time)}
                                    </div>
                                  </div>
                                  {(shift.isDefault || shift.is_default) && (
                                    <Star className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                              ))}
                              
                              {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).length > 2 && (
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    +{getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).length - 2} ca khác
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-400 mb-2">
                              <Clock className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Chưa có ca làm việc</p>
                            <button
                                onClick={() => openWorkShiftModal(clinic)}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Thêm ca làm việc
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onNavigate('appointments', { clinicId: clinic.clinic_id || clinic.clinicId })}
                          className="inline-flex items-center p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          title="Xem lịch hẹn của phòng khám"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(clinic)}
                          className="inline-flex items-center p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Chỉnh sửa phòng khám"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(clinic)}
                          className="inline-flex items-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          title="Xóa phòng khám"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                    {/* Expanded Work Shifts Row - will be shown when expanded */}
                    {expandedClinics.includes(clinic.clinic_id || clinic.clinicId) && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 bg-gray-50">
                          <div className="animate-slideIn">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-800 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-green-600" />
                                Danh sách ca làm việc của {clinic.name}
                              </h4>
                              <button
                                onClick={() => openWorkShiftModal(clinic)}
                                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-200"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Thêm/Sửa ca làm việc
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).map((shift) => (
                                <div 
                                  key={shift.shiftId || shift.workingHoursId || shift.working_hours_id}
                                  className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          (shift.isDefault || shift.is_default) ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {(shift.isDefault || shift.is_default) ? (
                                            <><Star className="h-3 w-3 mr-1 fill-current" /> Mặc định</>
                                          ) : (
                                            <><Clock className="h-3 w-3 mr-1" /> Thông thường</>
                                          )}
                                        </span>
                                      </div>
                                      
                                      <div className="mt-2 text-sm font-medium text-gray-900">
                                        {getDayLabel(shift.dayOfWeek || shift.day_of_week)}
                                      </div>
                                      
                                      <div className="mt-1 flex items-center text-sm text-gray-600">
                                        {(shift.startTime || shift.start_time).includes('08:00') || (shift.startTime || shift.start_time).includes('09:00') ? (
                                          <span className="flex items-center">
                                            <span className="text-base mr-1">🌅</span> 
                                            <span>{formatTime(shift.startTime || shift.start_time)} - {formatTime(shift.endTime || shift.end_time)}</span>
                                          </span>
                                        ) : (
                                          <span className="flex items-center">
                                            <span className="text-base mr-1">🌇</span>
                                            <span>{formatTime(shift.startTime || shift.start_time)} - {formatTime(shift.endTime || shift.end_time)}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={() => handleDeleteWorkShift(shift.shiftId)}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                                        title="Xóa ca làm việc"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {getClinicWorkShiftsForDisplay(clinic.clinic_id || clinic.clinicId).length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-gray-200">
                                  <Clock className="h-10 w-10 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500 mb-3">Chưa có ca làm việc nào</p>
                                  <button
                                    onClick={() => openWorkShiftModal(clinic)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-200 animate-pulse-blue"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Thêm ca làm việc đầu tiên
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {clinics.length === 0 ? 'Chưa có phòng khám nào' : 'Không tìm thấy phòng khám'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {clinics.length === 0 
                ? 'Hệ thống chưa có phòng khám nào. Hãy thêm phòng khám đầu tiên để bắt đầu quản lý.' 
                : `Không tìm thấy phòng khám nào phù hợp với từ khóa "${searchTerm}". Hãy thử tìm kiếm với từ khóa khác.`}
            </p>
            {clinics.length === 0 && (
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={loading || apiStatus === 'offline'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm phòng khám mới
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Clinic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm phòng khám mới</h3>
              <form onSubmit={handleCreateClinic}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phòng khám *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Phòng khám Đa khoa ABC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ * (10-500 ký tự)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formData.address && (formData.address.length < 10 || formData.address.length > 500)
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="VD: 123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM"
                      minLength={10}
                      maxLength={500}
                    />
                    {formData.address && (formData.address.length < 10 || formData.address.length > 500) && (
                      <p className="text-red-500 text-xs mt-1">
                        Địa chỉ phải từ 10-500 ký tự (hiện tại: {formData.address.length})
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại * (10-15 ký tự)
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formData.phoneNumber && !/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNumber)
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="VD: 0281234567 hoặc (028) 123-4567"
                        pattern="^[0-9+\-\s()]{10,15}$"
                      />
                      {formData.phoneNumber && !/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNumber) && (
                        <p className="text-red-500 text-xs mt-1">
                          Chỉ được dùng số, +, -, khoảng trắng, dấu ngoặc (10-15 ký tự)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="VD: contact@phongkham.com"
                      />
                      {formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <p className="text-red-500 text-xs mt-1">
                          Email không hợp lệ
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Phòng khám đa khoa với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại..."
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Lưu ý:</strong> Sau khi tạo phòng khám, bạn có thể thêm các ca làm việc bằng cách 
                      mở rộng thông tin phòng khám và nhấn "+ Thêm ca".
                    </p>
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
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang tạo...</span>
                      </div>
                    ) : (
                      'Tạo phòng khám'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {showEditModal && selectedClinic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa phòng khám: {selectedClinic.name}
              </h3>
              <form onSubmit={handleUpdateClinic}>
                  <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 border-b pb-2">Thông tin phòng khám</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên phòng khám *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả *
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang cập nhật...</span>
                      </div>
                    ) : (
                      'Cập nhật phòng khám'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Management Modal */}
      {showSpecialtyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={specialtyFormData.isEdit ? handleUpdateSpecialty : handleCreateSpecialty}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                {specialtyFormData.isEdit ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  cho {selectedClinic?.name}
                </span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên chuyên khoa *</label>
                  <input
                    type="text"
                    required
                    value={specialtyFormData.name}
                    onChange={(e) => setSpecialtyFormData({...specialtyFormData, name: e.target.value})}
                    placeholder="Ví dụ: Tim mạch, Nhi khoa, Da liễu..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả chuyên khoa</label>
                  <textarea
                    rows="3"
                    value={specialtyFormData.description}
                    onChange={(e) => setSpecialtyFormData({...specialtyFormData, description: e.target.value})}
                    placeholder="Mô tả về chuyên khoa, các dịch vụ chính..."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSpecialtyModal(false);
                    resetSpecialtyForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{specialtyFormData.isEdit ? 'Đang cập nhật...' : 'Đang thêm...'}</span>
                    </div>
                  ) : (
                    specialtyFormData.isEdit ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClinic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa phòng khám</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Bạn có chắc chắn muốn xóa phòng khám <strong>"{selectedClinic.name}"</strong>?
                </p>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-800 font-medium mb-1">⚠️ Lưu ý quan trọng:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Sẽ xóa tất cả ca làm việc liên quan</li>
                    <li>• Sẽ xóa tất cả chuyên khoa liên quan</li>
                    <li>• Không thể hoàn tác sau khi xóa</li>
                    <li>• ID phòng khám: {selectedClinic.clinic_id || selectedClinic.clinicId}</li>
                  </ul>
                </div>
                
                {/* Additional warning for potential 500 errors */}
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 font-medium mb-1">💡 Nếu gặp lỗi khi xóa:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Có thể phòng khám có dữ liệu liên kết (lịch hẹn, bác sĩ)</li>
                    <li>• Cần xóa các dữ liệu liên quan trước</li>
                    <li>• Hoặc liên hệ admin để hỗ trợ</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    console.log('🚫 Delete cancelled by user');
                    setShowDeleteModal(false);
                    setSelectedClinic(null);
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    console.log('🗑️ Delete confirmed by user, proceeding...');
                    handleDeleteClinic();
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xác nhận xóa
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Shift Configuration Modal */}
      {showWorkShiftModal && selectedClinic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm transition-all duration-300">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white transform transition-all duration-300 ease-in-out">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Cấu hình ca làm việc & ngày nghỉ
                <span className="text-sm font-normal text-gray-500 ml-2">
                  cho {selectedClinic?.name}
                </span>
              </h3>

              {/* Tabs */}
              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 ${
                    activeTab === 'workShifts'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium transition-all duration-200'
                      : 'text-gray-600 hover:text-blue-500 transition-all duration-200'
                  }`}
                  onClick={() => setActiveTab('workShifts')}
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Ca làm việc</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === 'offlineDates'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium transition-all duration-200'
                      : 'text-gray-600 hover:text-blue-500 transition-all duration-200'
                  }`}
                  onClick={() => setActiveTab('offlineDates')}
                >
                  <div className="flex items-center">
                    <CalendarOff className="h-4 w-4 mr-1" />
                    <span>Ngày nghỉ</span>
                  </div>
                </button>
              </div>

              {/* Tab Content: Ca làm việc */}
              {activeTab === 'workShifts' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveWorkShifts();
                }}
                className="animate-fadeIn">
                  <div className="space-y-5">
                    {/* Chọn loại ca */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại ca làm việc *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {shiftTypes.map(shift => (
                          <label key={shift.value} 
                            className={`flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
                            ${workShiftFormData.shifts.includes(shift.value) 
                              ? 'bg-blue-50 border-blue-300 shadow-sm' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={workShiftFormData.shifts.includes(shift.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    shifts: [...workShiftFormData.shifts, shift.value]
                                  });
                                } else {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    shifts: workShiftFormData.shifts.filter(s => s !== shift.value)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700 flex items-center">
                              <span className="text-xl mr-2">{shift.icon}</span> 
                              <span>{shift.label}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Chọn ngày trong tuần */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày làm việc trong tuần *
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {daysOfWeek.map(day => (
                          <div key={day.value} className="flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (workShiftFormData.selectedDays.includes(day.value)) {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    selectedDays: workShiftFormData.selectedDays.filter(d => d !== day.value)
                                  });
                                } else {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    selectedDays: [...workShiftFormData.selectedDays, day.value]
                                  });
                                }
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-all duration-200 transform
                                ${workShiftFormData.selectedDays.includes(day.value)
                                  ? 'bg-green-600 text-white shadow-md scale-110'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {day.short}
                            </button>
                            <span className="text-xs mt-1 text-gray-600">{day.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Cấu hình giờ cho ca sáng */}
                    {workShiftFormData.shifts.includes('morning') && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm transform transition-all duration-300 ease-in-out">
                        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                          <span className="text-xl mr-2">🌅</span>
                          <span>Cấu hình giờ ca sáng</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giờ bắt đầu
                            </label>
                            <input
                              type="time"
                              value={workShiftFormData.morningStart}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                morningStart: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giờ kết thúc
                            </label>
                            <input
                              type="time"
                              value={workShiftFormData.morningEnd}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                morningEnd: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cấu hình giờ cho ca chiều */}
                    {workShiftFormData.shifts.includes('afternoon') && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-sm transform transition-all duration-300 ease-in-out">
                        <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
                          <span className="text-xl mr-2">🌇</span>
                          <span>Cấu hình giờ ca chiều</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giờ bắt đầu
                            </label>
                            <input
                              type="time"
                              value={workShiftFormData.afternoonStart}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                afternoonStart: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giờ kết thúc
                            </label>
                            <input
                              type="time"
                              value={workShiftFormData.afternoonEnd}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                afternoonEnd: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Tùy chọn ca mặc định */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={workShiftFormData.isDefault}
                          onChange={(e) => setWorkShiftFormData({
                            ...workShiftFormData,
                            isDefault: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2 h-4 w-4"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                          <div className="flex items-center">
                            <Star className={`h-4 w-4 mr-1 ${workShiftFormData.isDefault ? 'text-yellow-500 fill-current' : 'text-gray-400'} transition-colors duration-200`} />
                            <span>Đặt làm ca mặc định</span>
                          </div>
                        </label>
                      </div>
                      {workShiftFormData.isDefault && (
                        <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Ca làm việc mặc định sẽ được áp dụng tự động khi tạo lịch làm việc mới cho bác sĩ.
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWorkShiftModal(false);
                          resetWorkShiftForm();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang lưu...</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="h-4 w-4 mr-1" />
                            <span>Lưu ca làm việc</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Tab Content: Ngày nghỉ */}
              {activeTab === 'offlineDates' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-red-500" />
                      <span>Thêm ngày nghỉ mới</span>
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Chọn ngày */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày nghỉ *
                          </label>
                          <input
                            type="date"
                            value={offlineDateFormData.date}
                            onChange={(e) => setOfflineDateFormData({
                              ...offlineDateFormData,
                              date: e.target.value
                            })}
                            min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lý do nghỉ
                          </label>
                          <input
                            type="text"
                            value={offlineDateFormData.reason}
                            onChange={(e) => setOfflineDateFormData({
                              ...offlineDateFormData,
                              reason: e.target.value
                            })}
                            placeholder="Ví dụ: Nghỉ lễ, Sửa chữa cơ sở vật chất..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      {/* Tùy chọn lặp lại */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="isRecurring"
                            checked={offlineDateFormData.isRecurring}
                            onChange={(e) => setOfflineDateFormData({
                              ...offlineDateFormData,
                              isRecurring: e.target.checked,
                              recurringType: e.target.checked ? offlineDateFormData.recurringType : 'NONE'
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2 h-4 w-4"
                          />
                          <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer">
                            <div className="flex items-center">
                              <Repeat className="h-4 w-4 mr-1 text-blue-600" />
                              <span>Lặp lại ngày nghỉ</span>
                            </div>
                          </label>
                        </div>
                        
                        {offlineDateFormData.isRecurring && (
                          <div className="mt-3 pl-6 animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kiểu lặp lại
                            </label>
                            <select
                              value={offlineDateFormData.recurringType}
                              onChange={(e) => setOfflineDateFormData({
                                ...offlineDateFormData,
                                recurringType: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="WEEKLY">Hàng tuần (cùng thứ)</option>
                              <option value="MONTHLY">Hàng tháng (cùng ngày)</option>
                              <option value="YEARLY">Hàng năm (cùng ngày)</option>
                            </select>
                            
                            <div className="mt-2 text-xs text-gray-500 bg-white p-3 rounded border border-gray-100">
                              <p className="mb-1 font-medium">Giải thích:</p>
                              {offlineDateFormData.recurringType === 'WEEKLY' && (
                                <p className="flex items-center">
                                  <span className="text-blue-500 mr-1">•</span>
                                  Lặp lại vào thứ này hàng tuần (ví dụ: nghỉ thứ 7 hàng tuần)
                                </p>
                              )}
                              {offlineDateFormData.recurringType === 'MONTHLY' && (
                                <p className="flex items-center">
                                  <span className="text-blue-500 mr-1">•</span>
                                  Lặp lại vào ngày này hàng tháng (ví dụ: nghỉ ngày 15 hàng tháng)
                                </p>
                              )}
                              {offlineDateFormData.recurringType === 'YEARLY' && (
                                <p className="flex items-center">
                                  <span className="text-blue-500 mr-1">•</span>
                                  Lặp lại vào ngày này hàng năm (ví dụ: nghỉ ngày Tết hàng năm)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Nút thêm mới */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddOfflineDate}
                          disabled={loadingOfflineDates}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {loadingOfflineDates ? (
                            <div className="flex items-center">
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>Đang xử lý...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 mr-1" />
                              <span>Thêm ngày nghỉ</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Danh sách ngày nghỉ */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <CalendarOff className="h-5 w-5 mr-2 text-red-500" />
                        <span>Danh sách ngày nghỉ</span>
                      </div>
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {offlineDates.length} ngày
                      </span>
                    </h4>
                    
                    {loadingOfflineDates ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    ) : offlineDates.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <CalendarIcon className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">Chưa có ngày nghỉ nào được thiết lập</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {offlineDates.map((date) => (
                          <div
                            key={date.offlineDateId}
                            className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg hover:shadow-sm transition-all duration-200"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatDate(date.date)}
                              </div>
                              {date.reason && (
                                <div className="text-sm text-gray-600">
                                  {date.reason}
                                </div>
                              )}
                              {date.isRecurring && (
                                <div className="flex items-center text-xs text-blue-600 mt-1">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  <span>{getRecurringTypeLabel(date.recurringType)}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteOfflineDate(date.offlineDateId)}
                              className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
                              title="Xóa ngày nghỉ"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Nút đóng */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkShiftModal(false);
                        resetWorkShiftForm();
                        resetOfflineDateForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicManagement; 