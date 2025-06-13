import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Clock, Calendar, 
  Building, Star, StarOff, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const StandardWorkShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [formData, setFormData] = useState({
    shiftName: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    clinicId: '',
    isDefault: false
  });

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Thứ 2' },
    { value: 'TUESDAY', label: 'Thứ 3' },
    { value: 'WEDNESDAY', label: 'Thứ 4' },
    { value: 'THURSDAY', label: 'Thứ 5' },
    { value: 'FRIDAY', label: 'Thứ 6' },
    { value: 'SATURDAY', label: 'Thứ 7' },
    { value: 'SUNDAY', label: 'Chủ nhật' }
  ];

  useEffect(() => {
    fetchShifts();
    fetchClinics();
  }, []);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllStandardWorkShifts();
      const shiftData = response.content || response || [];
      setShifts(shiftData);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      showMessage('error', 'Lỗi khi tải danh sách ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await apiService.getClinics();
      setClinics(response.content || response || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      showMessage('error', 'Lỗi khi tải danh sách phòng khám: ' + error.message);
    }
  };

  const validateForm = () => {
    if (!formData.shiftName.trim()) {
      showMessage('error', 'Tên ca làm việc không được để trống');
      return false;
    }
    if (!formData.dayOfWeek) {
      showMessage('error', 'Vui lòng chọn ngày trong tuần');
      return false;
    }
    if (!formData.startTime) {
      showMessage('error', 'Vui lòng chọn thời gian bắt đầu');
      return false;
    }
    if (!formData.endTime) {
      showMessage('error', 'Vui lòng chọn thời gian kết thúc');
      return false;
    }
    if (!formData.clinicId) {
      showMessage('error', 'Vui lòng chọn phòng khám');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      showMessage('error', 'Thời gian kết thúc phải sau thời gian bắt đầu');
      return false;
    }
    return true;
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await adminService.createStandardWorkShift(formData);
      showMessage('success', 'Tạo ca làm việc thành công!');
      fetchShifts();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating shift:', error);
      showMessage('error', 'Lỗi khi tạo ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const shiftId = selectedShift?.shiftId;
    if (!shiftId) {
      showMessage('error', 'Lỗi: Không tìm thấy ID ca làm việc');
      return;
    }
    
    try {
      setLoading(true);
      await adminService.updateStandardWorkShift(shiftId, formData);
      showMessage('success', 'Cập nhật ca làm việc thành công!');
      fetchShifts();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating shift:', error);
      showMessage('error', 'Lỗi khi cập nhật ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async () => {
    const shiftId = selectedShift?.shiftId;
    if (!shiftId) {
      showMessage('error', 'Lỗi: Không tìm thấy ID ca làm việc');
      return;
    }
    
    try {
      setLoading(true);
      await adminService.deleteStandardWorkShift(shiftId);
      showMessage('success', 'Xóa ca làm việc thành công!');
      fetchShifts();
      setShowDeleteModal(false);
      setSelectedShift(null);
    } catch (error) {
      console.error('Error deleting shift:', error);
      showMessage('error', 'Lỗi khi xóa ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDefault = async (shift) => {
    try {
      setLoading(true);
      if (shift.isDefault) {
        await adminService.unsetDefaultStandardWorkShift(shift.shiftId);
        showMessage('success', 'Đã bỏ đặt ca làm việc mặc định');
      } else {
        await adminService.setDefaultStandardWorkShift(shift.shiftId);
        showMessage('success', 'Đã đặt ca làm việc mặc định');
      }
      fetchShifts();
    } catch (error) {
      console.error('Error toggling default:', error);
      showMessage('error', 'Lỗi khi thay đổi trạng thái mặc định: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      shiftName: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      clinicId: '',
      isDefault: false
    });
    setSelectedShift(null);
  };

  const openEditModal = (shift) => {
    setSelectedShift(shift);
    setFormData({
      shiftName: shift.shiftName || '',
      dayOfWeek: shift.dayOfWeek || '',
      startTime: shift.startTime || '',
      endTime: shift.endTime || '',
      clinicId: shift.clinic?.clinicId || '',
      isDefault: shift.isDefault || false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (shift) => {
    setSelectedShift(shift);
    setShowDeleteModal(true);
  };

  const getDayLabel = (dayOfWeek) => {
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.label : dayOfWeek;
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.substring(0, 5); // HH:MM format
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = 
      shift.shiftName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClinic = !filterClinic || 
      shift.clinic?.clinicId?.toString() === filterClinic;
    
    const matchesDay = !filterDay || shift.dayOfWeek === filterDay;
    
    return matchesSearch && matchesClinic && matchesDay;
  });

  if (loading && shifts.length === 0) {
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý Ca làm việc tiêu chuẩn (Tập trung)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý tất cả ca làm việc của các phòng khám trong hệ thống. 
              Bạn cũng có thể quản lý ca làm việc trực tiếp tại từng phòng khám trong mục "Quản lý Phòng khám".
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchShifts}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm ca làm việc
            </button>
          </div>
        </div>

        {/* Message */}
        {message.content && (
          <div className={`mb-4 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.content}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ca làm việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả phòng khám</option>
              {clinics.map(clinic => (
                <option key={clinic.clinicId} value={clinic.clinicId}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả ngày</option>
            {daysOfWeek.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterClinic('');
              setFilterDay('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ca làm việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày trong tuần
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng khám
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShifts.map((shift) => (
                <tr key={shift.shiftId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {shift.shiftName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {shift.shiftId}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      {getDayLabel(shift.dayOfWeek)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building className="h-4 w-4 mr-2" />
                      {shift.clinic?.name || 'N/A'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleDefault(shift)}
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        shift.isDefault
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {shift.isDefault ? (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Mặc định
                        </>
                      ) : (
                        <>
                          <StarOff className="h-3 w-3 mr-1" />
                          Thường
                        </>
                      )}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(shift)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(shift)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có ca làm việc</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterClinic || filterDay 
                ? 'Không tìm thấy ca làm việc phù hợp với bộ lọc.'
                : 'Bắt đầu bằng cách thêm ca làm việc mới.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm ca làm việc mới</h3>
              <form onSubmit={handleCreateShift}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên ca làm việc *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shiftName}
                      onChange={(e) => setFormData({...formData, shiftName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ca sáng, Ca chiều..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày trong tuần *
                      </label>
                      <select
                        required
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn ngày</option>
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phòng khám *
                      </label>
                      <select
                        required
                        value={formData.clinicId}
                        onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn phòng khám</option>
                        {clinics.map(clinic => (
                          <option key={clinic.clinicId} value={clinic.clinicId}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thời gian bắt đầu *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thời gian kết thúc *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Đặt làm ca mặc định
                    </label>
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo ca làm việc'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedShift && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa ca làm việc: {selectedShift.shiftName}
              </h3>
              <form onSubmit={handleUpdateShift}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên ca làm việc *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shiftName}
                      onChange={(e) => setFormData({...formData, shiftName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày trong tuần *
                      </label>
                      <select
                        required
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn ngày</option>
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phòng khám *
                      </label>
                      <select
                        required
                        value={formData.clinicId}
                        onChange={(e) => setFormData({...formData, clinicId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn phòng khám</option>
                        {clinics.map(clinic => (
                          <option key={clinic.clinicId} value={clinic.clinicId}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thời gian bắt đầu *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thời gian kết thúc *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefaultEdit"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isDefaultEdit" className="ml-2 text-sm text-gray-700">
                      Đặt làm ca mặc định
                    </label>
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
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedShift && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa ca làm việc</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa ca làm việc <strong>"{selectedShift.shiftName}"</strong>? 
                Hành động này không thể hoàn tác.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedShift(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteShift}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Đang xóa...' : 'Xóa ca làm việc'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardWorkShiftManagement; 