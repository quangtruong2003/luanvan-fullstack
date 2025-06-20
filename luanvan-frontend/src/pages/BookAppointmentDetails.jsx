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
    console.log('Doctor Data:', doctorData);
    console.log('Clinic Data:', clinicData);
    console.log('Slot Data:', slotData);
    console.log('Date:', date);
    
    if (doctorData?.user) {
      console.log('Doctor User Structure:', Object.keys(doctorData.user));
      console.log('Doctor full name:', doctorData.user.full_name);
    }
    if (clinicData) {
      console.log('Clinic Structure:', Object.keys(clinicData));
      console.log('Clinic name:', clinicData.name);
      console.log('Clinic address:', clinicData.address);
    }
  }, [currentUser, userInfo, formData, doctorData, clinicData, slotData, date]);// Xử lý khi người dùng thay đổi input
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

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;    if (!phoneRegex.test(formData.patientPhone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84)');
      return;
    }
    
    // Kiểm tra thông tin người dùng từ nhiều nguồn
    const userId = userInfo.user_id || currentUser?.id || currentUser?.user_id || currentUser?.userId;
    if (!userId) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    // Kiểm tra slot và doctor
    if (!slotData || !doctorData) {
      setError('Thông tin lịch khám không hợp lệ');
      return;
    }

    // Lấy thông tin cần thiết từ dữ liệu có sẵn
    const doctorId = doctorData.doctor_id || doctorData.doctorId;
    const slotId = slotData.slot_id || slotData.slotId;
    
    // Dùng ID của specialty đầu tiên nếu không có specialty được chọn
    let actualSpecialtyId = specialtyId;
    if (!actualSpecialtyId && doctorData.specialties && doctorData.specialties.length > 0) {
      actualSpecialtyId = doctorData.specialties[0].specialty_id || doctorData.specialties[0].specialtyId;
    }
      // Lấy ID phòng khám từ nhiều nguồn khác nhau
    let actualClinicId;
    if (clinicData) {
      actualClinicId = clinicData.clinic_id || clinicData.clinicId || clinicData.id;
    } else if (doctorData.clinic) {
      actualClinicId = doctorData.clinic.clinic_id || doctorData.clinic.clinicId || doctorData.clinic.id;
    } else if (doctorData.clinic_id) {
      actualClinicId = doctorData.clinic_id;
    } else if (slotData.clinic) {
      actualClinicId = slotData.clinic.clinic_id || slotData.clinic.clinicId || slotData.clinic.id;
    } else if (slotData.clinic_id) {
      actualClinicId = slotData.clinic_id;
    } else {
      // Sử dụng ID mặc định nếu không tìm thấy
      actualClinicId = 1;
    }

    // Kiểm tra thông tin quan trọng
    if (!doctorId || !slotId) {
      setError('Thiếu thông tin bác sĩ hoặc slot đã chọn');
      return;
    }

    // Định dạng thời gian khám đúng chuẩn API
    let appointmentTime = slotData.start_time || '00:00:00';
    // Đảm bảo định dạng hh:mm:ss.SSS
    if (appointmentTime.length <= 5) {
      appointmentTime = `${appointmentTime}:00.000`;
    } else if (!appointmentTime.includes('.')) {
      appointmentTime = `${appointmentTime}.000`;
    }    // Cấu trúc dữ liệu để gửi API
    const appointmentData = {
      patientId: userId,
      doctorId: doctorId,
      slotId: slotId,
      specialtyId: actualSpecialtyId || 1, // Dùng 1 làm giá trị mặc định nếu không tìm thấy
      clinicId: actualClinicId,
      // Đảm bảo định dạng đúng cho API, không có "Z" ở cuối
      appointmentDateTime: `${date}T${appointmentTime}`,
      reasonForVisit: formData.reasonForVisit.trim(),
      depositAmount: 0,
      isDepositPaid: false
    };

    setLoading(true);
    setError(null);

    try {
      console.log('Dữ liệu gửi đi:', appointmentData);
      const response = await apiService.createAppointment(appointmentData);
      console.log('Phản hồi từ API:', response);
      
      // Hiển thị thông báo thành công
      alert('Đặt lịch khám thành công! Cảm ơn bạn đã sử dụng dịch vụ.');
      
      // Chuyển hướng đến trang lịch hẹn
      navigate('/my-appointments');
    } catch (err) {
      console.error('Lỗi chi tiết:', err);
      
      // Tạo thông báo lỗi thân thiện hơn với người dùng
      let errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại.';
      
      if (err.message) {
        if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Không tìm thấy thông tin lịch khám hoặc bác sĩ.';
        } else if (err.message.includes('409')) {
          errorMessage = 'Lịch khám này đã được đặt. Vui lòng chọn lịch khám khác.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      alert(errorMessage);
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
            <h2 className="text-lg font-semibold text-blue-700 mb-4">Thông tin cuộc hẹn</h2>              <div className="mb-4">
              <div className="font-semibold text-gray-700">Bác sĩ:</div>
              <div className="flex items-center mt-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {doctorData?.user?.full_name?.charAt(0) || 'BS'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{doctorData?.user?.full_name || 'Bác sĩ không xác định'}</div>
                  <div className="text-sm text-gray-500">
                    {doctorData?.specialties?.map(s => s.name).join(', ') || 'Chuyên khoa chung'}
                  </div>
                </div>
              </div>
            </div><div className="mb-4">
              <div className="font-semibold text-gray-700">Phòng khám:</div>
              <div className="mt-1 text-gray-600">
                {clinicData?.name || 'Phòng khám mặc định'}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold text-gray-700">Ngày khám:</div>
              <div className="mt-1 text-gray-600">{formattedDate}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold text-gray-700">Giờ khám:</div>
              <div className="mt-1 text-gray-600">{formattedTime}</div>
            </div>            <div className="mb-2">
              <div className="font-semibold text-gray-700">Địa chỉ phòng khám:</div>
              <div className="mt-1 text-gray-600">
                {clinicData?.address || 'Chưa cập nhật địa chỉ'}
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