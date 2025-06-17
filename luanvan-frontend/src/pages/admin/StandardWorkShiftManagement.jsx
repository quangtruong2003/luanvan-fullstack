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
    daysOfWeek: [],
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

  // Debug useEffect để theo dõi state changes
  useEffect(() => {
    console.log('🎯 Shifts state changed:', {
      count: shifts.length,
      shifts: shifts.map(s => ({
        id: s.shiftId,
        name: s.shiftName,
        isDefault: s.isDefault,
        dayOfWeek: s.dayOfWeek
      }))
    });
  }, [shifts]);

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 5000);
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching shifts...');
      const response = await adminService.getAllStandardWorkShifts();
      console.log('📦 Received shifts response:', response);
      
      // API /all trả về List<StandardWorkShift> trực tiếp, không có wrapper
      const shiftData = Array.isArray(response) ? response : [];
      console.log('✅ Processed shift data:', shiftData);
      
      setShifts(shiftData);
      console.log('🎯 Updated shifts state with', shiftData.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching shifts:', error);
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
    if (!formData.daysOfWeek || formData.daysOfWeek.length === 0) {
      showMessage('error', 'Vui lòng chọn ít nhất một ngày trong tuần');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Luôn sử dụng API batch để tránh tạo trùng lặp
      const batchData = {
        shiftName: formData.shiftName,
        daysOfWeek: formData.daysOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        clinicId: parseInt(formData.clinicId),
        isDefault: formData.isDefault
      };

      console.log('📤 Sending batch data:', batchData);
      const createdShifts = await adminService.createBatchStandardWorkShifts(batchData);
      
      console.log('✅ Created shifts:', createdShifts);
      showMessage('success', `Đã tạo thành công ${createdShifts.length} ca làm việc cho ${formData.daysOfWeek.length} ngày`);
      
      setShowCreateModal(false);
      resetForm();
      await fetchShifts();
    } catch (error) {
      console.error('❌ Error creating shifts:', error);
      showMessage('error', 'Lỗi khi tạo ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🔧 Starting edit process for shift:', selectedShift.shiftId);
      console.log('📝 Form data:', formData);
      
      // Luôn cập nhật ca hiện tại, không xóa và tạo lại
      const updateData = {
        shiftName: formData.shiftName,
        dayOfWeek: formData.daysOfWeek[0], // Chỉ lấy ngày đầu tiên
        startTime: formData.startTime,
        endTime: formData.endTime,
        clinicId: parseInt(formData.clinicId),
        isDefault: formData.isDefault
      };

      console.log('📤 Sending update data:', updateData);
      
      const updatedShift = await adminService.updateStandardWorkShift(selectedShift.shiftId, updateData);
      console.log('✅ Received updated shift:', updatedShift);
      
      showMessage('success', 'Đã cập nhật ca làm việc thành công');
      
      setShowEditModal(false);
      resetForm();
      
      console.log('🔄 Fetching fresh data...');
      await fetchShifts();
      console.log('✨ Edit process completed');
    } catch (error) {
      console.error('❌ Error updating shift:', error);
      showMessage('error', 'Lỗi khi cập nhật ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await adminService.deleteStandardWorkShift(selectedShift.shiftId);
      showMessage('success', 'Đã xóa ca làm việc thành công');
      setShowDeleteModal(false);
      setSelectedShift(null);
      await fetchShifts();
    } catch (error) {
      console.error('Error deleting shift:', error);
      showMessage('error', 'Lỗi khi xóa ca làm việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDefault = async (shift) => {
    try {
      setLoading(true);
      if (shift.isDefault) {
        await adminService.unsetDefaultStandardWorkShift(shift.shiftId);
        showMessage('success', 'Đã bỏ đặt ca làm việc mặc định');
      } else {
        await adminService.setDefaultStandardWorkShift(shift.shiftId);
        showMessage('success', 'Đã đặt ca làm việc mặc định');
      }
      await fetchShifts();
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
      daysOfWeek: [],
      startTime: '',
      endTime: '',
      clinicId: '',
      isDefault: false
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (shift) => {
    setSelectedShift(shift);
    setFormData({
      shiftName: shift.shiftName,
      daysOfWeek: [shift.dayOfWeek], // Chuyển đổi thành array
      startTime: shift.startTime,
      endTime: shift.endTime,
      clinicId: shift.clinic?.clinicId?.toString() || '',
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

  // Handler cho việc chọn/bỏ chọn ngày
  const handleDayToggle = (dayValue) => {
    setFormData(prev => {
      const newDaysOfWeek = prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(day => day !== dayValue)
        : [...prev.daysOfWeek, dayValue];
      return { ...prev, daysOfWeek: newDaysOfWeek };
    });
  };

  // Handler cho việc chọn/bỏ chọn tất cả ngày
  const handleSelectAllDays = () => {
    const allDays = daysOfWeek.map(day => day.value);
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.length === allDays.length ? [] : allDays
    }));
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

  // Component cho checkbox ngày trong tuần (dùng cho Create)
  const DayCheckboxes = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ngày trong tuần * 
        <span className="text-xs text-gray-500 ml-2">
          (Chọn nhiều ngày để tạo ca làm việc cho tất cả các ngày)
        </span>
      </label>
      
      {/* Nút chọn tất cả */}
      <div className="mb-3">
        <button
          type="button"
          onClick={handleSelectAllDays}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          {formData.daysOfWeek.length === daysOfWeek.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
        {formData.daysOfWeek.length > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            Đã chọn {formData.daysOfWeek.length}/7 ngày
          </span>
        )}
      </div>

      {/* Checkbox cho từng ngày */}
      <div className="grid grid-cols-2 gap-2">
        {daysOfWeek.map(day => (
          <label 
            key={day.value} 
            className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={formData.daysOfWeek.includes(day.value)}
              onChange={() => handleDayToggle(day.value)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Component cho dropdown ngày trong tuần (dùng cho Edit)
  const DayEditDropdown = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ngày trong tuần *
      </label>
      <select
        value={formData.daysOfWeek[0] || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, daysOfWeek: [e.target.value] }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Chọn ngày trong tuần</option>
        {daysOfWeek.map(day => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
    </div>
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Ca làm việc Tiêu chuẩn</h1>
          <p className="text-gray-600">Thiết lập ca làm việc cho các phòng khám</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm ca làm việc
        </button>
      </div>

      {/* Message */}
      {message.content && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên ca hoặc phòng khám..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo phòng khám
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterClinic}
                onChange={(e) => setFilterClinic(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả phòng khám</option>
                {clinics.map(clinic => (
                  <option key={clinic.clinicId} value={clinic.clinicId}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả ngày</option>
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Danh sách Ca làm việc ({filteredShifts.length})
          </h3>
        </div>

        {filteredShifts.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có ca làm việc</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterClinic || filterDay ? 'Không tìm thấy ca làm việc phù hợp với bộ lọc.' : 'Bắt đầu bằng cách tạo ca làm việc đầu tiên.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên ca làm việc
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
                    Mặc định
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
                      <div className="text-sm font-medium text-gray-900">
                        {shift.shiftName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDayLabel(shift.dayOfWeek)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shift.clinic?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDefault(shift)}
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
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(shift)}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm ca làm việc mới</h3>
              <form onSubmit={handleSubmit}>
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
                      placeholder="Ví dụ: Ca sáng, Ca chiều..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DayCheckboxes />

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
              <form onSubmit={handleEdit}>
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
                    <DayEditDropdown />

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

      {/* Delete Modal */}
      {showDeleteModal && selectedShift && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Xóa ca làm việc</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa ca làm việc "{selectedShift.shiftName}"?
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-3">
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
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
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