import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, Stethoscope, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

const UserManagement = () => {
  const { showSuccess, showError } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'DOCTOR'
  });  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm || filterRole) {
        // Sử dụng API search nếu có từ khóa hoặc filter
        response = await adminService.searchUsers(searchTerm, filterRole);
      } else {
        // Sử dụng API getAllUsers nếu không có filter
        response = await adminService.getAllUsers();
      }
      
      // Xử lý response - có thể là Page object hoặc array trực tiếp
      let userData;
      if (response && response.content) {
        // Nếu là Page object
        userData = response.content;
      } else if (Array.isArray(response)) {
        // Nếu là array trực tiếp
        userData = response;
      } else {
        // Fallback
        userData = [];
      }      // Validate và set users
      if (Array.isArray(userData)) {
        setUsers(userData);
        setLastUpdated(new Date());
      } else {
        console.error('User data is not an array:', userData);
        setUsers([]);
        setError('Dữ liệu người dùng không hợp lệ');
      }
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng: ' + (err.message || 'Lỗi không xác định'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole]);// Initial load and user role setup
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setCurrentUserRole(userRole || '');
  }, []);

  // Debounced search - fetch users when search term or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Transform data to match backend API format
      const createData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      };
      
      await adminService.createUser(createData);
      
      setShowCreateModal(false);
      setFormData({ email: '', password: '', fullName: '', phoneNumber: '', role: 'DOCTOR' });
      
      // Refresh users list
      await fetchUsers();
      showSuccess('Tạo người dùng thành công!');
    } catch (err) {
      console.error('Error creating user:', err);
      showError('Lỗi tạo người dùng: ' + (err.message || 'Lỗi không xác định'));
    }
  };  const handleToggleStatus = async (userId, isActive) => {
    try {
      // Kiểm tra userId
      if (!userId || userId === undefined || userId === null) {
        throw new Error('ID người dùng không hợp lệ');
      }
      
      if (isActive) {
        await adminService.deactivateUser(userId);
      } else {
        await adminService.activateUser(userId);
      }
        // Refresh users list
      await fetchUsers();
      showSuccess(isActive ? 'Đã vô hiệu hóa người dùng thành công!' : 'Đã kích hoạt người dùng thành công!');
    } catch (err) {
      console.error('Error toggling user status:', err);
      showError('Lỗi thay đổi trạng thái: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.full_name || '',
      phoneNumber: user.phone_number || '',
      role: user.role_name || 'PATIENT'
    });
    setShowEditModal(true);
  };  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUser?.user_id) {
        throw new Error('ID người dùng không hợp lệ');
      }
        const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      await adminService.updateUser(selectedUser.user_id, updateData);
        // Update local state immediately with the new data
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === selectedUser.user_id 
            ? { ...user, full_name: formData.fullName, email: formData.email, phone_number: formData.phoneNumber }
            : user
        )
      );
      
      // Clear form and modal
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', fullName: '', phoneNumber: '', role: 'DOCTOR' });
      
      // Show success notification
      showSuccess('Cập nhật thông tin người dùng thành công!');
      
      // Fetch fresh data to ensure synchronization
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      showError('Lỗi cập nhật người dùng: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      if (!selectedUser?.user_id) {
        throw new Error('ID người dùng không hợp lệ');
      }

      // Vô hiệu hóa thay vì xóa hoàn toàn
      await adminService.deactivateUser(selectedUser.user_id);
      
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      await fetchUsers();
      showSuccess('Đã vô hiệu hóa người dùng thành công!');
    } catch (err) {
      console.error('Error deleting user:', err);
      showError('Lỗi xóa người dùng: ' + (err.message || 'Lỗi không xác định'));
    }
  };const getRoleDisplayName = (roleName) => {
    switch(roleName) {
      case 'ADMIN': return 'Quản trị viên';
      case 'DOCTOR': return 'Bác sĩ';
      case 'PATIENT': return 'Bệnh nhân';
      default: return roleName || 'N/A';
    }
  };

  const getRoleColor = (roleName) => {
    switch(roleName) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'PATIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang tải danh sách người dùng...</span>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
        </div>        {/* Chỉ cho phép admin tạo doctor */}
        <div className="flex items-center space-x-4">          <button
            onClick={() => {
              setRefreshKey(prev => prev + 1);
              fetchUsers();
            }}
            className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            title={`Làm mới dữ liệu${lastUpdated ? ` - Cập nhật lần cuối: ${lastUpdated.toLocaleTimeString('vi-VN')}` : ''}`}
          >
            <Users className="w-4 h-4 mr-1" />
            Làm mới
            {lastUpdated && (
              <span className="ml-1 text-xs">
                ({lastUpdated.toLocaleTimeString('vi-VN')})
              </span>
            )}
          </button>
          
          {currentUserRole === 'ADMIN' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Thêm Bác Sĩ
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="font-semibold">Lỗi:</span>
            <span className="ml-2">{error}</span>
          </div>
          <button 
            onClick={fetchUsers}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="PATIENT">Bệnh nhân</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" key={refreshKey}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => {
                return (
                  <tr key={user.user_id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=3B82F6&color=fff`}
                            alt={user.full_name || 'User'}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=3B82F6&color=fff`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Chưa cập nhật'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || 'Chưa có email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role_name)}`}>
                        {getRoleDisplayName(user.role_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {user.phone_number || 'Chưa có SĐT'}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {user.user_id || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">                        {/* Nút chỉnh sửa - chỉ admin */}
                        {currentUserRole === 'ADMIN' && user.user_id && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 rounded transition-colors text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Nút xóa - chỉ admin và không phải chính mình */}
                        {currentUserRole === 'ADMIN' && user.user_id && user.role_name !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1 rounded transition-colors text-red-600 hover:text-red-900 hover:bg-red-50"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Nút kích hoạt/vô hiệu hóa - chỉ admin */}
                        {currentUserRole === 'ADMIN' && user.user_id && (
                          <button
                            onClick={() => handleToggleStatus(user.user_id, user.active)}
                            className={`p-1 rounded transition-colors ${
                              user.active
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                        
                        {(!user.user_id || currentUserRole !== 'ADMIN') && (
                          <span className="text-gray-400 text-xs">
                            {!user.user_id ? 'ID không hợp lệ' : 'Không có quyền'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>        {users.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterRole ? 'Không tìm thấy người dùng phù hợp với bộ lọc.' : 'Chưa có người dùng nào trong hệ thống.'}
            </p>
            {error && (
              <button 
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tải lại
              </button>
            )}
          </div>
        )}
      </div>      {/* Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-500" />
              Tạo Tài Khoản Bác Sĩ
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
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
                  placeholder="doctor@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bác sĩ Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                  pattern="[0-9]{10,11}"
                />
              </div>

              {/* Vai trò cố định là DOCTOR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <input
                  type="text"
                  value="Bác sĩ"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ email: '', password: '', fullName: '', phoneNumber: '', role: 'DOCTOR' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Tạo Bác Sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-500" />
              Chỉnh Sửa Thông Tin Người Dùng
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
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
                  Họ tên *
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
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  pattern="[0-9]{10,11}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò hiện tại
                </label>
                <input
                  type="text"
                  value={getRoleDisplayName(selectedUser.role_name)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setFormData({ email: '', password: '', fullName: '', phoneNumber: '', role: 'DOCTOR' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Xác Nhận Xóa Người Dùng
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa người dùng này không?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{selectedUser.full_name || 'Chưa có tên'}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">
                  Vai trò: {getRoleDisplayName(selectedUser.role_name)}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-2">
                * Hành động này sẽ vô hiệu hóa tài khoản người dùng
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 