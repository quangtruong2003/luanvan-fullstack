import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCog, Stethoscope, Calendar, Clock, Mail, Phone, MapPin,
  Edit, Save, X, AlertCircle, CheckCircle, RefreshCw, User
} from 'lucide-react';
import { apiService, doctorService } from '../../../services/api';
import { useNotification } from '../../../components/NotificationSystem';

const DoctorProfileManagement = () => {
  // Notification system
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  
  const [formData, setFormData] = useState({
    bio: '',
    yearsOfExperience: 0,
    fullName: '',
    phoneNumber: '',
    email: '', // Read-only for doctor
    specialtyIds: []
  });

  // Get current user info
  const currentUserId = localStorage.getItem('userId');
  const currentUserRole = localStorage.getItem('userRole');

  // Fetch current doctor's profile
  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use doctorService to get current doctor's profile
      const doctorProfile = await doctorService.getMyProfile();
      
      if (!doctorProfile) {
        showWarning('Chưa có hồ sơ bác sĩ. Vui lòng liên hệ admin để tạo hồ sơ.', 'Chưa có hồ sơ');
        return;
      }

      console.log('Current doctor profile:', doctorProfile);
      setDoctor(doctorProfile);
      
      // Populate form data
      setFormData({
        bio: doctorProfile.bio || '',
        yearsOfExperience: doctorProfile.years_of_experience || doctorProfile.yearsOfExperience || 0,
        fullName: doctorProfile.user?.fullName || doctorProfile.user?.full_name || '',
        phoneNumber: doctorProfile.user?.phoneNumber || doctorProfile.user?.phone_number || '',
        email: doctorProfile.user?.email || '', // Read-only
        specialtyIds: doctorProfile.specialties?.map(s => s.specialtyId || s.specialty_id) || []
      });
      
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      
      // Handle authentication errors
      if (error.message.includes('Dữ liệu xác thực không hợp lệ') || 
          error.message.includes('User not found') ||
          error.message.includes('Không tìm thấy thông tin bác sĩ')) {
        showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Lỗi xác thực');
        // Clear localStorage and redirect
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      showError('Không thể tải thông tin hồ sơ bác sĩ', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [showError, showWarning]);

  // Fetch specialties and clinics
  const fetchSpecialtiesAndClinics = useCallback(async () => {
    try {
      const [specialtiesRes, clinicsRes] = await Promise.all([
        apiService.getSpecialties(),
        apiService.getClinics()
      ]);
      
      setSpecialties(specialtiesRes.content || specialtiesRes || []);
      setClinics(clinicsRes.content || clinicsRes || []);
    } catch (error) {
      console.error('Error fetching specialties/clinics:', error);
    }
  }, []);

  useEffect(() => {
    fetchDoctorProfile();
    fetchSpecialtiesAndClinics();
  }, [fetchDoctorProfile, fetchSpecialtiesAndClinics]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!doctor) {
      showError('Không tìm thấy thông tin bác sĩ', 'Lỗi dữ liệu');
      return;
    }

    // Validation
    if (!formData.bio?.trim()) {
      showWarning('Vui lòng nhập tiểu sử', 'Thiếu thông tin');
      return;
    }

    if (formData.bio.trim().length > 1000) {
      showError('Tiểu sử không được vượt quá 1000 ký tự', 'Vượt quá giới hạn');
      return;
    }

    if (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 60) {
      showError('Số năm kinh nghiệm phải từ 0 đến 60 năm', 'Giá trị không hợp lệ');
      return;
    }

    if (!formData.fullName?.trim()) {
      showWarning('Vui lòng nhập họ tên', 'Thiếu thông tin');
      return;
    }

    setUpdating(true);
    
    try {
      const doctorId = doctor.doctorId || doctor.doctor_id;
      const userId = doctor.user?.userId || doctor.user?.user_id;
      
      // Update doctor profile (bio, yearsOfExperience)
      const doctorUpdateData = {
        bio: formData.bio.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10)
      };

      // Update doctor profile using doctorService
      await doctorService.updateMyProfile({
        bio: formData.bio.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber?.trim() || ''
      });

      // Refresh profile data
      await fetchDoctorProfile();
      setIsEditing(false);
      showSuccess('Hồ sơ bác sĩ đã được cập nhật thành công!', 'Cập nhật thành công');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật hồ sơ';
      if (error.message.includes('400')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Không có quyền cập nhật hồ sơ này.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Không tìm thấy hồ sơ bác sĩ.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
      }
      
      showError(errorMessage, 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setUpdating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (doctor) {
      setFormData({
        bio: doctor.bio || '',
        yearsOfExperience: doctor.yearsOfExperience || doctor.years_of_experience || 0,
        fullName: doctor.user?.fullName || doctor.user?.full_name || '',
        phoneNumber: doctor.user?.phoneNumber || doctor.user?.phone_number || '',
        email: doctor.user?.email || '',
        specialtyIds: doctor.specialties?.map(s => s.specialtyId || s.specialty_id) || []
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải hồ sơ bác sĩ...</span>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <UserCog className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hồ sơ bác sĩ</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Tài khoản của bạn chưa có hồ sơ bác sĩ. Vui lòng liên hệ admin để được tạo hồ sơ bác sĩ.
        </p>
        <button
          onClick={fetchDoctorProfile}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tải lại
        </button>
      </div>
    );
  }

  const user = doctor.user || {};
  const userName = user.full_name || user.fullName || 'N/A';
  const userEmail = user.email || 'N/A';
  const userPhone = user.phone_number || user.phoneNumber || 'N/A';
  const userImage = user.image_url || user.imageUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Hồ sơ Bác sĩ</h2>
            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân và hồ sơ nghề nghiệp</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 mb-4">
              <img 
                className="h-24 w-24 rounded-full object-cover mx-auto"
                src={userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff&size=96`}
                alt={userName}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff&size=96`;
                }}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{userName}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {doctor.years_of_experience || doctor.yearsOfExperience || 0} năm kinh nghiệm
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{userPhone || 'Chưa có'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Không thể chỉnh sửa)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <AlertCircle className="h-4 w-4 text-gray-400" title="Email không thể thay đổi" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email không thể thay đổi. Liên hệ admin nếu cần cập nhật email.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin nghề nghiệp</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                      placeholder="Nhập số năm kinh nghiệm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử / Mô tả *
                    </label>
                    <textarea
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      maxLength={1000}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                      placeholder="Mô tả về bản thân, kinh nghiệm, thành tích..."
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mô tả chi tiết về kinh nghiệm và chuyên môn của bạn</span>
                      <span>{formData.bio.length}/1000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Chuyên khoa</h4>
                
                {doctor.specialties && doctor.specialties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctor.specialties.map(specialty => {
                      // Handle different data structures from backend
                      const specialtyId = specialty.specialtyId || specialty.specialty_id;
                      const specialtyName = specialty.specialtyName || specialty.name || specialty.specialty?.name || 'Chưa có tên';
                      const clinicName = specialty.clinic?.clinicName || specialty.clinic?.name || specialty.clinicName || 'Chưa có phòng khám';
                      const clinicAddress = specialty.clinic?.address || specialty.clinic?.clinic_address || '';
                      const description = specialty.description || specialty.specialty?.description || '';
                      
                      return (
                        <div key={specialtyId} 
                             className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                              <div>
                                <h5 className="font-medium text-gray-900">{specialtyName}</h5>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {clinicName}
                                </p>
                                {clinicAddress && (
                                  <p className="text-xs text-gray-500 mt-1 ml-4">
                                    {clinicAddress}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {description && (
                            <p className="text-sm text-gray-600 mt-2">{description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">Chưa có chuyên khoa nào</p>
                    <p className="text-xs text-gray-400 mt-1">Liên hệ admin để được gán chuyên khoa</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileManagement; 