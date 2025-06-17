import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, UserCog, 
  Stethoscope, Calendar, Clock, Mail, Phone, MapPin
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

// Error Boundary Component
class DoctorManagementErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DoctorManagement Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
          <div className="text-center">
            <UserCog className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-4">Không thể tải trang quản lý bác sĩ</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DoctorManagement = () => {
  // Notification system
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [modalFilterClinic, setModalFilterClinic] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    userId: '',
    bio: '',
    yearsOfExperience: 0,
    specialtyIds: []
  });
  const [specialtyLoading, setSpecialtyLoading] = useState({});

  // Debug: Log formData changes
  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  // Memoized handler for checkbox changes
  const handleSpecialtyChange = useCallback((specialtyId, checked) => {
    console.log(`handleSpecialtyChange called: ID=${specialtyId}, checked=${checked}`);
    setFormData(prevFormData => {
      const newSpecialtyIds = checked 
        ? [...prevFormData.specialtyIds, specialtyId]
        : prevFormData.specialtyIds.filter(id => id !== specialtyId);
      
      console.log('Previous specialtyIds:', prevFormData.specialtyIds);
      console.log('New specialtyIds:', newSpecialtyIds);
      
      return {
        ...prevFormData,
        specialtyIds: newSpecialtyIds
      };
    });
  }, []);

  // Stable fetchUsers function with useCallback
  const fetchUsers = useCallback(async (currentDoctors = []) => {
    try {
      const response = await adminService.getAllUsers();
      const allUsers = response.content || response || [];
      console.log('All users fetched:', allUsers);
      
      // Filter only DOCTOR role users who don't have doctor profile yet
      const doctorUsers = allUsers.filter(user => {
        const userRole = user.roleName || user.role_name;
        const userId = user.userId || user.user_id;
        const hasProfile = currentDoctors.some(doc => 
          (doc.user?.userId || doc.user?.user_id) === userId
        );
        console.log(`User ${user.email}: role=${userRole}, hasProfile=${hasProfile}, userId=${userId}, userIdType=${typeof userId}`);
        return userRole === 'DOCTOR' && !hasProfile && userId;
      });
      
      console.log('Available doctor users:', doctorUsers);
      setUsers(doctorUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      const doctorData = response.content || response || [];
      console.log('Fetched doctors data:', doctorData);
      console.log('First doctor sample:', doctorData[0]);
      
      // Debug: Check field formats
      if (doctorData.length > 0) {
        const firstDoc = doctorData[0];
        console.log('Doctor fields:', {
          doctorId: firstDoc.doctorId || firstDoc.doctor_id,
          yearsOfExperience: firstDoc.yearsOfExperience || firstDoc.years_of_experience,
          user: firstDoc.user,
          userFields: firstDoc.user ? {
            userId: firstDoc.user.userId || firstDoc.user.user_id,
            fullName: firstDoc.user.fullName || firstDoc.user.full_name,
            phoneNumber: firstDoc.user.phoneNumber || firstDoc.user.phone_number
          } : 'No user data'
        });
      }
      
      setDoctors(doctorData);
      
      // Fetch users after doctors are loaded
      await fetchUsers(doctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      showError('Không thể tải danh sách bác sĩ', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, showError]);

  const fetchSpecialties = useCallback(async () => {
    try {
      const response = await apiService.getSpecialties();
      const specialtyData = response.content || response || [];
      console.log('Fetched specialties:', specialtyData);
      setSpecialties(specialtyData);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      setSpecialties([]);
    }
  }, []);

  const fetchClinics = useCallback(async () => {
    try {
      const response = await apiService.getClinics();
      const clinicData = response.content || response || [];
      console.log('Fetched clinics:', clinicData);
      setClinics(clinicData);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setClinics([]);
    }
  }, []);

  // Filter specialties by clinic in modal
  const modalFilteredSpecialties = modalFilterClinic 
    ? specialties.filter(specialty => 
        (specialty.clinic?.clinicId || specialty.clinic?.clinic_id) === parseInt(modalFilterClinic)
      )
    : specialties;

  // Filter specialties by clinic
  useEffect(() => {
    console.log('Filtering specialties by clinic:', filterClinic);
    console.log('All specialties:', specialties);
    
    if (filterClinic) {
      const filtered = specialties.filter(specialty => {
        const clinicId = specialty.clinic?.clinicId || specialty.clinic?.clinic_id;
        console.log('Specialty clinic ID:', clinicId, 'Filter clinic ID:', parseInt(filterClinic));
        return clinicId === parseInt(filterClinic);
      });
      console.log('Filtered specialties:', filtered);
      setFilteredSpecialties(filtered);
    } else {
      setFilteredSpecialties(specialties);
    }
  }, [filterClinic, specialties]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchDoctors(),
          fetchSpecialties(),
          fetchClinics()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [fetchDoctors, fetchSpecialties, fetchClinics]);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.userId || formData.userId === 'N/A' || formData.userId.includes('N/A')) {
      showWarning('Vui lòng chọn người dùng hợp lệ từ danh sách', 'Thiếu thông tin');
      console.error('Invalid userId:', formData.userId);
      return;
    }
    
    // Additional validation to ensure userId is numeric/valid
    if (isNaN(formData.userId) && !formData.userId.match(/^[a-zA-Z0-9-_]+$/)) {
      showError('ID người dùng không hợp lệ. Vui lòng chọn lại từ danh sách.', 'Dữ liệu không hợp lệ');
      console.error('Invalid userId format:', formData.userId);
      return;
    }
    
    if (!formData.bio.trim()) {
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
    
    if (formData.specialtyIds.length > 10) {
      showError('Không thể gán quá 10 chuyên khoa cho một bác sĩ', 'Vượt quá giới hạn');
      return;
    }

    // Prevent duplicate submissions
    if (loading) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data in correct format for backend - DoctorDTO format
      const parsedYears = parseInt(formData.yearsOfExperience);
      const doctorData = {
        bio: formData.bio.trim(),
        yearsOfExperience: isNaN(parsedYears) ? 0 : parsedYears,
        specialtyIds: formData.specialtyIds.length > 0 ? formData.specialtyIds : [],
        primarySpecialtyId: formData.specialtyIds.length > 0 ? formData.specialtyIds[0] : null
      };
      
      console.log('Doctor data prepared:', {
        original: formData.yearsOfExperience,
        parsed: parsedYears,
        final: doctorData.yearsOfExperience,
        doctorData
      });
      
      console.log('Creating doctor with data:', {
        userId: formData.userId,
        userIdType: typeof formData.userId,
        doctorData: doctorData,
        fullFormData: formData,
        apiEndpoint: `POST /api/doctors/user/${formData.userId}`
      });
      
      // Create doctor profile using the correct API method
      const response = await adminService.createDoctorProfile(formData.userId, doctorData);
      
      console.log('Doctor profile created:', response);

      await fetchDoctors();
      setShowCreateModal(false);
      resetForm();
      showSuccess('Hồ sơ bác sĩ đã được tạo thành công!', 'Tạo thành công');
    } catch (error) {
      console.error('Error creating doctor:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        formData: formData
      });
      
      let errorMessage = '';
      let errorTitle = 'Lỗi khi tạo hồ sơ bác sĩ';
      
      if (error.message.includes('400')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        errorTitle = 'Dữ liệu không hợp lệ';
      } else if (error.message.includes('409') || error.message.includes('already exists')) {
        errorMessage = 'Người dùng này đã có hồ sơ bác sĩ.';
        errorTitle = 'Bác sĩ đã tồn tại';
      } else if (error.message.includes('404')) {
        errorMessage = 'Không tìm thấy người dùng.';
        errorTitle = 'Không tìm thấy người dùng';
      } else if (error.message.includes('500') || error.message.includes('OptimisticLocking')) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
        errorTitle = 'Lỗi hệ thống';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
        errorTitle = 'Lỗi kết nối';
      } else {
        errorMessage = error.message;
      }
      
      showError(errorMessage, errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    const doctorId = selectedDoctor?.doctorId || selectedDoctor?.doctor_id;
    if (!doctorId) {
      showError('Không tìm thấy ID bác sĩ. Vui lòng thử lại.', 'Lỗi dữ liệu');
      console.error('Update failed: selectedDoctor or doctorId is missing', selectedDoctor);
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Validate form data
      if (!formData.bio?.trim()) {
        showWarning('Vui lòng nhập tiểu sử', 'Thiếu thông tin');
        return;
      }
      
      if (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 60) {
        showError('Số năm kinh nghiệm phải từ 0 đến 60 năm', 'Giá trị không hợp lệ');
        return;
      }
      
      // Prepare data for DoctorUpdateDTO - chỉ bio và yearsOfExperience
      const doctorUpdateData = {
        bio: formData.bio.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
      };

      // Gửi yêu cầu cập nhật thông tin User (nếu cần)
      if (formData.fullName !== selectedDoctor.user?.fullName || formData.email !== selectedDoctor.user?.email) {
          const userId = selectedDoctor.user?.userId || selectedDoctor.user?.user_id;
          if (userId) {
            await adminService.updateUser(userId, {
                fullName: formData.fullName,
                email: formData.email,
            });
            showInfo('Thông tin người dùng cũng đã được cập nhật!', 'Cập nhật bổ sung');
          }
      }
      
      await adminService.updateDoctor(doctorId, doctorUpdateData);

      await fetchDoctors();
      setShowEditModal(false);
      resetForm();
      showSuccess('Thông tin bác sĩ đã được cập nhật thành công!', 'Cập nhật thành công');
    } catch (error) {
      console.error('Error updating doctor:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật bác sĩ';
      if (error.message.includes('400')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Không tìm thấy bác sĩ cần cập nhật.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
      }
      
      showError(errorMessage, 'Lỗi khi cập nhật bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    const doctorId = selectedDoctor?.doctorId || selectedDoctor?.doctor_id;
    if (!doctorId) {
      showError('Không tìm thấy ID bác sĩ. Vui lòng thử lại.', 'Lỗi dữ liệu');
      console.error('Delete failed: selectedDoctor or doctorId is missing', selectedDoctor);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await adminService.deleteDoctor(doctorId);
      await fetchDoctors();
      setShowDeleteModal(false);
      setSelectedDoctor(null);
      showSuccess('Bác sĩ đã được xóa thành công!', 'Xóa thành công');
      showWarning('Hồ sơ bác sĩ đã bị xóa, nhưng tài khoản người dùng vẫn còn.', 'Lưu ý');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xóa bác sĩ';
      if (error.message.includes('404')) {
        errorMessage = 'Không tìm thấy bác sĩ cần xóa.';
      } else if (error.message.includes('409')) {
        errorMessage = 'Không thể xóa bác sĩ có lịch hẹn đang hoạt động.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
      }
      
      showError(errorMessage, 'Lỗi khi xóa bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle specialty assignment
  const handleToggleSpecialty = async (specialtyId) => {
    const isCurrentlyAssigned = formData.specialtyIds.includes(specialtyId);
    const doctorId = selectedDoctor?.doctorId || selectedDoctor?.doctor_id;
    
    if (!doctorId) {
      showError('Không tìm thấy thông tin bác sĩ', 'Lỗi');
      return;
    }

    // Set loading state for this specialty
    setSpecialtyLoading(prev => ({ ...prev, [specialtyId]: true }));

    try {
      if (isCurrentlyAssigned) {
        // Remove specialty
        await adminService.removeDoctorSpecialty(doctorId, specialtyId);
        setFormData(prev => ({
          ...prev,
          specialtyIds: prev.specialtyIds.filter(id => id !== specialtyId)
        }));
        showSuccess('Đã gỡ bỏ chuyên khoa thành công!');
      } else {
        // Assign specialty
        await adminService.assignDoctorSpecialty(doctorId, specialtyId, false);
        setFormData(prev => ({
          ...prev,
          specialtyIds: [...prev.specialtyIds, specialtyId]
        }));
        showSuccess('Đã gán chuyên khoa thành công!');
      }
      
      // Refresh doctor data to get updated specialties
      await fetchDoctors();
    } catch (error) {
      console.error('Error toggling specialty:', error);
      showError(
        isCurrentlyAssigned 
          ? 'Không thể gỡ bỏ chuyên khoa. Vui lòng thử lại.' 
          : 'Không thể gán chuyên khoa. Vui lòng thử lại.',
        'Lỗi'
      );
    } finally {
      // Clear loading state for this specialty
      setSpecialtyLoading(prev => ({ ...prev, [specialtyId]: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bio: '',
      yearsOfExperience: 0,
      specialtyIds: []
    });
    setSelectedDoctor(null);
    setModalFilterClinic('');
    console.log('Form reset, specialtyIds:', []); // Debug log
  };

  const openEditModal = (doctor) => {
    console.log('Opening edit modal for doctor:', doctor);
    if (!doctor || !doctor.user) {
        console.error('Invalid doctor object passed to openEditModal', doctor);
        showError('Dữ liệu bác sĩ không hợp lệ.', 'Lỗi dữ liệu');
        return;
    }
    
    try {
      const user = doctor.user;
      setSelectedDoctor(doctor);
      setFormData({
        doctorId: doctor.doctorId || doctor.doctor_id,
        userId: user.userId || user.user_id,
        fullName: user.fullName || user.full_name || '',
        email: user.email || '',
        bio: doctor.bio || '',
        yearsOfExperience: doctor.yearsOfExperience || doctor.years_of_experience || 0,
        specialtyIds: doctor.specialties?.map(s => s.specialtyId || s.specialty_id).filter(id => id != null) || []
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      showError('Không thể mở form chỉnh sửa. Vui lòng thử lại.', 'Lỗi');
    }
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const user = doctor.user || {};
    const userName = user.fullName || user.full_name || '';
    const userEmail = user.email || '';
    const doctorBio = doctor.bio || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorBio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !filterSpecialty || 
                            doctor.specialties?.some(s => {
                              return (s.specialtyId || s.specialty_id) === Number(filterSpecialty);
                            });
    
    // Enhanced clinic filter logic with better debugging
    let matchesClinic = true;
    if (filterClinic) {
      matchesClinic = doctor.specialties?.some(s => {
        // Method 1: Check if clinic info is directly available in doctor's specialty
        const directClinicId = s.clinic?.clinicId || s.clinic?.clinic_id;
        
        // Method 2: Find the specialty in global specialties list to get clinic info
        const globalSpecialty = specialties.find(spec => 
          (spec.specialtyId || spec.specialty_id) === (s.specialtyId || s.specialty_id)
        );
        const globalClinicId = globalSpecialty?.clinic?.clinicId || globalSpecialty?.clinic?.clinic_id;
        
        // Use whichever method provides clinic info
        const clinicId = directClinicId || globalClinicId;
        const match = clinicId === parseInt(filterClinic);
        
        // Enhanced debug logging
        if (searchTerm.toLowerCase() === '' || userName.toLowerCase().includes(searchTerm.toLowerCase())) {
          console.log(`🔍 Doctor: ${userName}`, {
            filterClinic: parseInt(filterClinic),
            specialty: {
              id: s.specialtyId || s.specialty_id,
              name: s.name,
              directClinicId,
              globalClinicId,
              finalClinicId: clinicId,
              clinicName: s.clinic?.name || globalSpecialty?.clinic?.name
            },
            matches: match
          });
        }
        
        return match;
      }) || false;
    }
    
    return matchesSearch && matchesSpecialty && matchesClinic;
  });

  // Sort doctors
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    let compareValue = 0;
    const userA = a.user || {};
    const userB = b.user || {};
    if (sortBy === 'name') {
      const nameA = userA.fullName || userA.full_name || '';
      const nameB = userB.fullName || userB.full_name || '';
      compareValue = nameA.localeCompare(nameB);
    } else if (sortBy === 'experience') {
      const expA = a.yearsOfExperience || a.years_of_experience || 0;
      const expB = b.yearsOfExperience || b.years_of_experience || 0;
      compareValue = expA - expB;
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải danh sách bác sĩ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Bác sĩ</h2>
          
          {/* Function Buttons Row */}
          <div className="flex items-center gap-3">
            {/* Main Action Buttons - Larger */}
            <button
              onClick={() => {
                console.log('Opening create modal, resetting form...');
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm bác sĩ
            </button>
            
            {/* Clinic Filter Button */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterClinic}
                onChange={(e) => {
                  setFilterClinic(e.target.value);
                  setFilterSpecialty('');
                }}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm font-medium"
              >
                <option value="">Tất cả phòng khám</option>
                {clinics.map(clinic => (
                  <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Specialty Filter Button */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm font-medium"
              >
                <option value="">Tất cả chuyên khoa</option>
                {filteredSpecialties.map(specialty => (
                  <option key={specialty.specialtyId || specialty.specialty_id} value={specialty.specialtyId || specialty.specialty_id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Controls - Smaller */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Tên</option>
                <option value="experience">Kinh nghiệm</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-xs"
                title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Box Row */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDoctors.length > 0 ? sortedDoctors.map(doctor => {
                // Defensive programming - ensure doctor and user objects exist
                if (!doctor) {
                  console.warn('Null doctor object encountered');
                  return null;
                }

                // Backend trả về snake_case format: doctor_id, years_of_experience, etc.
                const user = doctor.user || {};
                const userName = user.full_name || user.fullName || 'N/A';
                const userEmail = user.email || 'N/A';
                const userPhone = user.phone_number || user.phoneNumber || 'N/A';
                const userImage = user.image_url || user.imageUrl;
                const doctorId = doctor.doctorId || doctor.doctor_id;
                
                // Skip if no valid doctor ID
                if (!doctorId) {
                  console.warn('Doctor without valid ID:', doctor);
                  return null;
                }
                
                return (
                  <tr key={doctorId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff`}
                            alt={userName}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.years_of_experience || doctor.yearsOfExperience || 0} năm kinh nghiệm
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {doctor.specialties?.length > 0 ? doctor.specialties.map(specialty => (
                          <div key={specialty.specialtyId || specialty.specialty_id} className="mb-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {specialty.name}
                            </span>
                            {specialty.clinic?.name && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                <MapPin className="inline h-3 w-3 mr-0.5" />
                                {specialty.clinic.name}
                              </div>
                            )}
                          </div>
                        )) : (
                          <span className="text-sm text-gray-500">Chưa có chuyên khoa</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-32">{userEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{userPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(doctor)}
                          className="p-1 rounded transition-colors text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          title="Chỉnh sửa bác sĩ"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(doctor)}
                          className="p-1 rounded transition-colors text-red-600 hover:text-red-900 hover:bg-red-50"
                          title="Xóa bác sĩ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }).filter(Boolean) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterSpecialty || filterClinic 
                      ? 'Không tìm thấy bác sĩ nào phù hợp với bộ lọc'
                      : 'Chưa có bác sĩ nào trong hệ thống'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm bác sĩ mới</h3>
              <form onSubmit={handleCreateDoctor}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn người dùng *
                    </label>
                    <select
                      required
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={users.length === 0}
                    >
                      <option value="">
                        {users.length > 0 ? 'Chọn tài khoản DOCTOR' : 'Đang tải tài khoản...'}
                      </option>
                      {users.length > 0 ? users.map(user => {
                        const userId = user.userId || user.user_id;
                        const fullName = user.fullName || user.full_name || 'Không có tên';
                        const email = user.email || 'Không có email';
                        
                        console.log('User in dropdown:', { userId, fullName, email, user }); // Debug log
                        
                        // Skip if userId is invalid
                        if (!userId || userId === 'N/A' || !userId.toString().trim()) {
                          console.warn('Skipping user with invalid userId:', userId);
                          return null;
                        }
                        
                        return (
                          <option key={userId} value={userId}>
                            {fullName} ({email})
                          </option>
                        );
                      }).filter(Boolean) : (
                        <option value="" disabled>Không có tài khoản DOCTOR khả dụng</option>
                      )}
                    </select>
                    {users.length === 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Không có tài khoản DOCTOR nào khả dụng để tạo hồ sơ bác sĩ.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mô tả kinh nghiệm, chuyên môn của bác sĩ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chuyên khoa
                    </label>
                    
                    {/* Clinic Filter in Modal */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Lọc theo phòng khám:
                      </label>
                      <select
                        value={modalFilterClinic}
                        onChange={(e) => setModalFilterClinic(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Tất cả phòng khám</option>
                        {clinics.map(clinic => (
                          <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {modalFilteredSpecialties.map((specialty) => {
                        const specialtyId = specialty.specialtyId || specialty.specialty_id;
                        const isSelected = formData.specialtyIds.includes(specialtyId);
                        
                        return (
                          <div key={`create-specialty-${specialtyId}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{specialty.name}</div>
                              {specialty.clinic?.name && (
                                <div className="text-sm text-gray-500">Phòng khám: {specialty.clinic.name}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
                                {isSelected ? 'Đã chọn' : 'Chưa chọn'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpecialtyChange(specialtyId, !isSelected)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  isSelected ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isSelected ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {modalFilteredSpecialties.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {modalFilterClinic 
                            ? 'Không có chuyên khoa nào trong phòng khám được chọn'
                            : 'Không có chuyên khoa nào khả dụng'
                          }
                        </p>
                      )}
                    </div>
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
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Đang tạo...' : 'Tạo bác sĩ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa thông tin bác sĩ: {selectedDoctor.user?.fullName || 'N/A'}
              </h3>
              <form onSubmit={handleUpdateDoctor}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Specialty Management Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quản lý chuyên khoa
                    </label>
                    
                    {/* Clinic Filter in Edit Modal */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Lọc theo phòng khám:
                      </label>
                      <select
                        value={modalFilterClinic}
                        onChange={(e) => setModalFilterClinic(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Tất cả phòng khám</option>
                        {clinics.map(clinic => (
                          <option key={clinic.clinicId || clinic.clinic_id} value={clinic.clinicId || clinic.clinic_id}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {modalFilteredSpecialties.map((specialty) => {
                        const specialtyId = specialty.specialtyId || specialty.specialty_id;
                        const isAssigned = formData.specialtyIds.includes(specialtyId);
                        
                        return (
                          <div key={`edit-specialty-${specialtyId}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{specialty.name}</div>
                              {specialty.clinic?.name && (
                                <div className="text-sm text-gray-500">Phòng khám: {specialty.clinic.name}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${isAssigned ? 'text-green-600' : 'text-gray-400'}`}>
                                {isAssigned ? 'Đã gán' : 'Chưa gán'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleSpecialty(specialtyId)}
                                disabled={specialtyLoading[specialtyId]}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                                  isAssigned ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                {specialtyLoading[specialtyId] ? (
                                  <div className="inline-block h-4 w-4 transform rounded-full bg-white animate-spin mx-auto">
                                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                ) : (
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      isAssigned ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {modalFilteredSpecialties.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {modalFilterClinic 
                            ? 'Không có chuyên khoa nào trong phòng khám được chọn'
                            : 'Không có chuyên khoa nào khả dụng'
                          }
                        </p>
                      )}
                    </div>
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Doctor Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xóa bác sĩ: {selectedDoctor.user?.fullName || 'N/A'}
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa bác sĩ này không?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDoctor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDoctor}
                  className="px-4 py-2 border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Xác nhận Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap component with Error Boundary
const DoctorManagementWithErrorBoundary = () => {
  return (
    <DoctorManagementErrorBoundary>
      <DoctorManagement />
    </DoctorManagementErrorBoundary>
  );
};

export default DoctorManagementWithErrorBoundary;