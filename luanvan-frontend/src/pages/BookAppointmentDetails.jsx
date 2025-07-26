import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Building2,
  Loader2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { authService, adminService, apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';
import { clinicOfflineService } from '../services/clinicOfflineService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';


const BookAppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId } = useParams(); // Lấy doctorId từ URL
  const { currentUser } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  // State cho thông tin từ API
  const [doctorData, setDoctorData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [offlineDates, setOfflineDates] = useState([]);

  // State cho form thông tin bệnh nhân
  const [userInfo, setUserInfo] = useState({
    user_id: null,
    full_name: '',
    email: '',
    phone_number: ''
  });
  
  // State cho form thông tin bệnh nhân
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    depositAmount: 0,
    isDepositPaid: false
  });  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specialtyId, setSpecialtyId] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null); // Sửa: Dùng state object để lưu toàn bộ config
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);
  
  // Thêm state kiểm tra phòng khám nghỉ
  const [isClinicOffline, setIsClinicOffline] = useState(false);
  const [checkingClinicOffline, setCheckingClinicOffline] = useState(false);

  // Lấy clinic ID từ doctorData một cách an toàn
  const clinicId = useMemo(() => {
    if (!doctorData) return null;
    return doctorData.specialties?.[0]?.clinic?.clinic_id || doctorData.specialties?.[0]?.clinic?.id || null;
  }, [doctorData]);

  // Fetch dữ liệu chính của trang: thông tin bác sĩ và các slot có sẵn
  const fetchPageData = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      // Lấy thông tin chi tiết bác sĩ
      const doctorDetails = await apiService.getDoctorById(doctorId);
      setDoctorData(doctorDetails);

      // Lấy các slot có sẵn của bác sĩ
      const slots = await apiService.getAvailableSlotsByDoctor(doctorId);
      setAvailableSlots(slots || []);

    } catch (err) {
      console.error('Error fetching page data:', err);
      setError('Không thể tải thông tin bác sĩ. Vui lòng thử lại.');
      showError('Lỗi tải dữ liệu bác sĩ', err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, showError]);

  // Fetch ngày nghỉ của phòng khám khi có clinicId
  useEffect(() => {
    const fetchOfflineDatesForClinic = async () => {
      if (!clinicId) return;
      try {
        const dates = await clinicOfflineService.getAllClinicOfflineDates(clinicId);
        setOfflineDates(dates || []);
      } catch (err) {
        console.error('Error fetching offline dates:', err);
      }
    };
    fetchOfflineDatesForClinic();
  }, [clinicId]);

  // Effect chính để tải dữ liệu khi component mount
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Hàm lấy thông tin người dùng từ API
  const fetchUserInfoFromAPI = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUserFromAPI();
      if (userData) {
        console.log('Fetched user data from API:', userData);
        const userDataFormatted = {
          user_id: userData.user_id || userData.id,
          full_name: userData.full_name || userData.fullName || '',
          email: userData.email || '',
          phone_number: userData.phone_number || userData.phoneNumber || ''
        };
        setUserInfo(userDataFormatted);
      } else {
        console.warn('No user data received from API');
        setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
    } catch (err) {
      console.error('Error fetching user info from API:', err);
      setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
  }, [showError]);
  
  // Tải thông tin người dùng và cấu hình thanh toán
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfoFromAPI();
    } else {
      showWarning('Vui lòng đăng nhập để có trải nghiệm tốt nhất.');
    }
    loadConfig();
  }, [fetchUserInfoFromAPI, loadConfig]);

  // Sửa: fetchPaymentConfig giờ chỉ lấy và lưu trữ, không quyết định logic
  useEffect(() => {
    const loadConfig = async () => {
    setLoadingConfig(true);
    setConfigError(null);
    try {
        const systemConfigs = await adminService.getSystemConfig();
        const fetchedConfig = Array.isArray(systemConfigs) ? systemConfigs[0] : systemConfigs;

        if (!fetchedConfig) {
            throw new Error("Không thể tải cấu hình hệ thống.");
        }

        console.log('💰 [BookAppointmentDetails] Raw config from API:', fetchedConfig);

        // Lưu trữ toàn bộ cấu hình thô
        setPaymentConfig(fetchedConfig);

    } catch (error) {
        const errorMessage = error.message || 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.';
        console.error('Error fetching system config:', error);
        setConfigError(errorMessage);
        showError(errorMessage, 'Lỗi hệ thống');
    } finally {
        setLoadingConfig(false);
    }
    };
    
    loadConfig();
  }, [showError]);
  
  // Lấy specialtyId từ slot nếu có
  useEffect(() => {
    if (slotData?.specialty?.specialtyId) {
      setSpecialtyId(slotData.specialty.specialtyId);
    } else if (doctorData?.specialties && doctorData.specialties.length > 0) {
      // Lấy chuyên khoa đầu tiên của bác sĩ nếu slot không có
      setSpecialtyId(doctorData.specialties[0].specialty_id);
    }  }, [slotData, doctorData]);
    // Debug thông tin dữ liệu được truyền vào
  useEffect(() => {
    console.log('=== BookAppointmentDetails Debug Info ===');
    console.log('Current User:', currentUser);
    console.log('User Info State:', userInfo);
    console.log('Form Data:', formData);
    console.log('Date:', date);
    
    // Debug chi tiết Doctor Data
    console.log('🔍 DOCTOR DATA STRUCTURE:');
    console.log('Raw doctorData:', doctorData);
    if (doctorData) {
      console.log('Doctor keys:', Object.keys(doctorData));
      console.log('Doctor ID fields:', {
        doctor_id: doctorData.doctor_id,
        doctorId: doctorData.doctorId,
        id: doctorData.id,
        user_id: doctorData.user_id
      });
      if (doctorData.user) {
        console.log('Doctor user:', doctorData.user);
        console.log('Doctor user keys:', Object.keys(doctorData.user));
      }
      if (doctorData.specialties) {
        console.log('Doctor specialties:', doctorData.specialties);
      }
      if (doctorData.clinic) {
        console.log('Doctor clinic:', doctorData.clinic);
      }
    }
    
    // Debug chi tiết Clinic Data
    console.log('🔍 CLINIC DATA STRUCTURE:');
    console.log('Raw clinicData:', clinicData);
    if (clinicData) {
      console.log('Clinic keys:', Object.keys(clinicData));
      console.log('Clinic ID fields:', {
        clinic_id: clinicData.clinic_id,
        clinicId: clinicData.clinicId,
        id: clinicData.id
      });
      console.log('Clinic info:', {
        name: clinicData.name,
        clinic_name: clinicData.clinic_name,
        address: clinicData.address,
        clinic_address: clinicData.clinic_address
      });
    }
    
    // Debug chi tiết Slot Data  
    console.log('🔍 SLOT DATA STRUCTURE:');
    console.log('Raw slotData:', slotData);
    if (slotData) {
      console.log('Slot keys:', Object.keys(slotData));
      console.log('Slot ID fields:', {
        slot_id: slotData.slot_id,
        slotId: slotData.slotId,
        id: slotData.id
      });
      console.log('Slot times:', {
        start_time: slotData.start_time,
        startTime: slotData.startTime,
        end_time: slotData.end_time,
        endTime: slotData.endTime
      });
      if (slotData.specialty) {
        console.log('Slot specialty:', slotData.specialty);
      }
      if (slotData.clinic) {
        console.log('Slot clinic:', slotData.clinic);
      }
      if (slotData.doctor) {
        console.log('Slot doctor:', slotData.doctor);
      }
    }
    
    // Enhanced clinic info resolution logging
    console.log('🏥 CLINIC INFO RESOLUTION:');
    const resolvedClinicName = clinicData?.name || 
                              slotData?.clinic?.name || 
                               doctorData?.clinic?.name || 'N/A';
    const resolvedClinicAddress = clinicData?.address || 
                                 slotData?.clinic?.address || 
                                  doctorData?.clinic?.address || 'N/A';
    console.log({resolvedClinicName, resolvedClinicAddress});
    console.log('=======================================');
  }, [date, slotData, doctorData, clinicData, currentUser, userInfo, formData]);


  const handlePhoneUpdateIfNeeded = async () => {
    const newPhoneNumber = formData.patientPhone.trim();
    // Chỉ cập nhật nếu SĐT mới hợp lệ và khác với SĐT đã lưu
    if (newPhoneNumber && newPhoneNumber !== userInfo.phone_number) {
      try {
        setLoading(true);
        // Sử dụng adminService để cập nhật cho user cụ thể
        await adminService.updateUser(userInfo.user_id, { phoneNumber: newPhoneNumber });
        
        // Cập nhật lại state local để UI đồng bộ
        setUserInfo(prev => ({ ...prev, phone_number: newPhoneNumber }));
        
        showSuccess('Cập nhật số điện thoại thành công!');
        return true; // Báo hiệu cập nhật thành công
      } catch (err) {
        console.error('Lỗi khi cập nhật số điện thoại:', err);
        showError('Không thể cập nhật số điện thoại của bạn. Vui lòng thử lại.');
        setError('Cập nhật số điện thoại thất bại.');
        return false; // Báo hiệu cập nhật thất bại
      } finally {
        setLoading(false);
      }
    }
    return true; // Không cần cập nhật
  };
  // Đồng bộ thông tin user vào form khi userInfo được load
  useEffect(() => {
    if (userInfo && userInfo.user_id) {
      setFormData(prev => ({
        ...prev,
        patientName: userInfo.full_name,
        patientEmail: userInfo.email,
        // CHỈ cập nhật SĐT nếu trong form đang trống hoặc chưa có input từ user
        // Điều này đảm bảo không ghi đè số điện thoại mà user đã nhập
        patientPhone: prev.patientPhone || userInfo.phone_number || '',
      }));
    }
  }, [userInfo]);

  //=================================================================
  // Logic xử lý hiển thị và chọn ngày
  //=================================================================
  const offlineDatesSet = useMemo(() => 
    new Set(offlineDates.map(d => new Date(d.date).toISOString().split('T')[0]))
  , [offlineDates]);

  const availableDatesSet = useMemo(() => 
    new Set(availableSlots.map(s => s.date))
  , [availableSlots]);

  const isDayHighlighted = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableDatesSet.has(dateString) && !offlineDatesSet.has(dateString);
  };
  
  const filterDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today; // Chỉ cho phép chọn từ ngày hôm nay trở đi
  };

  const renderDayContents = (day, date) => {
    const dateString = date.toISOString().split('T')[0];
    const isOffline = offlineDatesSet.has(dateString);
    const isAvailable = availableDatesSet.has(dateString);
    const isSelectable = isAvailable && !isOffline;

    let tooltipText = '';
    if (isOffline) {
      const offlineInfo = offlineDates.find(d => new Date(d.date).toISOString().split('T')[0] === dateString);
      tooltipText = `Ngày nghỉ: ${offlineInfo?.reason || 'Lý do không xác định'}`;
    }

    return (
      <div className="relative" title={tooltipText}>
        {day}
        {isOffline && <span className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
        {isSelectable && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>}
      </div>
    );
  };

  // Lọc các slot có sẵn cho ngày đã chọn
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().split('T')[0];
    return availableSlots
      .filter(slot => slot.date === dateString)
      .sort((a, b) => (a.startTime || a.start_time).localeCompare(b.startTime || b.start_time));
  }, [selectedDate, availableSlots]);
  //=================================================================


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    // Kiểm tra xem phòng khám có nghỉ vào ngày này không
    if (isClinicOffline) {
      showError("Phòng khám không làm việc vào ngày này. Vui lòng chọn ngày khác.", "Không thể đặt lịch");
      return;
    }

    // Ngăn chặn việc submit nếu cấu hình chưa được tải xong
    if (loadingConfig) {
      showError("Hệ thống đang tải cấu hình, vui lòng đợi trong giây lát.", "Vui lòng đợi");
      return;
    }

    // Xử lý lỗi nếu không tải được cấu hình
    if (configError || !paymentConfig) {
      showError("Không thể xác định thông tin thanh toán do lỗi cấu hình. Vui lòng thử lại.", "Lỗi cấu hình");
      return;
    }
    
    setLoading(true);
    setError(null);

    // Chuẩn hóa số điện thoại để so sánh
    const normalizePhone = (phone) => phone.replace(/[^0-9]/g, '');
    const currentPhone = normalizePhone(userInfo.phone_number || '');
    const inputPhone = normalizePhone(formData.patientPhone || '');
    const phoneNeedsUpdate = inputPhone && currentPhone !== inputPhone;
    console.log(`Phone validation passed: {inputPhone: '${formData.patientPhone}', currentPhone: '${userInfo.phone_number}', finalPhone: '${inputPhone || currentPhone}', normalizedPhone: '${inputPhone}', willUpdate: ${phoneNeedsUpdate}}`);

    try {
      // BƯỚC 1: Cập nhật số điện thoại nếu cần
      const phoneUpdateSuccess = await handlePhoneUpdateIfNeeded();
      
      // Nếu cập nhật SĐT thất bại, dừng toàn bộ quá trình
      if (!phoneUpdateSuccess) {
        setLoading(false);
        return;
      }


        if (!date || !slotData || !doctorData) {
            throw new Error("Thông tin lịch hẹn không đầy đủ. Vui lòng thử lại.");
        }
        
        // =================================================================
        // ID Resolution Logic - Nhất quán và an toàn hơn
        // =================================================================
        const getDoctorId = (doc) => doc?.user_id || doc?.doctorId || doc?.id || doc?.user?.user_id;
        const getSlotId = (slot) => slot?.slot_id || slot?.slotId || slot?.id || slot?.availability_slot_id;

        const resolvedDoctorId = getDoctorId(doctorData);
        console.log(`✅ Found doctorId: ${resolvedDoctorId}`);

        const finalSlotId = getSlotId(slotData);
        console.log(`✅ Found slotId: ${finalSlotId}`);
        
        const getSpecialtyId = () => {
          // Ưu tiên 1: Chuyên khoa được chọn tường minh qua state (nếu có)
          if (specialtyId) return specialtyId;
      
          // Ưu tiên 2: Chuyên khoa đi kèm trong slot (chính xác nhất)
          if (slotData?.specialty?.specialty_id) return slotData.specialty.specialty_id;
          if (slotData?.specialtyId) return slotData.specialtyId;
          if (slotData?.specialty_id) return slotData.specialty_id;
          if (slotData?.specialty?.id) return slotData.specialty.id;
      
          // Ưu tiên 3: Lấy chuyên khoa đầu tiên trong danh sách của bác sĩ
          if (doctorData?.specialties?.[0]?.specialty_id) return doctorData.specialties[0].specialty_id;
          if (doctorData?.specialties?.[0]?.id) return doctorData.specialties[0].id;
          
          // Ưu tiên 4: Chuyên khoa đi kèm bác sĩ (không phải list)
          if (doctorData?.specialty?.specialty_id) return doctorData.specialty.specialty_id;
          if (doctorData?.specialty?.id) return doctorData.specialty.id;
      
          return null;
        };
        const actualSpecialtyId = getSpecialtyId();
        console.log(`✅ Found specialtyId: ${actualSpecialtyId}`);
        
        const getClinicId = () => {
            // Ưu tiên 1: Clinic đi kèm trong slot (chính xác nhất)
            if (slotData?.clinic?.clinic_id) return slotData.clinic.clinic_id;
            if (slotData?.clinicId) return slotData.clinicId;
            if (slotData?.clinic?.id) return slotData.clinic.id;
        
            // Ưu tiên 2: Clinic đi kèm trong thông tin bác sĩ
            if (doctorData?.clinic?.clinic_id) return doctorData.clinic.clinic_id;
            if (doctorData?.clinicId) return doctorData.clinicId;
            if (doctorData?.clinic?.id) return doctorData.clinic.id;
        
            // Ưu tiên 3: Clinic được truyền từ trang trước (ít ưu tiên hơn)
            if (clinicData?.clinic_id) return clinicData.clinic_id;
            if (clinicData?.id) return clinicData.id;
        
            // Ưu tiên 4: Clinic từ specialty của bác sĩ (fallback cuối cùng)
            if (doctorData?.specialties?.[0]?.clinic?.clinic_id) return doctorData.specialties[0].clinic.clinic_id;
            if (doctorData?.specialties?.[0]?.clinic?.id) return doctorData.specialties[0].clinic.id;
            
            return null;
        };
        const actualClinicId = getClinicId();
        console.log(`✅ Found clinicId: ${actualClinicId}`);
        
        //=================================================================
        // Date and Time Validation
        //=================================================================
        
        const minAdvanceDays = Math.floor((paymentConfig.patient_cancellation_time_limit_hours || 24) / 24);
        console.log(`📅 Minimum advance booking days (from hours ${paymentConfig.patient_cancellation_time_limit_hours}): ${minAdvanceDays}`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
        const daysDifference = (selectedDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
        
        console.log(`📅 Original date input: ${date}`);
        const formattedDate = new Date(date).toISOString().split('T')[0];
        console.log(`📅 Formatted date (should match selected): ${formattedDate}`);

        if (daysDifference < minAdvanceDays) {
          throw new Error(`Phải đặt lịch trước ít nhất ${minAdvanceDays} ngày.`);
        }
        
        //=================================================================
        // DateTime Construction and Validation
        //=================================================================
        const startTime = slotData.start_time || slotData.startTime;
        const formattedTime = startTime.split("T").length > 1 ? startTime.split("T")[1] : startTime;
        const appointmentDateTime = `${formattedDate}T${formattedTime}`;
        
      const now = new Date();
        const appointmentDateObj = new Date(appointmentDateTime);

        if (appointmentDateObj < now) {
          throw new Error("Không thể đặt lịch trong quá khứ.");
        }
        
        //=================================================================
        // Final Data Assembly & Navigation
        //=================================================================
        const parsedPatientId = parseInt(userInfo.user_id, 10);
        const parsedDoctorId = parseInt(resolvedDoctorId, 10);
        const parsedSlotId = parseInt(finalSlotId, 10);
        const parsedSpecialtyId = parseInt(actualSpecialtyId, 10);
        const parsedClinicId = parseInt(actualClinicId, 10);

        if (isNaN(parsedPatientId) || isNaN(parsedDoctorId) || isNaN(parsedSlotId) || isNaN(parsedSpecialtyId) || isNaN(parsedClinicId)) {
            throw new Error("Thông tin ID không hợp lệ. Không thể tạo lịch hẹn.");
        }

        // Dữ liệu cốt lõi để tạo lịch hẹn
    const appointmentData = {
      patient_id: parsedPatientId,
      doctor_id: parsedDoctorId,
      slot_id: parsedSlotId,
      specialty_id: parsedSpecialtyId,
      clinic_id: parsedClinicId,
      appointment_date_time: appointmentDateTime,
      reason_for_visit: formData.reasonForVisit.trim(),
            // Các trường này sẽ được quyết định ở trang thanh toán
            status: 'PENDING_PAYMENT',
            is_deposit_paid: false,
            deposit_amount: paymentConfig.default_deposit_amount || 0,
        };

        // Thông tin bổ sung để hiển thị trên trang thanh toán
      const appointmentInfo = {
          patientName: formData.patientName,
          patientPhone: formData.patientPhone || userInfo.phone_number,
          doctorName: doctorData.full_name || doctorData.user?.full_name,
          specialtyName: slotData.specialty?.name || (doctorData.specialties && doctorData.specialties[0]?.name),
          clinicName: slotData.clinic?.name || doctorData.clinic?.name || clinicData?.name,
          clinicAddress: slotData.clinic?.address || doctorData.clinic?.address || clinicData?.address,
        };

        setLoading(false);

        // Luôn điều hướng đến trang thanh toán
        // Trang thanh toán sẽ tự quyết định hiển thị cổng thanh toán hay xác nhận miễn phí
        navigate('/payment', {
          state: {
                appointmentData,
                appointmentInfo,
          }
        });

    } catch (error) {
        console.error('Error in handleBookAppointment:', error);
        setError(error.message);
        showError(error.message, 'Lỗi đặt lịch');
      setLoading(false);
    }
  };

  if (loadingConfig || !userInfo.user_id) { // Thêm điều kiện chờ userInfo
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-700 font-semibold">
            {loadingConfig ? "Đang tải cấu hình..." : "Đang tải thông tin người dùng..."}
          </p>
        </div>
      </div>
    );
  }

  // Giao diện khi có lỗi tải cấu hình hoặc dữ liệu ban đầu
  if (configError || !date || !slotData || !doctorData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">
              {configError || "Thiếu thông tin cần thiết để đặt lịch. Vui lòng quay lại và thử lại."}
            </p>
            <button 
              onClick={() => navigate('/book-appointment')}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay về trang đặt lịch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format thời gian hiển thị
  const formattedTime = slotData.start_time 
    ? `${slotData.start_time.substring(0, 5)} - ${slotData.end_time.substring(0, 5)}`
    : 'Không xác định';

  // Format ngày hiển thị
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Không xác định';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb và thông tin phòng khám */}
        <div className="flex items-center mb-8">
          <Link to="/book-appointment" className="text-blue-600 hover:text-blue-800 mr-2 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Quay lại tìm kiếm</span>
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600">Chi tiết đặt lịch khám</span>
        </div>

        {isClinicOffline && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="font-medium text-red-700">Phòng khám không làm việc vào ngày này</p>
            </div>
            <p className="text-sm text-red-600 mt-1">Vui lòng chọn một ngày khác để đặt lịch khám.</p>
            <div className="mt-3">
              <Link to="/book-appointment" className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50">
                Quay lại chọn ngày khác
              </Link>
            </div>
          </div>
        )}

        {/* Thông tin cuộc hẹn và form đặt lịch */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 mb-6">
          {/* Modern Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Xác nhận thông tin đặt lịch
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Vui lòng chọn ngày và giờ khám phù hợp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Date Picker Section */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-500"/>
                Chọn ngày khám
              </h3>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null); // Reset slot khi đổi ngày
                  const dateString = date.toISOString().split('T')[0];
                  if (offlineDatesSet.has(dateString)) {
                    const offlineInfo = offlineDates.find(d => new Date(d.date).toISOString().split('T')[0] === dateString);
                    showWarning(`Ngày ${date.toLocaleDateString('vi-VN')} là ngày nghỉ của phòng khám.`, `${offlineInfo?.reason || 'Lý do không xác định'}`);
                  }
                }}
                inline
                locale={vi}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                filterDate={filterDate}
                highlightDates={Array.from(availableDatesSet).map(d => new Date(d))}
                dayClassName={date => offlineDatesSet.has(date.toISOString().split('T')[0]) ? 'react-datepicker__day--disabled react-datepicker__day--offline' : null}
                renderDayContents={renderDayContents}
              />
               <style>{`
                .react-datepicker__day--offline {
                  background-color: #fecaca !important;
                  color: #dc2626 !important;
                  cursor: not-allowed;
                }
                .react-datepicker__day--highlighted {
                  background-color: #dbeafe !important;
                  color: #2563eb !important;
                }
              `}</style>
            </div>

            {/* Time Slot Section */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-purple-500"/>
                Chọn giờ khám
              </h3>
              {selectedDate && !offlineDatesSet.has(selectedDate.toISOString().split('T')[0]) ? (
                slotsForSelectedDate.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {slotsForSelectedDate.map(slot => (
                      <button
                        key={slot.slotId || slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={slot.status !== 'AVAILABLE'}
                        className={`px-4 py-3 rounded-xl text-center font-semibold transition-all duration-200 border-2
                          ${selectedSlot?.slotId === slot.slotId ? 'bg-blue-600 text-white border-blue-600' : ''}
                          ${slot.status === 'AVAILABLE' ? 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'}
                        `}
                      >
                        {slot.startTime?.substring(0, 5) || slot.start_time?.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Không có lịch trống trong ngày này.</p>
                  </div>
                )
              ) : (
                 <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-xl">
                   <AlertTriangle className="mx-auto w-8 h-8 mb-2"/>
                   <p className="font-semibold">Phòng khám nghỉ vào ngày này.</p>
                   <p className="text-sm">{offlineDates.find(d => new Date(d.date).toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0])?.reason}</p>
                 </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
           {selectedSlot && (
            <div className="mt-12 text-center animate-fadeIn">
               <button
                 onClick={handleBookAppointment}
                 disabled={loading || !selectedSlot}
                 className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mx-auto"
               >
                 {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span>Đang xử lý...</span>
                  </>
                 ) : (
                  <>
                    <span>Tiếp tục với lịch khám này</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                 )}
               </button>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentDetails;