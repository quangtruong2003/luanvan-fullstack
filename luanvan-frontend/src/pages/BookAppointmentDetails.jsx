import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { authService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';
import { clinicOfflineService } from '../services/clinicOfflineService';


const BookAppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // Nhận thông tin từ trang trước
  const { slotData, doctorData, clinicData, date } = location.state || {};
  
  // State cho thông tin người dùng (fallback khi currentUser chưa có)
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
  const [offlineReason, setOfflineReason] = useState('');
  const [checkingClinicOffline, setCheckingClinicOffline] = useState(true);

  // Hàm lấy thông tin người dùng từ API - chỉ sử dụng API, không localStorage
  const fetchUserInfoFromAPI = async () => {
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
  };
  
  // Chỉ load thông tin người dùng từ API khi component mount
  useEffect(() => {
    console.log('Loading user info from API...');
    
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfoFromAPI();
    } else {
      setError('Vui lòng đăng nhập để tiếp tục.');
    }
  }, []);

  // Kiểm tra ngày nghỉ của phòng khám
  useEffect(() => {
    const checkClinicOfflineStatus = async () => {
      // Chờ cho đến khi có clinicId và ngày
      if (!clinicData || !date) {
        // Nếu không có clinicData, không cần kiểm tra
        if (!clinicData) setCheckingClinicOffline(false);
        return;
      }
  
      // Sử dụng hàm getClinicId để đảm bảo có ID
      const getClinicId = () => {
        if (slotData?.clinic?.clinic_id) return slotData.clinic.clinic_id;
        if (slotData?.clinicId) return slotData.clinicId;
        if (slotData?.clinic?.id) return slotData.clinic.id;
        if (doctorData?.clinic?.clinic_id) return doctorData.clinic.clinic_id;
        if (doctorData?.clinicId) return doctorData.clinicId;
        if (doctorData?.clinic?.id) return doctorData.clinic.id;
        if (clinicData?.clinic_id) return clinicData.clinic_id;
        if (clinicData?.id) return clinicData.id;
        if (doctorData?.specialties?.[0]?.clinic?.clinic_id) return doctorData.specialties[0].clinic.clinic_id;
        if (doctorData?.specialties?.[0]?.clinic?.id) return doctorData.specialties[0].clinic.id;
        return null;
      };
      const actualClinicId = getClinicId();
  
      if (!actualClinicId) {
        console.warn("Không tìm thấy clinic ID để kiểm tra ngày nghỉ.");
        setCheckingClinicOffline(false);
        return;
      }
  
      setCheckingClinicOffline(true);
      try {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const offlineInfo = await clinicOfflineService.isClinicOfflineOnDate(actualClinicId, formattedDate);
        
        console.log(`[Offline Check] Clinic ${actualClinicId} on ${formattedDate}:`, offlineInfo);

        if (offlineInfo && offlineInfo.isOffline) {
          setIsClinicOffline(true);
          setOfflineReason(offlineInfo.reason || 'Nghỉ không rõ lý do');
          showError(`Phòng khám không làm việc vào ngày ${new Date(date).toLocaleDateString('vi-VN')}.`, `Lý do: ${offlineInfo.reason}`);
        } else {
          setIsClinicOffline(false);
          setOfflineReason('');
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra ngày nghỉ của phòng khám:", err);
        // Không chặn người dùng nếu API lỗi, chỉ log lại
      } finally {
        setCheckingClinicOffline(false);
      }
    };
  
    checkClinicOfflineStatus();
  }, [date, clinicData, doctorData, slotData, showError]);


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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    // Thêm kiểm tra ở đây để chắc chắn
    if (isClinicOffline) {
      showError("Không thể đặt lịch vì phòng khám không làm việc vào ngày này.", "Lỗi");
      return;
    }

    // Ngăn chặn việc submit nếu cấu hình chưa được tải xong
    if (loadingConfig || checkingClinicOffline) {
      showError("Hệ thống đang tải cấu hình hoặc kiểm tra lịch, vui lòng đợi.", "Vui lòng đợi");
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

  if (loadingConfig || !userInfo.user_id || checkingClinicOffline) { // Thêm điều kiện chờ kiểm tra
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-700 font-semibold">
            {loadingConfig ? "Đang tải cấu hình..." : 
             checkingClinicOffline ? "Đang kiểm tra lịch làm việc..." :
             "Đang tải thông tin người dùng..."}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
          {/* Modern Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Xác nhận thông tin đặt lịch
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Vui lòng kiểm tra và xác nhận thông tin trước khi đặt lịch khám bệnh
            </p>
          </div>

        {isClinicOffline && (
            <div className="mb-8 max-w-3xl mx-auto bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-5">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-red-800">Phòng khám không làm việc</h3>
                        <p className="text-red-700 mt-1">
                            Phòng khám nghỉ vào ngày <strong>{new Date(date).toLocaleDateString('vi-VN')}</strong>.
                        </p>
                        {offlineReason && (
                             <p className="text-sm text-red-600 mt-2">Lý do: <strong>{offlineReason}</strong></p>
                        )}
                    </div>
            </div>
                <div className="mt-5 text-center">
                      <button
                        onClick={() => navigate('/book-appointment')}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Quay lại chọn ngày khác
                      </button>
                </div>
                  </div>
        )}
              
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Doctor & Appointment Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Thông tin cuộc hẹn</h2>
            </div>
          </div>

              {/* Card Content */}
              <div className="p-6 space-y-6">
                {/* Doctor Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {doctorData?.user?.full_name?.charAt(0) || doctorData?.user?.fullName?.charAt(0) || 'BS'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {doctorData?.user?.full_name || 
                         doctorData?.user?.fullName || 
                         doctorData?.user?.name ||
                         doctorData?.fullName ||
                         doctorData?.full_name ||
                         doctorData?.name ||
                         'Bác sĩ không xác định'}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {doctorData?.specialties?.map(s => s.name || s.specialty_name).join(', ') || 
                         doctorData?.specialty?.name ||
                         doctorData?.specialty?.specialty_name ||
                         slotData?.specialty?.name ||
                         slotData?.specialty?.specialty_name ||
                         'Chuyên khoa chung'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phòng khám</p>
                      <p className="font-semibold text-gray-900">
                        {clinicData?.name || 
                         clinicData?.clinic_name ||
                         slotData?.clinic?.name || 
                         slotData?.clinic?.clinic_name ||
                         doctorData?.clinic?.name ||
                         doctorData?.clinic?.clinic_name ||
                         doctorData?.specialties?.[0]?.clinic?.name ||
                         doctorData?.specialties?.[0]?.clinic?.clinic_name ||
                         slotData?.clinicName ||
                         slotData?.clinic_name ||
                         doctorData?.clinicName ||
                         doctorData?.clinic_name ||
                         'Phòng khám mặc định'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày khám</p>
                      <p className="font-semibold text-gray-900">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                      <div>
                      <p className="text-sm text-gray-500">Giờ khám</p>
                      <p className="font-semibold text-gray-900">{formattedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="font-medium text-gray-900 leading-relaxed">
                        {clinicData?.address || 
                         clinicData?.clinic_address ||
                         slotData?.clinic?.address || 
                         slotData?.clinic?.clinic_address ||
                         doctorData?.clinic?.address ||
                         doctorData?.clinic?.clinic_address ||
                         doctorData?.specialties?.[0]?.clinic?.address ||
                         doctorData?.specialties?.[0]?.clinic?.clinic_address ||
                         slotData?.clinicAddress ||
                         slotData?.clinic_address ||
                         doctorData?.clinicAddress ||
                         doctorData?.clinic_address ||
                         'Chưa cập nhật địa chỉ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Enhanced Patient Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Thông tin bệnh nhân</h2>
                    <p className="text-emerald-100">Vui lòng kiểm tra và cập nhật thông tin của bạn</p>
                  </div>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    <div>
                        <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleBookAppointment} className="space-y-8">
                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4" />
                        <span>Họ và tên</span>
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName || userInfo.full_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Họ và tên từ tài khoản"
                        disabled
                      />
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Thông tin được lấy từ tài khoản của bạn</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                       </label>
                       <input
                        type="email"
                        name="patientEmail"
                        value={formData.patientEmail || userInfo.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Email từ tài khoản"
                        disabled
                      />
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Thông tin được lấy từ tài khoản của bạn</span>
                      </p>
                    </div>
                  </div>

                  {/* Phone Input - Always Editable */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>Số điện thoại</span>
                      {/* Thêm dấu * nếu SĐT chưa có */}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      value={formData.patientPhone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Nhập số điện thoại của bạn"
                      required
                      disabled={isClinicOffline} // Vô hiệu hóa nếu phòng khám nghỉ
                    />
                    <p className="text-xs text-gray-500">
                         {userInfo.phone_number 
                        ? `Sử dụng SĐT đã lưu: ${userInfo.phone_number}. Bạn có thể cập nhật nếu cần.`
                          : 'Số điện thoại này sẽ được lưu vào hồ sơ của bạn.'}
                       </p>
                     </div>
                  
                  {/* Reason Input */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4" />
                      <span>Lý do khám</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      minLength={3}
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      rows="4"
                      placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                      required
                      disabled={isClinicOffline} // Vô hiệu hóa nếu phòng khám nghỉ
                    ></textarea>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Quay lại</span>
                    </button>
                    
                      <button
                        type="submit"
                      disabled={loading || loadingConfig || isClinicOffline || checkingClinicOffline}
                      className={`flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                        loading || loadingConfig || isClinicOffline || checkingClinicOffline ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {loading || loadingConfig || checkingClinicOffline ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>{loadingConfig ? 'Đang kiểm tra...' : checkingClinicOffline ? 'Đang kiểm tra lịch...' : 'Đang xử lý...'}</span>
                        </>
                      ) : isClinicOffline ? (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Ngày nghỉ</span>
                         </>
                        ) : (
                         <>
                          <span>Xác nhận đặt lịch</span>
                           <ArrowRight className="w-5 h-5" />
                         </>
                        )}
                      </button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentDetails;