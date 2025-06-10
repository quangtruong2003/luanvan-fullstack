import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, UserCog, 
  Stethoscope, Calendar, Clock, Mail, Phone, MapPin
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    userId: '',
    bio: '',
    yearsOfExperience: 0,
    profilePictureURL: '',
    specialtyIds: []
  });

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
    fetchUsers();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      const doctorData = response.content || response || [];
      console.log('Fetched doctors data:', doctorData); // Debug log
      setDoctors(doctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
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

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      // Filter only DOCTOR role users who don't have doctor profile yet
      const doctorUsers = (response.content || response || []).filter(user => 
        user.role?.roleName === 'DOCTOR' && !doctors.some(doc => doc.doctorId === user.userId)
      );
      setUsers(doctorUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDoctorProfile(formData.userId, {
        bio: formData.bio,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        profilePictureURL: formData.profilePictureURL
      });

      // Assign specialties if selected
      if (formData.specialtyIds.length > 0) {
        for (const specialtyId of formData.specialtyIds) {
          await adminService.assignSpecialty(formData.userId, specialtyId);
        }
      }

      fetchDoctors();
      setShowCreateModal(false);
      resetForm();
      alert('Tạo hồ sơ bác sĩ thành công!');
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert('Lỗi khi tạo hồ sơ bác sĩ: ' + error.message);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    const doctorId = selectedDoctor?.doctorId;
    if (!doctorId) {
      alert('Lỗi: Không tìm thấy ID bác sĩ. Vui lòng thử lại.');
      console.error('Update failed: selectedDoctor or doctorId is missing', selectedDoctor);
      return;
    }
    
    try {
      // Chỉ gửi những trường cần cập nhật cho hồ sơ bác sĩ
      const doctorUpdateData = {
        bio: formData.bio,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
      };

      // Gửi yêu cầu cập nhật thông tin User (nếu cần)
      if (formData.fullName !== selectedDoctor.user?.fullName || formData.email !== selectedDoctor.user?.email) {
          await adminService.updateUser(selectedDoctor.user.userId, {
              fullName: formData.fullName,
              email: formData.email,
              // Các trường khác của User có thể thêm ở đây
          });
      }
      
      await adminService.updateDoctor(doctorId, doctorUpdateData);

      fetchDoctors();
      setShowEditModal(false);
      resetForm();
      alert('Cập nhật thông tin bác sĩ thành công!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Lỗi khi cập nhật bác sĩ: ' + error.message);
    }
  };

  const handleDeleteDoctor = async () => {
    const doctorId = selectedDoctor?.doctorId;
    if (!doctorId) {
      alert('Lỗi: Không tìm thấy ID bác sĩ. Vui lòng thử lại.');
      console.error('Delete failed: selectedDoctor or doctorId is missing', selectedDoctor);
      return;
    }

    try {
      await adminService.deleteDoctor(doctorId);
      fetchDoctors();
      setShowDeleteModal(false);
      setSelectedDoctor(null);
      alert('Đã xóa bác sĩ thành công!');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Lỗi khi xóa bác sĩ: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bio: '',
      yearsOfExperience: 0,
      profilePictureURL: '',
      specialtyIds: []
    });
    setSelectedDoctor(null);
  };

  const openEditModal = (doctor) => {
    console.log('Opening edit modal for doctor:', doctor); // Debug log
    if (!doctor || !doctor.user) {
        console.error('Invalid doctor object passed to openEditModal', doctor);
        alert('Lỗi: Dữ liệu bác sĩ không hợp lệ.');
        return;
    }
    setSelectedDoctor(doctor);
    setFormData({
      doctorId: doctor.doctorId,
      userId: doctor.user.userId,
      fullName: doctor.user.fullName || '',
      email: doctor.user.email || '',
      bio: doctor.bio || '',
      yearsOfExperience: doctor.yearsOfExperience || 0,
      profilePictureURL: doctor.user.imageUrl || '',
      specialtyIds: doctor.specialties?.map(s => s.specialtyId) || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const user = doctor.user || {};
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || 
                            doctor.specialties?.some(s => s.specialtyId.toString() === filterSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  // Sort doctors
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    let compareValue = 0;
    const userA = a.user || {};
    const userB = b.user || {};
    if (sortBy === 'name') {
      compareValue = (userA.fullName || '').localeCompare(userB.fullName || '');
    } else if (sortBy === 'experience') {
      compareValue = (a.yearsOfExperience || 0) - (b.yearsOfExperience || 0);
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

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
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Bác sĩ</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm bác sĩ
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map(specialty => (
                <option key={specialty.specialtyId} value={specialty.specialtyId}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="experience">Sắp xếp theo kinh nghiệm</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDoctors.map(doctor => {
          const user = doctor.user || {};
          return (
          <div key={doctor.doctorId} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                 <img 
                    src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full"
                  />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.fullName || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {doctor.yearsOfExperience || 0} năm kinh nghiệm
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phoneNumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  {doctor.specialties?.map(s => s.name).join(', ') || 'Chưa có chuyên khoa'}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {doctor.bio || 'Chưa có thông tin giới thiệu'}
              </p>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(doctor)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Sửa
                </button>
                <button
                  onClick={() => openDeleteModal(doctor)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bác sĩ</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm bác sĩ mới.</p>
        </div>
      )}

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
                    >
                      <option value="">Chọn tài khoản DOCTOR</option>
                      {users.map(user => (
                        <option key={user.userId} value={user.userId}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL ảnh đại diện
                    </label>
                    <input
                      type="url"
                      value={formData.profilePictureURL}
                      onChange={(e) => setFormData({...formData, profilePictureURL: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên khoa
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {specialties.map(specialty => (
                        <label key={specialty.specialtyId} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.specialtyIds.includes(specialty.specialtyId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  specialtyIds: [...formData.specialtyIds, specialty.specialtyId]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  specialtyIds: formData.specialtyIds.filter(id => id !== specialty.specialtyId)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{specialty.name}</span>
                        </label>
                      ))}
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Tạo bác sĩ
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL ảnh đại diện
                    </label>
                    <input
                      type="url"
                      value={formData.profilePictureURL}
                      onChange={(e) => setFormData({...formData, profilePictureURL: e.target.value})}
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

export default DoctorManagement; 