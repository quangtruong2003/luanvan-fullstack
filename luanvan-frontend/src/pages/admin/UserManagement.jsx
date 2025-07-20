import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, Stethoscope, AlertTriangle, PlusCircle, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';
// Bỏ import Pagination
// import Pagination from '../../components/Pagination';

const UserManagement = () => {
  const { showSuccess, showError } = useNotification();
  
  const [allUsers, setAllUsers] = useState([]); // State để lưu tất cả user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [emailCheck, setEmailCheck] = useState({ status: 'idle', message: '' }); // idle, checking, valid, invalid
  // State cho dialog xác nhận vô hiệu hóa
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });

  // Pagination state - thay đổi để giống AppointmentManagement
  const [currentPage, setCurrentPage] = useState(1); // Bắt đầu từ trang 1
  const pageSize = 10;
  // Bỏ totalPages, sẽ được tính toán lại
  // const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'DOCTOR'
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // The new getAllUsers function already handles fetching all pages
      const allUsersData = await adminService.getAllUsers();
      
      if (Array.isArray(allUsersData)) {
        setAllUsers(allUsersData);
        setLastUpdated(new Date());
      } else {
        console.error('User data is not an array:', allUsersData);
        setAllUsers([]);
        setError('Dữ liệu người dùng không hợp lệ');
      }
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng: ' + (err.message || 'Lỗi không xác định'));
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, []); // Bỏ dependencies để chỉ fetch 1 lần

  // Initial load and user role setup
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setCurrentUserRole(userRole || '');
    
    // Load initial data
    fetchUsers();
  }, [fetchUsers]);

  // Bỏ các useEffects dùng để fetch lại dữ liệu khi filter hoặc chuyển trang

  // Debounced email validation
  useEffect(() => {
    const emailToValidate = formData.email.trim();

    if (!emailToValidate) {
      setEmailCheck({ status: 'idle', message: '' });
      return;
    }

    // Basic email format check on client-side first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      setEmailCheck({ status: 'invalid', message: 'Định dạng email không hợp lệ.' });
      return;
    }

    setEmailCheck({ status: 'checking', message: '' });

    const handler = setTimeout(async () => {
      try {
        const response = await adminService.checkEmailExists(emailToValidate);
        // Fix: The response from apiRequest is the data itself, not wrapped in a `data` property.
        if (response.exists) {
          setEmailCheck({ status: 'invalid', message: 'Email đã được sử dụng.' });
        } else {
          setEmailCheck({ status: 'valid', message: 'Email hợp lệ.' });
        }
      } catch (err) {
        console.error('Email check error:', err);
        setEmailCheck({ status: 'error', message: 'Không thể kiểm tra email.' });
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [formData.email]);
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});
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
      setEmailCheck({ status: 'idle', message: '' }); // Reset email check state
      
      // Refresh users list
      await fetchUsers();
      showSuccess('Tạo người dùng thành công!');
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.response && err.response.data && err.response.data.details) {
        setFormErrors(err.response.data.details);
        showError('Vui lòng kiểm tra lại các trường đã nhập.');
      } else {
        showError('Lỗi tạo người dùng: ' + (err.message || 'Lỗi không xác định'));
      }
    }
  };
  // Hàm thực hiện thay đổi trạng thái (kích hoạt/vô hiệu hóa)
  const handleToggleStatus = async (userId, isActive) => {
    try {
      if (!userId || userId === undefined || userId === null) {
        throw new Error('ID người dùng không hợp lệ');
      }
      if (isActive) {
        // Nếu là vô hiệu hóa, hiển thị dialog xác nhận
        setConfirmDialog({ open: true, userId });
      } else {
        // Kích hoạt không cần xác nhận
        await adminService.activateUser(userId);
        await fetchUsers();
        showSuccess('Đã kích hoạt người dùng thành công!');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      showError('Lỗi thay đổi trạng thái: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  // Hàm xác nhận thực hiện vô hiệu hóa
  const handleConfirmDeactivate = async () => {
    if (!confirmDialog.userId) return;
    try {
      await adminService.deactivateUser(confirmDialog.userId);
      await fetchUsers();
      showSuccess('Đã vô hiệu hóa người dùng thành công!');
    } catch (err) {
      console.error('Error deactivating user:', err);
      showError('Lỗi thay đổi trạng thái: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setConfirmDialog({ open: false, userId: null });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.full_name || '',
      phoneNumber: user.phone_number || '',
      role: user.role_name || 'PATIENT',
      password: '' // Khởi tạo mật khẩu rỗng để không hiển thị mật khẩu cũ
    });
    setFormErrors({});
    setShowEditModal(true);
  };  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      if (!selectedUser?.user_id) {
        throw new Error('ID người dùng không hợp lệ');
      }
        const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      // Chỉ thêm mật khẩu vào data nếu người dùng nhập
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await adminService.updateUser(selectedUser.user_id, updateData);
        // Update local state immediately with the new data
      setAllUsers(prevUsers => 
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
      if (err.response && err.response.data && err.response.data.details) {
        setFormErrors(err.response.data.details);
        showError('Vui lòng kiểm tra lại thông tin đã nhập.');
      } else {
        showError('Lỗi cập nhật người dùng: ' + (err.message || 'Lỗi không xác định'));
      }
    }
  };

  const getRoleDisplayName = (roleName) => {
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

  const filteredUsers = allUsers.filter(user => {
    const userName = user.full_name || '';
    const userEmail = user.email || '';
    const userPhone = user.phone_number || '';
    const userRole = user.role_name || '';
    
    const preparedSearchTerm = searchTerm.toLowerCase().trim();

    const matchesSearch = 
      userName.toLowerCase().includes(preparedSearchTerm) ||
      userEmail.toLowerCase().includes(preparedSearchTerm) ||
      userPhone.includes(searchTerm.trim());
    
    const matchesRole = !filterRole || userRole === filterRole;

    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const indexOfLastUser = currentPage * pageSize;
  const indexOfFirstUser = indexOfLastUser - pageSize;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

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
              placeholder="Tìm kiếm theo tên, email, SĐT..."
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
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, index) => {
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
                        
                        {/* Nút kích hoạt/vô hiệu hóa - chỉ admin và không phải user ID 1 */}
                        {currentUserRole === 'ADMIN' && user.user_id && user.user_id !== 1 && (
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
      {/* Dialog xác nhận vô hiệu hóa người dùng */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
              <UserX className="w-5 h-5 mr-2" /> Xác nhận vô hiệu hóa
            </h3>
            <p
              className="mb-6 text-gray-700 text-center break-words mx-auto"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '320px',
                whiteSpace: 'pre-line',
                display: 'block',
              }}
            >
              Bạn có chắc chắn muốn vô hiệu hóa người dùng này không? Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDialog({ open: false, userId: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
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
        </div>
        
        {/* Pagination Controls - Giống AppointmentManagement */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} của {filteredUsers.length} kết quả
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="text-sm px-2">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
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
      </div>

      {/* Create Doctor Modal */}
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
                <div className="h-5 mt-1 text-xs">
                  {emailCheck.status === 'checking' && (
                    <div className="flex items-center text-gray-500">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Đang kiểm tra...
                    </div>
                  )}
                  {emailCheck.status === 'valid' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {emailCheck.message}
                    </div>
                  )}
                  {emailCheck.status === 'invalid' && (
                    <div className="flex items-center text-red-500">
                      <XCircle className="w-3 h-3 mr-1" />
                      {emailCheck.message}
                    </div>
                  )}
                  {emailCheck.status === 'error' && (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {emailCheck.message}
                    </div>
                  )}
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
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
                  autoComplete="new-password"
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
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
                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
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
                {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
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
                    setEmailCheck({ status: 'idle', message: '' }); // Reset email check state
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={emailCheck.status !== 'valid'}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Chỉnh sửa người dùng: {selectedUser.fullName || selectedUser.full_name}
            </h3>
            <form onSubmit={handleUpdateUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
                </div>

                {/* New Password - chỉ hiển thị nếu không phải bệnh nhân */}
                {selectedUser?.role_name !== 'PATIENT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu mới (để trống nếu không đổi)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu mới"
                      minLength={6}
                      autoComplete="new-password"
                    />
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={selectedUser?.role_name === 'PATIENT'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      selectedUser?.role_name === 'PATIENT' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                   {selectedUser?.role_name === 'PATIENT' && (
                      <p className="text-xs text-gray-500 mt-1">Email của bệnh nhân không thể thay đổi.</p>
                  )}
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Role */}
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
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

      {/* Bỏ component Pagination */}
    </div>
  );
};

export default UserManagement;