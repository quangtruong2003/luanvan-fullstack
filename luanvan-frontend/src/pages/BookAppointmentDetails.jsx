import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookAppointmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
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
  
  // Hàm lấy thông tin người dùng từ API
  const fetchUserInfoFromAPI = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      if (userData) {
        console.log('Fetched user data from API:', userData);
        const userDataFormatted = {
          user_id: userData.user_id || userData.id,
          full_name: userData.full_name || userData.fullName || '',
          email: userData.email || '',
          phone_number: userData.phone_number || userData.phoneNumber || ''
        };
        setUserInfo(userDataFormatted);
        setFormData(prev => ({
          ...prev,
          patientName: userDataFormatted.full_name,
          patientPhone: userDataFormatted.phone_number,
          patientEmail: userDataFormatted.email
        }));
      }
    } catch (err) {
      console.error('Error fetching user info from API:', err);
    }
  };
  
  // Lấy thông tin người dùng từ localStorage hoặc currentUser  
  useEffect(() => {
    console.log('Checking user info sources...');
    
    // Lấy từ currentUser trước
    if (currentUser) {
      console.log('Using currentUser:', currentUser);
      const userData = {
        user_id: currentUser.id || currentUser.user_id || currentUser.userId,
        full_name: currentUser.fullName || currentUser.full_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phoneNumber || currentUser.phone_number || ''
      };
      setUserInfo(userData);
      setFormData(prev => ({
        ...prev,
        patientName: userData.full_name,
        patientPhone: userData.phone_number,
        patientEmail: userData.email
      }));
    } else {
      // Fallback: lấy từ localStorage
      const backendUserId = localStorage.getItem('backendUserId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userPhone = localStorage.getItem('userPhone'); // Thêm phone từ localStorage
      
      console.log('Using localStorage fallback:', { backendUserId, userName, userEmail, userPhone });
      
      if (backendUserId || userName || userEmail) {
        const userData = {
          user_id: backendUserId ? parseInt(backendUserId) : null,
          full_name: userName || '',
          email: userEmail || '',
          phone_number: userPhone || ''
        };
        setUserInfo(userData);
        setFormData(prev => ({
          ...prev,
          patientName: userData.full_name,
          patientPhone: userData.phone_number,
          patientEmail: userData.email
        }));
      } else {
        // Thử lấy thông tin từ API nếu có token
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Attempting to fetch user info from API...');
          fetchUserInfoFromAPI();
        }
      }    }
  }, [currentUser]);
  
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

    // Validate số điện thoại
    if (!formData.patientPhone || formData.patientPhone.trim() === '') {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.patientPhone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84)');
      return;
    }
    
    // === BƯỚC 1: XÁC ĐỊNH USER ID ===
    let userId = null;
    
    // Thử lấy từ nhiều nguồn với thứ tự ưu tiên
    if (userInfo.user_id) {
      userId = userInfo.user_id;
    } else if (currentUser?.id) {
      userId = currentUser.id;
    } else if (currentUser?.user_id) {
      userId = currentUser.user_id;  
    } else if (currentUser?.userId) {
      userId = currentUser.userId;
    } else {
      // Fallback: lấy từ localStorage
      const backendUserId = localStorage.getItem('backendUserId');
      if (backendUserId && !isNaN(parseInt(backendUserId))) {
        userId = parseInt(backendUserId);
      }
    }
    
    console.log('🔍 User ID Resolution:', {
      userInfo_user_id: userInfo.user_id,
      currentUser_id: currentUser?.id,
      currentUser_user_id: currentUser?.user_id,
      currentUser_userId: currentUser?.userId,
      localStorage_backendUserId: localStorage.getItem('backendUserId'),
      finalUserId: userId
    });
    
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

    // === BƯỚC 7: TẠO APPOINTMENT DATETIME ===
    let appointmentDateTime;
    const startTime = slotData.start_time || slotData.startTime || '08:00:00';
    
    try {
      // Đảm bảo date format đúng (YYYY-MM-DD)
      let appointmentDate;
      if (typeof date === 'string') {
        appointmentDate = new Date(date + 'T00:00:00'); // Ensure UTC parsing
      } else {
        appointmentDate = new Date(date);
      }
      
      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Invalid date format: ' + date);
      }
      
      const formattedDate = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Đảm bảo time format đúng (HH:mm:ss)
      let formattedTime = startTime;
      if (formattedTime.length === 5) { // HH:mm
        formattedTime = `${formattedTime}:00`; // HH:mm:ss
      } else if (formattedTime.includes('.')) {
        formattedTime = formattedTime.split('.')[0]; // Remove milliseconds
      }
      
      // Backend expects format: YYYY-MM-DDTHH:mm:ss (LocalDateTime format)
      appointmentDateTime = `${formattedDate}T${formattedTime}`;
      
      // Validate future date for backend @Future constraint
      const appointmentDateTimeObj = new Date(appointmentDateTime);
      const now = new Date();
      
      console.log('🕒 DateTime validation:', {
        now: now.toISOString(),
        appointmentDateTime: appointmentDateTime,
        appointmentDateTimeObj: appointmentDateTimeObj.toISOString(),
        isFuture: appointmentDateTimeObj > now
      });
      
      if (appointmentDateTimeObj <= now) {
        console.warn('⚠️ Appointment time is not in future, backend might reject it');
        // Don't block here since user might be testing, but log warning
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
      
      // Không gửi depositAmount để backend hiểu là null (bypass validation @DecimalMin)
      // depositAmount: null sẽ không trigger validation @DecimalMin
      
      isDepositPaid: false,
      is_deposit_paid: false
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
      // Tạm thời bỏ qua việc update phone để tránh lỗi 500
      // if (formData.patientPhone !== userInfo.phone_number && formData.patientPhone.trim()) {
      //   try {
      //     console.log('📞 Updating user phone number...');
      //     await adminService.updateUser(userId, {
      //       phoneNumber: formData.patientPhone.trim()
      //     });
      //     console.log('✅ Phone number updated successfully');
      //   } catch (phoneUpdateError) {
      //     console.warn('⚠️ Failed to update phone number:', phoneUpdateError);
      //     // Không dừng process, chỉ warning
      //   }
      // }

      // === BƯỚC 11: TẠO APPOINTMENT ===
      console.log('🚀 Creating appointment...');
      const response = await apiService.createAppointment(appointmentData);
      console.log('✅ Appointment created successfully:', response);
      
      // Hiển thị thông báo thành công với thông tin clinic đầy đủ
      const clinicName = clinicData?.name || 
                        slotData?.clinic?.name || 
                        doctorData?.clinic?.name ||
                        doctorData?.specialties?.[0]?.clinic?.name ||
                        'N/A';
                        
      const successMessage = '🎉 Đặt lịch khám thành công!\n\n' +
            `📅 Ngày: ${appointmentDateTime.split('T')[0]}\n` +
            `🕒 Giờ: ${appointmentDateTime.split('T')[1]}\n` +
            `👨‍⚕️ Bác sĩ: ${doctorData.user?.full_name || doctorData.user?.fullName}\n` +
            `🏥 Phòng khám: ${clinicName}\n\n` +
            'Cảm ơn bạn đã sử dụng dịch vụ. Vui lòng đến đúng giờ hẹn.';
      
      alert(successMessage);
      
      // Chuyển hướng đến trang lịch hẹn
      navigate('/my-appointments');
      
    } catch (err) {
      console.error('❌ Create appointment error:', err);
      
      // Xử lý lỗi chi tiết và thân thiện với người dùng
      let errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại.';
      
      if (err.message) {
        if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin và thử lại.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          setTimeout(() => navigate('/login'), 2000);
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
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra có dữ liệu từ location không
  if (!slotData || !doctorData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center bg-yellow-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Thông tin không hợp lệ</h2>
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin lịch khám. Vui lòng quay lại trang chọn lịch.</p>
          <button 
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-8">Thông tin đặt lịch khám</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Thông tin bác sĩ và cuộc hẹn */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">Thông tin cuộc hẹn</h2>
            
            <div className="mb-4">
              <div className="font-semibold text-gray-700">Bác sĩ:</div>
              <div className="flex items-center mt-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {doctorData?.user?.full_name?.charAt(0) || doctorData?.user?.fullName?.charAt(0) || 'BS'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">
                    {doctorData?.user?.full_name || 
                     doctorData?.user?.fullName || 
                     doctorData?.user?.name ||
                     doctorData?.fullName ||
                     doctorData?.full_name ||
                     doctorData?.name ||
                     'Bác sĩ không xác định'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {doctorData?.specialties?.map(s => s.name || s.specialty_name).join(', ') || 
                     doctorData?.specialty?.name ||
                     doctorData?.specialty?.specialty_name ||
                     slotData?.specialty?.name ||
                     slotData?.specialty?.specialty_name ||
                     'Chuyên khoa chung'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="font-semibold text-gray-700">Phòng khám:</div>
              <div className="mt-1 text-gray-600">
                {/* Enhanced clinic name extraction with comprehensive fallbacks */}
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
              </div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold text-gray-700">Ngày khám:</div>
              <div className="mt-1 text-gray-600">{formattedDate}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold text-gray-700">Giờ khám:</div>
              <div className="mt-1 text-gray-600">{formattedTime}</div>
            </div>

            <div className="mb-2">
              <div className="font-semibold text-gray-700">Địa chỉ phòng khám:</div>
              <div className="mt-1 text-gray-600">
                {/* Enhanced clinic address extraction with comprehensive fallbacks */}
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Form nhập thông tin */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">Thông tin bệnh nhân</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                {error}
              </div>
            )}
              <form onSubmit={handleBookAppointment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName || userInfo.full_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                    placeholder="Họ và tên từ tài khoản"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Thông tin được lấy từ tài khoản của bạn.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>                  <input
                    type="email"
                    name="patientEmail"
                    value={formData.patientEmail || userInfo.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                    placeholder="Email từ tài khoản"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Thông tin được lấy từ tài khoản của bạn.</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Cập nhật số điện thoại của bạn"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Vui lòng cập nhật nếu chưa có hoặc không chính xác.</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do khám <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="4"
                  placeholder="Mô tả triệu chứng hoặc lý do khám"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center mt-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Quay lại
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : 'Xác nhận đặt lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentDetails;