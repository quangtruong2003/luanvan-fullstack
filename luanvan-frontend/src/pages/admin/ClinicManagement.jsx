import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Building, 
  MapPin, Phone, Mail, Clock, Users, AlertCircle, Calendar,
  Star, StarOff, ChevronDown, ChevronUp
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const ClinicManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [standardWorkShifts, setStandardWorkShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [expandedClinic, setExpandedClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: ''
  });
  const [workShiftFormData, setWorkShiftFormData] = useState({
    shifts: ['morning'], // ['morning', 'afternoon'] hoặc cả hai
    selectedDays: [],
    morningStart: '08:00',
    morningEnd: '12:00',
    afternoonStart: '13:00',
    afternoonEnd: '17:00',
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

  const shiftTypes = [
    { value: 'morning', label: 'Ca sáng', icon: '🌅' },
    { value: 'afternoon', label: 'Ca chiều', icon: '🌇' }
  ];

  useEffect(() => {
    fetchClinics();
    fetchStandardWorkShifts();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClinics();
      const clinicData = response.content || response || [];
      console.log('Fetched clinic data:', clinicData);
      setClinics(clinicData);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStandardWorkShifts = async () => {
    try {
      const response = await adminService.getAllStandardWorkShifts();
      const shiftData = response.content || response || [];
      setStandardWorkShifts(shiftData);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
    }
  };

  const getClinicWorkShifts = (clinicId) => {
    return standardWorkShifts.filter(shift => {
      // Support both snake_case and camelCase for clinic ID
      const shiftClinicId = shift.clinic?.clinic_id || shift.clinic?.clinicId;
      return shiftClinicId === clinicId;
    });
  };

  const formatWorkShiftSummary = (clinicId) => {
    // Support both snake_case and camelCase for clinic ID
    const actualClinicId = clinicId?.clinic_id || clinicId?.clinicId || clinicId;
    const shifts = getClinicWorkShifts(actualClinicId);
    if (shifts.length === 0) return 'Chưa có ca làm việc';
    
    const summary = shifts.reduce((acc, shift) => {
      const day = daysOfWeek.find(d => d.value === shift.dayOfWeek)?.label || shift.dayOfWeek;
      const time = `${shift.startTime?.substring(0, 5)} - ${shift.endTime?.substring(0, 5)}`;
      acc.push(`${day}: ${time}`);
      return acc;
    }, []);
    
    return summary.slice(0, 2).join(', ') + (summary.length > 2 ? '...' : '');
  };

  const handleCreateClinic = async (e) => {
    e.preventDefault();
    try {
      await adminService.createClinic(formData);
      fetchClinics();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating clinic:', error);
      alert('Lỗi khi tạo phòng khám: ' + error.message);
    }
  };

  const handleUpdateClinic = async (e) => {
    e.preventDefault();
    // Support both snake_case and camelCase for clinic ID
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    if (!clinicId) {
      alert('Lỗi: Không tìm thấy ID phòng khám. Vui lòng thử lại.');
      console.error('Update failed: selectedClinic or clinicId is missing', selectedClinic);
      return;
    }
    
    try {
      // Cập nhật thông tin phòng khám
      await adminService.updateClinic(clinicId, formData);
      
      // Cập nhật ca làm việc nếu có cấu hình 
      if (workShiftFormData.selectedDays.length > 0 && workShiftFormData.shifts.length > 0) {
        console.log('🔄 Updating work shifts as part of clinic update...');
        await handleSaveWorkShifts();
      } else {
        console.log('⚠️ No work shift configuration, skipping work shifts update');
      }
      
      fetchClinics();
      setShowEditModal(false);
      resetForm();
      resetWorkShiftForm();
      alert('Cập nhật phòng khám và ca làm việc thành công!');
    } catch (error) {
      console.error('Error updating clinic:', error);
      alert('Lỗi khi cập nhật phòng khám: ' + error.message);
    }
  };

  const handleDeleteClinic = async () => {
    // Support both snake_case and camelCase for clinic ID
    const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
    if (!clinicId) {
      alert('Lỗi: Không tìm thấy ID phòng khám. Vui lòng thử lại.');
      console.error('Delete failed: selectedClinic or clinicId is missing', selectedClinic);
      return;
    }
    
    try {
      await adminService.deleteClinic(clinicId);
      fetchClinics();
      fetchStandardWorkShifts(); // Refresh work shifts after clinic deletion
      setShowDeleteModal(false);
      setSelectedClinic(null);
      alert('Đã xóa phòng khám thành công!');
    } catch (error) {
      console.error('Error deleting clinic:', error);
      alert('Lỗi khi xóa phòng khám: ' + error.message);
    }
  };

  const handleSaveWorkShifts = async () => {
    try {
      const clinicId = selectedClinic?.clinic_id || selectedClinic?.clinicId;
      
      console.log('🔄 Starting to save work shifts for clinic:', clinicId);
      console.log('📝 Work shift form data:', workShiftFormData);
      
      if (!workShiftFormData.selectedDays.length) {
        alert('Vui lòng chọn ít nhất 1 ngày trong tuần');
        return;
      }
      
      if (!workShiftFormData.shifts.length) {
        alert('Vui lòng chọn ít nhất 1 ca làm việc (sáng hoặc chiều)');
        return;
      }

      // Xóa ca làm việc hiện có 
      const currentShifts = getClinicWorkShifts(clinicId);
      console.log('🗑️ Deleting existing shifts:', currentShifts.length);
      
      for (const shift of currentShifts) {
        try {
          await adminService.deleteStandardWorkShift(shift.shiftId);
          console.log('🗑️ Deleted shift:', shift.shiftId);
        } catch (error) {
          console.warn('⚠️ Failed to delete shift:', shift.shiftId, error);
        }
      }

      // Tạo shifts mới theo form data
      const shiftsToCreate = [];
      let shiftCounter = 1; // For unique naming
      
      for (const day of workShiftFormData.selectedDays) {
        for (const shiftType of workShiftFormData.shifts) {
          const startTime = shiftType === 'morning' ? workShiftFormData.morningStart : workShiftFormData.afternoonStart;
          const endTime = shiftType === 'morning' ? workShiftFormData.morningEnd : workShiftFormData.afternoonEnd;
          
          if (!startTime || !endTime) {
            console.error('❌ Invalid time data:', { shiftType, startTime, endTime });
            continue;
          }
          
          const dayLabel = daysOfWeek.find(d => d.value === day)?.label || day;
          const shiftData = {
            shiftName: `${shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều'} ${dayLabel} #${shiftCounter++}`,
            dayOfWeek: day,
            startTime: startTime.length === 5 ? startTime + ':00' : startTime,
            endTime: endTime.length === 5 ? endTime + ':00' : endTime,
            clinicId: parseInt(clinicId),
            isDefault: Boolean(workShiftFormData.isDefault)
          };
          
          shiftsToCreate.push(shiftData);
        }
      }

      console.log('✨ Creating shifts:', shiftsToCreate.length);

      // Tạo từng shift một
      for (const [index, shiftData] of shiftsToCreate.entries()) {
        try {
          console.log(`📋 Creating shift ${index + 1}/${shiftsToCreate.length}:`, shiftData);
          await adminService.createStandardWorkShift(shiftData);
          console.log('✅ Created successfully');
        } catch (error) {
          console.error('❌ Failed to create shift:', shiftData, error);
          alert(`Lỗi tạo ca làm việc ${index + 1}: ${error.message}`);
          break; // Dừng nếu có lỗi
        }
      }

      await fetchStandardWorkShifts();
      console.log('🎉 Work shifts saved successfully!');
      
    } catch (error) {
      console.error('💥 Error saving work shifts:', error);
      alert('Lỗi khi lưu ca làm việc: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const handleDeleteWorkShift = async (shiftId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return;
    
    try {
      await adminService.deleteStandardWorkShift(shiftId);
      fetchStandardWorkShifts();
      alert('Xóa ca làm việc thành công!');
    } catch (error) {
      console.error('Error deleting work shift:', error);
      alert('Lỗi khi xóa ca làm việc: ' + error.message);
    }
  };



  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: ''
    });
    setSelectedClinic(null);
  };

  const resetWorkShiftForm = () => {
    setWorkShiftFormData({
      shifts: ['morning'],
      selectedDays: [],
      morningStart: '08:00',
      morningEnd: '12:00',
      afternoonStart: '13:00',
      afternoonEnd: '17:00',
      isDefault: false
    });
  };

  const loadWorkShiftsForEdit = (clinicId) => {
    const shifts = getClinicWorkShifts(clinicId);
    if (shifts.length === 0) {
      resetWorkShiftForm();
      return;
    }

    const daySet = new Set();
    const shiftSet = new Set();
    let morningStart = '08:00', morningEnd = '12:00';
    let afternoonStart = '13:00', afternoonEnd = '17:00';
    let isDefault = false;

    shifts.forEach(shift => {
      daySet.add(shift.dayOfWeek);
      isDefault = shift.isDefault || isDefault;

      if (shift.shiftName.includes('sáng') || shift.startTime <= '12:00') {
        shiftSet.add('morning');
        morningStart = formatTime(shift.startTime);
        morningEnd = formatTime(shift.endTime);
      } else {
        shiftSet.add('afternoon');
        afternoonStart = formatTime(shift.startTime);
        afternoonEnd = formatTime(shift.endTime);
      }
    });

    setWorkShiftFormData({
      shifts: Array.from(shiftSet),
      selectedDays: Array.from(daySet),
      morningStart,
      morningEnd,
      afternoonStart,
      afternoonEnd,
      isDefault
    });
  };

  const openEditModal = (clinic) => {
    console.log('Opening edit modal for clinic:', clinic);
    setSelectedClinic(clinic);
    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      phoneNumber: clinic.phone_number || clinic.phoneNumber || '',
      email: clinic.email || '',
      description: clinic.description || ''
    });
    // Support both snake_case and camelCase for clinic ID
    const clinicId = clinic.clinic_id || clinic.clinicId;
    loadWorkShiftsForEdit(clinicId);
    setShowEditModal(true);
  };

  const openDeleteModal = (clinic) => {
    setSelectedClinic(clinic);
    setShowDeleteModal(true);
  };



  const getDayLabel = (dayOfWeek) => {
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.label : dayOfWeek;
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const filteredClinics = clinics.filter(clinic => 
    clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Phòng khám</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phòng khám
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.map(clinic => (
          <div key={clinic.clinic_id || clinic.clinicId} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {clinic.name || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {clinic.clinic_id || clinic.clinicId}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{clinic.address || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {clinic.phone_number || clinic.phoneNumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {clinic.email || 'N/A'}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs">{formatWorkShiftSummary(clinic.clinic_id || clinic.clinicId)}</span>
                    <button
                      onClick={() => {
                        const clinicId = clinic.clinic_id || clinic.clinicId;
                        setExpandedClinic(expandedClinic === clinicId ? null : clinicId);
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      {expandedClinic === (clinic.clinic_id || clinic.clinicId) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Work Shifts Details */}
              {expandedClinic === (clinic.clinic_id || clinic.clinicId) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Ca làm việc</h4>
                    <button
                      onClick={() => openEditModal(clinic)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Cấu hình ca
                    </button>
                  </div>
                  <div className="space-y-1">
                    {getClinicWorkShifts(clinic.clinic_id || clinic.clinicId).map(shift => (
                      <div key={shift.shiftId} className="flex items-center justify-between text-xs">
                        <span>
                          {getDayLabel(shift.dayOfWeek)}: {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          {shift.isDefault && <Star className="inline h-3 w-3 ml-1 text-yellow-500" />}
                        </span>
                        <button
                          onClick={() => handleDeleteWorkShift(shift.shiftId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {getClinicWorkShifts(clinic.clinic_id || clinic.clinicId).length === 0 && (
                      <p className="text-xs text-gray-500">Chưa có ca làm việc nào</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {clinic.description || 'Chưa có mô tả'}
              </p>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(clinic)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Sửa
                </button>
                <button
                  onClick={() => openDeleteModal(clinic)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClinics.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có phòng khám</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm phòng khám mới.</p>
        </div>
      )}

      {/* Create Clinic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm phòng khám mới</h3>
              <form onSubmit={handleCreateClinic}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phòng khám *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên phòng khám..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ đầy đủ..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contact@clinic.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mô tả về phòng khám, dịch vụ..."
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Ghi chú:</strong> Sau khi tạo phòng khám, bạn có thể thêm các ca làm việc bằng cách 
                      mở rộng thông tin phòng khám và nhấn "+ Thêm ca".
                    </p>
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
                    Tạo phòng khám
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {showEditModal && selectedClinic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa phòng khám: {selectedClinic.name}
              </h3>
              <form onSubmit={handleUpdateClinic}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Thông tin cơ bản */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-800 border-b pb-2">Thông tin cơ bản</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên phòng khám *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả *
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Ca làm việc */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-800 border-b pb-2">Cấu hình ca làm việc</h4>
                    
                    {/* Chọn loại ca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại ca làm việc *
                      </label>
                      <div className="space-y-2">
                        {shiftTypes.map(shift => (
                          <label key={shift.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={workShiftFormData.shifts.includes(shift.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    shifts: [...workShiftFormData.shifts, shift.value]
                                  });
                                } else {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    shifts: workShiftFormData.shifts.filter(s => s !== shift.value)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              {shift.icon} {shift.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Thời gian ca sáng */}
                    {workShiftFormData.shifts.includes('morning') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🌅 Giờ làm việc ca sáng
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bắt đầu</label>
                            <input
                              type="time"
                              value={workShiftFormData.morningStart}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                morningStart: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Kết thúc</label>
                            <input
                              type="time"
                              value={workShiftFormData.morningEnd}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                morningEnd: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thời gian ca chiều */}
                    {workShiftFormData.shifts.includes('afternoon') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🌇 Giờ làm việc ca chiều
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bắt đầu</label>
                            <input
                              type="time"
                              value={workShiftFormData.afternoonStart}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                afternoonStart: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Kết thúc</label>
                            <input
                              type="time"
                              value={workShiftFormData.afternoonEnd}
                              onChange={(e) => setWorkShiftFormData({
                                ...workShiftFormData,
                                afternoonEnd: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chọn ngày trong tuần */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày hoạt động *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map(day => (
                          <label key={day.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={workShiftFormData.selectedDays.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    selectedDays: [...workShiftFormData.selectedDays, day.value]
                                  });
                                } else {
                                  setWorkShiftFormData({
                                    ...workShiftFormData,
                                    selectedDays: workShiftFormData.selectedDays.filter(d => d !== day.value)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Nút chọn nhanh */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setWorkShiftFormData({
                          ...workShiftFormData,
                          selectedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
                        })}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        T2-T6
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkShiftFormData({
                          ...workShiftFormData,
                          selectedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
                        })}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        T2-T7
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkShiftFormData({
                          ...workShiftFormData,
                          selectedDays: daysOfWeek.map(d => d.value)
                        })}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkShiftFormData({
                          ...workShiftFormData,
                          selectedDays: []
                        })}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Bỏ chọn
                      </button>
                    </div>

                    {/* Tùy chọn mặc định */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefaultEdit"
                        checked={workShiftFormData.isDefault}
                        onChange={(e) => setWorkShiftFormData({
                          ...workShiftFormData,
                          isDefault: e.target.checked
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isDefaultEdit" className="ml-2 text-sm text-gray-700">
                        Đặt làm ca mặc định ⭐
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      resetWorkShiftForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Cập nhật phòng khám & ca làm việc
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClinic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa phòng khám</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa phòng khám <strong>"{selectedClinic.name}"</strong>? 
                Hành động này sẽ xóa cả phòng khám và tất cả ca làm việc liên quan. Không thể hoàn tác.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClinic(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteClinic}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Xóa phòng khám
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicManagement; 