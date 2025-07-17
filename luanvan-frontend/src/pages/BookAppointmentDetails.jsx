import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2
} from 'lucide-react';
import { apiService, authService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';


const BookAppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showError } = useNotification();
  
  // Nhận thông tin từ trang trước
  const { slotData, doctorData, clinicData, date } = location.state || {};
  function countWords(str) {
    const trimmed = str.trim();
    if (trimmed === "") return 0;
    // Bước 3: Tách thành mảng các từ (dựa vào dấu cách/tab/xuống dòng)
    const wordsArray = trimmed.split(/\s+/);
    return wordsArray.length;
  }
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
  const [isPaymentRequired, setIsPaymentRequired] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);
  
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

  const fetchPaymentConfig = useCallback(async () => {
    setLoadingConfig(true);
    setConfigError(null);
    try {
        const systemConfigs = await adminService.getSystemConfig();
        const fetchedConfig = Array.isArray(systemConfigs) ? systemConfigs[0] : systemConfigs;

        if (!fetchedConfig) {
            throw new Error("Không thể tải cấu hình hệ thống.");
        }

        const newConfig = {
            enableMomo: fetchedConfig.enableMomo || false,
            enableVNPay: fetchedConfig.enableVNPay || false,
            depositAmount: fetchedConfig.depositAmount || 0,
        };

        const needsPayment = newConfig.enableMomo || newConfig.enableVNPay;
        const hasDeposit = newConfig.depositAmount > 0;
        setIsPaymentRequired(needsPayment && hasDeposit);

    } catch (error) {
        const errorMessage = error.message || 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.';
        console.error('Error fetching system config:', error);
        setConfigError(errorMessage);
        showError(errorMessage, 'Lỗi hệ thống');
    } finally {
        setLoadingConfig(false);
    }
  }, [showError]);

  // Effect để lấy cấu hình thanh toán từ API khi component được mount
  useEffect(() => {
    fetchPaymentConfig();
  }, [fetchPaymentConfig]);
  
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
                              'Phòng khám mặc định'
                              
    const resolvedClinicAddress = clinicData?.address || 
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
                                 'Chưa cập nhật địa chỉ'
    
    console.log('Resolved clinic name:', resolvedClinicName);
    console.log('Resolved clinic address:', resolvedClinicAddress);
    
    // Test each source individually
    console.log('📋 Individual clinic name sources:');
    console.log('  - clinicData?.name:', clinicData?.name);
    console.log('  - clinicData?.clinic_name:', clinicData?.clinic_name);
    console.log('  - slotData?.clinic?.name:', slotData?.clinic?.name);
    console.log('  - slotData?.clinic?.clinic_name:', slotData?.clinic?.clinic_name);
    console.log('  - doctorData?.clinic?.name:', doctorData?.clinic?.name);
    console.log('  - doctorData?.clinic?.clinic_name:', doctorData?.clinic?.clinic_name);
    console.log('  - doctorData?.specialties?.[0]?.clinic?.name:', doctorData?.specialties?.[0]?.clinic?.name);
    console.log('  - doctorData?.specialties?.[0]?.clinic?.clinic_name:', doctorData?.specialties?.[0]?.clinic?.clinic_name);
    
    console.log('📋 Individual clinic address sources:');
    console.log('  - clinicData?.address:', clinicData?.address);
    console.log('  - clinicData?.clinic_address:', clinicData?.clinic_address);
    console.log('  - slotData?.clinic?.address:', slotData?.clinic?.address);
    console.log('  - slotData?.clinic?.clinic_address:', slotData?.clinic?.clinic_address);
    console.log('  - doctorData?.clinic?.address:', doctorData?.clinic?.address);
    console.log('  - doctorData?.clinic?.clinic_address:', doctorData?.clinic?.clinic_address);
    console.log('  - doctorData?.specialties?.[0]?.clinic?.address:', doctorData?.specialties?.[0]?.clinic?.address);
    console.log('  - doctorData?.specialties?.[0]?.clinic?.clinic_address:', doctorData?.specialties?.[0]?.clinic?.clinic_address);
    
  }, [currentUser, userInfo, formData, doctorData, clinicData, slotData, date]);
  // Xử lý khi người dùng thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Xử lý đặt lịch
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    // Kiểm tra thông tin bắt buộc
    if (!formData.reasonForVisit || formData.reasonForVisit.trim() === '') {
      setError('Vui lòng nhập lý do khám bệnh');
      return;
    }

    // Xử lý số điện thoại - QUAN TRỌNG: Không được cập nhật số điện thoại thành null/rỗng
    const inputPhone = formData.patientPhone?.trim() || '';
    const currentPhone = userInfo.phone_number?.trim() || '';
    
    // Nếu user không nhập gì, sử dụng SĐT hiện tại từ database
    const finalPhone = inputPhone || currentPhone;
    
    if (!finalPhone) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    
    // Chuẩn hóa số điện thoại: chỉ giữ lại các chữ số
    const normalizedPhone = finalPhone.replace(/\D/g, '');
    
    // Kiểm tra độ dài số điện thoại sau khi chuẩn hóa
    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      setError('Số điện thoại phải có 10-11 chữ số');
      return;
    }
    
    // Kiểm tra format số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|84[3|5|7|8|9][0-9]{8})$/;
    if (!phoneRegex.test(normalizedPhone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ');
      return;
    }
    
    console.log('📞 Phone validation passed:', {
      inputPhone,
      currentPhone,
      finalPhone,
      normalizedPhone,
      willUpdate: inputPhone && inputPhone !== currentPhone
    });
    
    // === BƯỚC 1: XÁC ĐỊNH USER ID ===
    const userId = userInfo.user_id;
    
    if (!userId || isNaN(parseInt(userId))) {
      setError('Không tìm thấy thông tin người dùng hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    // === BƯỚC 2: KIỂM TRA SLOT VÀ DOCTOR DATA ===
    if (!slotData || !doctorData) {
      setError('Thông tin lịch khám không hợp lệ');
      return;
    }

    // === BƯỚC 3: XÁC ĐỊNH DOCTOR ID ===
    let doctorId = null;
    
    // Thử tất cả các khả năng đặt tên cho doctor ID
    const possibleDoctorIdFields = [
      'doctor_id', 'doctorId', 'id', 'user_id', 'userId',
      'Doctor_id', 'DoctorId', 'ID', 'User_id', 'UserId'
    ];
    
    for (const field of possibleDoctorIdFields) {
      if (doctorData[field] != null && !isNaN(parseInt(doctorData[field]))) {
        doctorId = doctorData[field];
        console.log(`✅ Found doctorId in field: ${field} = ${doctorId}`);
        break;
      }
    }
    
    // Nếu vẫn không tìm thấy, thử trong nested objects
    if (!doctorId && doctorData.user) {
      for (const field of possibleDoctorIdFields) {
        if (doctorData.user[field] != null && !isNaN(parseInt(doctorData.user[field]))) {
          doctorId = doctorData.user[field];
          console.log(`✅ Found doctorId in user.${field} = ${doctorId}`);
          break;
        }
      }
    }
    
    console.log('🔍 Doctor ID Resolution:', {
      doctorData_doctor_id: doctorData.doctor_id,
      doctorData_doctorId: doctorData.doctorId,
      doctorData_id: doctorData.id,
      doctorData_user_id: doctorData.user_id,
      doctorData_user: doctorData.user,
      finalDoctorId: doctorId
    });
    
    if (!doctorId || isNaN(parseInt(doctorId))) {
      console.error('❌ No valid doctor ID found in:', doctorData);
      setError('Không thể xác định thông tin bác sĩ. Vui lòng chọn lại bác sĩ.');
      return;
    }

    // === BƯỚC 4: XÁC ĐỊNH SLOT ID ===
    let slotId = null;
    
    // Thử tất cả các khả năng đặt tên cho slot ID
    const possibleSlotIdFields = [
      'slot_id', 'slotId', 'id', 'availability_slot_id', 'availabilitySlotId',
      'Slot_id', 'SlotId', 'ID', 'Availability_slot_id', 'AvailabilitySlotId'
    ];
    
    for (const field of possibleSlotIdFields) {
      if (slotData[field] != null && !isNaN(parseInt(slotData[field]))) {
        slotId = slotData[field];
        console.log(`✅ Found slotId in field: ${field} = ${slotId}`);
        break;
      }
    }
    
    console.log('🔍 Slot ID Resolution:', {
      slotData_slot_id: slotData.slot_id,
      slotData_slotId: slotData.slotId,
      slotData_id: slotData.id,
      slotData_availability_slot_id: slotData.availability_slot_id,
      finalSlotId: slotId
    });
    
    if (!slotId || isNaN(parseInt(slotId))) {
      console.error('❌ No valid slot ID found in:', slotData);
      setError('Không thể xác định thông tin slot thời gian. Vui lòng chọn lại slot.');
      return;
    }

    // === BƯỚC 5: XÁC ĐỊNH SPECIALTY ID ===
    let actualSpecialtyId = specialtyId;
    
    const possibleSpecialtyIdFields = [
      'specialty_id', 'specialtyId', 'id', 'Specialty_id', 'SpecialtyId', 'ID'
    ];
    
    if (!actualSpecialtyId) {
      // Thử lấy từ slot data trực tiếp
      for (const field of possibleSpecialtyIdFields) {
        if (slotData[field] != null && !isNaN(parseInt(slotData[field]))) {
          actualSpecialtyId = slotData[field];
          console.log(`✅ Found specialtyId in slotData.${field} = ${actualSpecialtyId}`);
          break;
        }
      }
      
      // Thử lấy từ slot data.specialty object
      if (!actualSpecialtyId && slotData.specialty) {
        for (const field of possibleSpecialtyIdFields) {
          if (slotData.specialty[field] != null && !isNaN(parseInt(slotData.specialty[field]))) {
            actualSpecialtyId = slotData.specialty[field];
            console.log(`✅ Found specialtyId in slotData.specialty.${field} = ${actualSpecialtyId}`);
            break;
          }
        }
      }
      
      // Thử lấy từ doctor's specialties
    if (!actualSpecialtyId && doctorData.specialties && doctorData.specialties.length > 0) {
        const firstSpecialty = doctorData.specialties[0];
        for (const field of possibleSpecialtyIdFields) {
          if (firstSpecialty[field] != null && !isNaN(parseInt(firstSpecialty[field]))) {
            actualSpecialtyId = firstSpecialty[field];
            console.log(`✅ Found specialtyId in doctorData.specialties[0].${field} = ${actualSpecialtyId}`);
            break;
          }
        }
      }
    }
    
    console.log('🔍 Specialty ID Resolution:', {
      current_specialtyId: specialtyId,
      slotData_specialty_id: slotData.specialty_id,
      slotData_specialtyId: slotData.specialtyId,
      slotData_specialty_object: slotData.specialty,
      doctorData_specialties: doctorData.specialties,
      finalSpecialtyId: actualSpecialtyId
    });
    
    if (!actualSpecialtyId || isNaN(parseInt(actualSpecialtyId))) {
      console.error('❌ No valid specialty ID found');
      console.error('SlotData:', slotData);
      console.error('DoctorData specialties:', doctorData.specialties);
      setError('Không thể xác định chuyên khoa. Vui lòng thử lại.');
      return;
    }
    
    // === BƯỚC 6: XÁC ĐỊNH CLINIC ID ===
    let actualClinicId = null;
    
    const possibleClinicIdFields = [
      'clinic_id', 'clinicId', 'id', 'Clinic_id', 'ClinicId', 'ID'
    ];
    
    // Thử lấy từ clinicData trước
    if (clinicData) {
      for (const field of possibleClinicIdFields) {
        if (clinicData[field] != null && !isNaN(parseInt(clinicData[field]))) {
          actualClinicId = clinicData[field];
          console.log(`✅ Found clinicId in clinicData.${field} = ${actualClinicId}`);
          break;
        }
      }
    }
    
    // Nếu chưa có, thử lấy từ slot data trực tiếp
    if (!actualClinicId) {
      for (const field of possibleClinicIdFields) {
        if (slotData[field] != null && !isNaN(parseInt(slotData[field]))) {
          actualClinicId = slotData[field];
          console.log(`✅ Found clinicId in slotData.${field} = ${actualClinicId}`);
          break;
        }
      }
    }
    
    // Thử lấy từ slot.clinic object
    if (!actualClinicId && slotData.clinic) {
      for (const field of possibleClinicIdFields) {
        if (slotData.clinic[field] != null && !isNaN(parseInt(slotData.clinic[field]))) {
          actualClinicId = slotData.clinic[field];
          console.log(`✅ Found clinicId in slotData.clinic.${field} = ${actualClinicId}`);
          break;
        }
      }
    }
    
    // Thử lấy từ doctor data trực tiếp
    if (!actualClinicId) {
      for (const field of possibleClinicIdFields) {
        if (doctorData[field] != null && !isNaN(parseInt(doctorData[field]))) {
          actualClinicId = doctorData[field];
          console.log(`✅ Found clinicId in doctorData.${field} = ${actualClinicId}`);
          break;
        }
      }
    }
    
    // Thử lấy từ doctor.clinic object
    if (!actualClinicId && doctorData.clinic) {
      for (const field of possibleClinicIdFields) {
        if (doctorData.clinic[field] != null && !isNaN(parseInt(doctorData.clinic[field]))) {
          actualClinicId = doctorData.clinic[field];
          console.log(`✅ Found clinicId in doctorData.clinic.${field} = ${actualClinicId}`);
          break;
        }
      }
    }
    
    // Thử lấy từ specialty của doctor
    if (!actualClinicId && doctorData.specialties && doctorData.specialties.length > 0) {
      const firstSpecialty = doctorData.specialties[0];
      if (firstSpecialty.clinic) {
        for (const field of possibleClinicIdFields) {
          if (firstSpecialty.clinic[field] != null && !isNaN(parseInt(firstSpecialty.clinic[field]))) {
            actualClinicId = firstSpecialty.clinic[field];
            console.log(`✅ Found clinicId in doctorData.specialties[0].clinic.${field} = ${actualClinicId}`);
            break;
          }
        }
      }
    }

    console.log('🔍 Clinic ID Resolution:', {
      clinicData: clinicData,
      clinicData_clinic_id: clinicData?.clinic_id,
      clinicData_clinicId: clinicData?.clinicId,
      slotData_clinic: slotData.clinic,
      doctorData_clinic: doctorData.clinic,
      doctorData_specialties_clinic: doctorData.specialties?.[0]?.clinic,
      finalClinicId: actualClinicId
    });
    
    if (!actualClinicId || isNaN(parseInt(actualClinicId))) {
      console.error('❌ No valid clinic ID found');
      console.error('ClinicData:', clinicData);
      console.error('SlotData clinic:', slotData.clinic);
      console.error('DoctorData clinic:', doctorData.clinic);
      console.error('DoctorData specialties clinic:', doctorData.specialties?.[0]?.clinic);
      setError('Không thể xác định phòng khám. Vui lòng thử lại.');
      return;
    }

    // === BƯỚC 7: VALIDATION NGÀY VÀ TẠO APPOINTMENT DATETIME ===
    let appointmentDateTime;
    const startTime = slotData.start_time || slotData.startTime || '08:00:00';
    
    try {
      // Load admin settings để lấy minimum advance booking days
      let minimumAdvanceBookingDays = 1; // default
      
      try {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          const adminSettings = JSON.parse(savedSettings);
          if (adminSettings.general?.minimumAdvanceBookingDays !== undefined) {
            minimumAdvanceBookingDays = adminSettings.general.minimumAdvanceBookingDays;
          }
        }
      } catch (settingsError) {
        console.warn('Failed to load admin settings for date validation:', settingsError);
      }

      console.log('📅 Minimum advance booking days:', minimumAdvanceBookingDays);

      // Parse ngày đã chọn (tránh timezone issues)
      let formattedDate;
      if (typeof date === 'string') {
        // Nếu date là string format YYYY-MM-DD, sử dụng trực tiếp
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedDate = date;
        } else {
          // Parse date string khác
          const appointmentDate = new Date(date);
          if (isNaN(appointmentDate.getTime())) {
            throw new Error('Invalid date format: ' + date);
          }
          // Sử dụng local date string để tránh timezone issues
          const year = appointmentDate.getFullYear();
          const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
          const day = String(appointmentDate.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      } else {
        // date là Date object
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
          throw new Error('Invalid date object: ' + date);
        }
        // Sử dụng local date để tránh timezone conversion
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }

      console.log('📅 Original date input:', date);
      console.log('📅 Formatted date (should match selected):', formattedDate);

      // Validate minimum advance booking
      const selectedDate = new Date(formattedDate + 'T00:00:00');
      const today = new Date();
      // Reset time để so sánh chỉ ngày
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
      
      console.log('📅 Date validation:', {
        today: today.toDateString(),
        selectedDate: selectedDate.toDateString(),
        daysDifference,
        minimumRequired: minimumAdvanceBookingDays,
        isValid: daysDifference >= minimumAdvanceBookingDays
      });

      if (daysDifference < minimumAdvanceBookingDays) {
        const message = minimumAdvanceBookingDays === 0 
          ? 'Không thể đặt lịch cho ngày trong quá khứ.'
          : `Vui lòng đặt lịch trước ít nhất ${minimumAdvanceBookingDays} ngày. Ngày sớm nhất có thể đặt là ${new Date(today.getTime() + minimumAdvanceBookingDays * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}.`;
        setError(message);
        return;
      }
      
      // Đảm bảo time format đúng (HH:mm:ss)
      let formattedTime = startTime;
      if (formattedTime.length === 5) { // HH:mm
        formattedTime = `${formattedTime}:00`; // HH:mm:ss
      } else if (formattedTime.includes('.')) {
        formattedTime = formattedTime.split('.')[0]; // Remove milliseconds
      }
      
      // Backend expects format: YYYY-MM-DDTHH:mm:ss (LocalDateTime format)
      appointmentDateTime = `${formattedDate}T${formattedTime}`;
      
      // Final validation: ensure appointment datetime is in future (for backend @Future constraint)
      const appointmentDateTimeObj = new Date(appointmentDateTime);
      const now = new Date();
      
      console.log('🕒 Final DateTime validation:', {
        originalDate: date,
        formattedDate: formattedDate,
        formattedTime: formattedTime,
        appointmentDateTime: appointmentDateTime,
        now: now.toISOString(),
        appointmentDateTimeObj: appointmentDateTimeObj.toISOString(),
        isFuture: appointmentDateTimeObj > now,
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset()
      });
      
      // More strict validation for time on same day
      if (daysDifference === 0) {
        // If booking for today, check if time is still available
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const [appointmentHour, appointmentMinute] = formattedTime.split(':').map(Number);
        const appointmentTimeMinutes = appointmentHour * 60 + appointmentMinute;
        
        if (appointmentTimeMinutes <= nowTime + 30) { // 30 minutes buffer
          setError('Không thể đặt lịch cho giờ đã qua hoặc quá gần hiện tại. Vui lòng chọn giờ ít nhất 30 phút sau.');
          return;
        }
      }
      
      console.log('🕒 DateTime formatting:', {
        originalDate: date,
        originalTime: startTime,
        formattedDate,
        formattedTime,
        appointmentDateTime,
        isValidFuture: appointmentDateTimeObj > now
      });
      
    } catch (dateError) {
      console.error('Date formatting error:', dateError);
      setError('Lỗi định dạng ngày giờ. Vui lòng thử lại.');
      return;
    }

    // === BƯỚC 8: TẠO APPOINTMENT DATA ===
    // Parse integers với validation
    const parsedPatientId = parseInt(userId);
    const parsedDoctorId = parseInt(doctorId);
    const parsedSlotId = parseInt(slotId);
    const parsedSpecialtyId = parseInt(actualSpecialtyId);
    const parsedClinicId = parseInt(actualClinicId);
    
    console.log('🔍 Parsed IDs check:');
    console.log('  - userId:', userId, '→ parsedPatientId:', parsedPatientId, 'isNaN:', isNaN(parsedPatientId));
    console.log('  - doctorId:', doctorId, '→ parsedDoctorId:', parsedDoctorId, 'isNaN:', isNaN(parsedDoctorId));
    console.log('  - slotId:', slotId, '→ parsedSlotId:', parsedSlotId, 'isNaN:', isNaN(parsedSlotId));
    console.log('  - actualSpecialtyId:', actualSpecialtyId, '→ parsedSpecialtyId:', parsedSpecialtyId, 'isNaN:', isNaN(parsedSpecialtyId));
    console.log('  - actualClinicId:', actualClinicId, '→ parsedClinicId:', parsedClinicId, 'isNaN:', isNaN(parsedClinicId));
    
    // Kiểm tra payment config để xác định trạng thái mặc định
    let defaultStatus = 'PENDING_PAYMENT'; // Mặc định
    let paymentConfig = {
      enableMomo: true,
      enableVNPay: true,
      depositAmount: 50000
    };

    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const adminSettings = JSON.parse(savedSettings);
        if (adminSettings.payment) {
          paymentConfig = { ...paymentConfig, ...adminSettings.payment };
        }
      }
    } catch (error) {
      console.warn('Failed to load payment config:', error);
    }

    console.log('💰 Payment config loaded:', paymentConfig);

    // Kiểm tra xem có cần thanh toán không
    const needsPayment = paymentConfig.enableMomo || paymentConfig.enableVNPay;
    const hasDepositAmount = paymentConfig.depositAmount && paymentConfig.depositAmount > 0;
    
    console.log('💰 Payment checks:', {
      needsPayment,
      hasDepositAmount,
      enableMomo: paymentConfig.enableMomo,
      enableVNPay: paymentConfig.enableVNPay,
      depositAmount: paymentConfig.depositAmount
    });

    // Nếu không có phương thức thanh toán nào được bật hoặc depositAmount = 0, set status = CONFIRMED
    if (!needsPayment || !hasDepositAmount) {
      defaultStatus = 'CONFIRMED';
      console.log('💰 No payment required - Setting appointment status to CONFIRMED');
    } else {
      console.log('💰 Payment required - Setting appointment status to PENDING_PAYMENT');
    }
    
    // Gửi theo format backend mong đợi với snake_case fields và proper data types
    const appointmentData = {
      // Backend hỗ trợ cả camelCase và snake_case với @JsonAlias
      patientId: parsedPatientId,
      patient_id: parsedPatientId,
      
      doctorId: parsedDoctorId,
      doctor_id: parsedDoctorId,
      
      slotId: parsedSlotId,
      slot_id: parsedSlotId,
      
      specialtyId: parsedSpecialtyId,
      specialty_id: parsedSpecialtyId,
      
      clinicId: parsedClinicId,
      clinic_id: parsedClinicId,
      
      appointmentDateTime: appointmentDateTime,
      appointment_date_time: appointmentDateTime,
      
      reasonForVisit: formData.reasonForVisit.trim(),
      reason_for_visit: formData.reasonForVisit.trim(),
      
      status: defaultStatus, // Sử dụng trạng thái đã xác định
      
      // Không gửi depositAmount để backend hiểu là null (bypass validation @DecimalMin)
      // depositAmount: null sẽ không trigger validation @DecimalMin
      
      isDepositPaid: defaultStatus === 'CONFIRMED', // Nếu CONFIRMED thì coi như đã "thanh toán"
      is_deposit_paid: defaultStatus === 'CONFIRMED'
    };

    console.log('📤 Final appointment data to send:', appointmentData);
    console.log('📤 Final appointment data - detailed check:');
    console.log('  - patientId:', appointmentData.patientId, '(type:', typeof appointmentData.patientId, ')');
    console.log('  - doctorId:', appointmentData.doctorId, '(type:', typeof appointmentData.doctorId, ')');
    console.log('  - slotId:', appointmentData.slotId, '(type:', typeof appointmentData.slotId, ')');
    console.log('  - specialtyId:', appointmentData.specialtyId, '(type:', typeof appointmentData.specialtyId, ')');
    console.log('  - clinicId:', appointmentData.clinicId, '(type:', typeof appointmentData.clinicId, ')');
    console.log('  - appointmentDateTime:', appointmentData.appointmentDateTime, '(type:', typeof appointmentData.appointmentDateTime, ')');

    // === BƯỚC 9: VALIDATION CUỐI CÙNG ===
    const invalidFields = [];
    
    // Kiểm tra các ID trước khi tạo appointmentData
    if (isNaN(parsedPatientId) || parsedPatientId <= 0) {
      invalidFields.push(`patientId: NaN or invalid (${userId} → ${parsedPatientId})`);
    }
    if (isNaN(parsedDoctorId) || parsedDoctorId <= 0) {
      invalidFields.push(`doctorId: NaN or invalid (${doctorId} → ${parsedDoctorId})`);
    }
    if (isNaN(parsedSlotId) || parsedSlotId <= 0) {
      invalidFields.push(`slotId: NaN or invalid (${slotId} → ${parsedSlotId})`);
    }
    if (isNaN(parsedSpecialtyId) || parsedSpecialtyId <= 0) {
      invalidFields.push(`specialtyId: NaN or invalid (${actualSpecialtyId} → ${parsedSpecialtyId})`);
    }
    if (isNaN(parsedClinicId) || parsedClinicId <= 0) {
      invalidFields.push(`clinicId: NaN or invalid (${actualClinicId} → ${parsedClinicId})`);
    }
    if (!appointmentDateTime || appointmentDateTime.trim() === '') {
      invalidFields.push(`appointmentDateTime: empty or null (${appointmentDateTime})`);
    }
    
    if (invalidFields.length > 0) {
      console.error('❌ Validation failed - Invalid fields:', invalidFields);
      console.error('❌ Full appointment data:', appointmentData);
      setError(`Dữ liệu không hợp lệ: ${invalidFields.join(', ')}. Vui lòng thử lại hoặc chọn lại từ đầu.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // === BƯỚC 10: CẬP NHẬT PHONE NUMBER NẾU CẦN ===
      let phoneUpdateSuccess = false;
      
      // CHỈ cập nhật nếu:
      // 1. User thực sự nhập số điện thoại mới (inputPhone không rỗng)
      // 2. Số điện thoại mới khác với số hiện tại
      // 3. Số điện thoại mới đã được validate và chuẩn hóa
      
      // Chỉ cập nhật khi user thực sự nhập số mới VÀ số đó khác với số hiện tại
      if (inputPhone && inputPhone !== currentPhone && normalizedPhone && normalizedPhone.length >= 10) {
        try {
          console.log('📞 Updating user phone number...');
          console.log('📞 Current phone:', currentPhone);
          console.log('📞 New phone (input):', inputPhone);
          console.log('📞 New phone (normalized):', normalizedPhone);
          
          await adminService.updateUserContactInfo(userId, {
            phoneNumber: normalizedPhone
          });
          
          console.log('✅ Phone number updated successfully');
          phoneUpdateSuccess = true;
          
          // Cập nhật thông tin local
          setUserInfo(prev => ({
            ...prev,
            phone_number: normalizedPhone
          }));
          
        } catch (phoneUpdateError) {
          console.error('❌ Failed to update phone number:', phoneUpdateError);
          showError('Không thể cập nhật số điện thoại của bạn lúc này. Lịch hẹn sẽ vẫn được tạo.', 'Cảnh báo');
        }
      } else {
        console.log('📞 No phone update needed:', {
          inputPhone,
          currentPhone,
          normalizedPhone,
          hasInput: !!inputPhone,
          isDifferent: inputPhone !== currentPhone,
          isValidNormalized: normalizedPhone && normalizedPhone.length >= 10
        });
      }

      // === BƯỚC 11: KIỂM TRA PAYMENT CONFIG VÀ CHUYỂN HƯỚNG ===
      console.log('🚀 Checking payment requirement:', { isPaymentRequired });

      // Chuẩn bị thông tin để hiển thị (sử dụng SĐT đã chuẩn hóa)
      const clinicName = clinicData?.name || clinicData?.clinic_name || slotData?.clinic?.name || slotData?.clinic?.clinic_name || doctorData?.clinic?.name || doctorData?.clinic?.clinic_name || doctorData?.specialties?.[0]?.clinic?.name || doctorData?.specialties?.[0]?.clinic?.clinic_name || 'Phòng khám mặc định';
      const doctorName = doctorData?.user?.full_name || doctorData?.user?.fullName || doctorData?.user?.name || doctorData?.fullName || doctorData?.full_name || doctorData?.name || 'Bác sĩ không xác định';
      const specialtyName = doctorData?.specialties?.map(s => s.name || s.specialty_name).join(', ') || doctorData?.specialty?.name || doctorData?.specialty?.specialty_name || slotData?.specialty?.name || slotData?.specialty?.specialty_name || 'Chuyên khoa chung';
      
      const appointmentInfo = {
        patientName: formData.patientName || userInfo.full_name,
        patientPhone: finalPhone, // Sử dụng số điện thoại cuối cùng (có thể là input hoặc current)
        patientEmail: formData.patientEmail || userInfo.email,
        doctorName: doctorName,
        specialtyName: specialtyName,
        clinicName: clinicName,
        appointmentDateTime: appointmentDateTime,
        reasonForVisit: formData.reasonForVisit
      };

      if (!isPaymentRequired) {
        console.log('🆓 No payment required. Creating appointment directly...');
        
        const freeAppointmentData = {
          ...appointmentData,
          status: 'CONFIRMED',
          isDepositPaid: true,
          is_deposit_paid: true,
          depositAmount: 0.0,
        };

        const response = await apiService.createAppointment(freeAppointmentData);
        console.log('✅ Free appointment created successfully:', response);
        
        navigate('/booking-success', {
          state: {
            appointment: response,
            paymentMethod: 'free',
            paymentStatus: 'completed',
            phoneUpdateSuccess: phoneUpdateSuccess
          }
        });

      } else {
        console.log('💰 Payment required. Navigating to payment page...');
        
        navigate('/payment', {
          state: {
            appointmentData: appointmentData,
            appointmentInfo: appointmentInfo,
            phoneUpdateSuccess: phoneUpdateSuccess
          }
        });
      }
      
    } catch (err) {
      console.error('❌ Create appointment error:', err);
      
      // Xử lý lỗi chi tiết và thân thiện với người dùng
      let errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại.';
      
      if (err.message) {
        if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin và thử lại.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          setTimeout(() => navigate('/'), 2000);
        } else if (err.message.includes('404')) {
          errorMessage = 'Không tìm thấy thông tin lịch khám hoặc bác sĩ. Vui lòng chọn lại.';
        } else if (err.message.includes('409') || err.message.includes('conflict')) {
          errorMessage = 'Lịch khám này đã được đặt bởi người khác. Vui lòng chọn slot khác.';
        } else if (err.message.includes('422')) {
          errorMessage = 'Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
        } else {
          // Extract meaningful error message from API response
          try {
            const match = err.message.match(/\{.*\}/);
            if (match) {
              const errorObj = JSON.parse(match[0]);
              if (errorObj.message) {
                errorMessage = errorObj.message;
              } else if (errorObj.details) {
                const detailMessages = Object.values(errorObj.details);
                errorMessage = `Lỗi validation: ${detailMessages.join(', ')}`;
              }
            }
          } catch {
            // Use original error message if parsing fails
            errorMessage = err.message;
          }
        }
      }
      
      setError(errorMessage);
      showError(errorMessage, 'Lỗi đặt lịch');
      
    } finally {
      setLoading(false);
    }
  };

  // UI khi đang tải cấu hình
  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-700 font-semibold">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  // UI khi có lỗi tải cấu hình
  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{configError}</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300"
              >
                Quay lại
              </button>
              <button
                onClick={fetchPaymentConfig}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra có dữ liệu từ location không
  if (!slotData || !doctorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Thông tin không hợp lệ</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Không tìm thấy thông tin lịch khám. Vui lòng quay lại trang chọn lịch để thử lại.
            </p>
            <button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Quay lại</span>
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
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      rows="4"
                      placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                      required
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
                      disabled={loading}
                      className={`flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <span>{isPaymentRequired ? 'Tiếp tục thanh toán' : 'Xác nhận đặt lịch'}</span>
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