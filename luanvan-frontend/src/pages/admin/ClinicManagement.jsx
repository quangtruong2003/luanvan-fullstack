import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Building, 
  MapPin, Phone, Mail, Clock, Users, AlertCircle
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const ClinicManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: '',
    workingHours: ''
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClinics();
      const clinicData = response.content || response || [];
      console.log('Fetched clinic data:', clinicData); // Debug log
      setClinics(clinicData);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
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
    const clinicId = selectedClinic?.clinicId;
    if (!clinicId) {
      alert('Lỗi: Không tìm thấy ID phòng khám. Vui lòng thử lại.');
      console.error('Update failed: selectedClinic or clinicId is missing', selectedClinic);
      return;
    }
    
    try {
      await adminService.updateClinic(clinicId, formData);
      fetchClinics();
      setShowEditModal(false);
      resetForm();
      alert('Cập nhật phòng khám thành công!');
    } catch (error) {
      console.error('Error updating clinic:', error);
      alert('Lỗi khi cập nhật phòng khám: ' + error.message);
    }
  };

  const handleDeleteClinic = async () => {
    const clinicId = selectedClinic?.clinicId;
    if (!clinicId) {
      alert('Lỗi: Không tìm thấy ID phòng khám. Vui lòng thử lại.');
      console.error('Delete failed: selectedClinic or clinicId is missing', selectedClinic);
      return;
    }
    
    try {
      await adminService.deleteClinic(clinicId);
      fetchClinics();
      setShowDeleteModal(false);
      setSelectedClinic(null);
      alert('Đã xóa phòng khám thành công!');
    } catch (error) {
      console.error('Error deleting clinic:', error);
      alert('Lỗi khi xóa phòng khám: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: '',
      workingHours: ''
    });
    setSelectedClinic(null);
  };

  const openEditModal = (clinic) => {
    console.log('Opening edit modal for clinic:', clinic); // Debug log
    setSelectedClinic(clinic);
    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      phoneNumber: clinic.phoneNumber || '',
      email: clinic.email || '',
      description: clinic.description || '',
      workingHours: clinic.workingHours || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (clinic) => {
    setSelectedClinic(clinic);
    setShowDeleteModal(true);
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
          <div key={clinic.clinicId} className="bg-white shadow rounded-lg overflow-hidden">
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
                    ID: {clinic.clinicId}
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
                  {clinic.phoneNumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {clinic.email || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {clinic.workingHours || 'N/A'}
                </div>
              </div>

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
                      Giờ làm việc *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workingHours}
                      onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="T2-T7: 8:00-20:00"
                    />
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa thông tin phòng khám: {selectedClinic.name}
              </h3>
              <form onSubmit={handleUpdateClinic}>
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
                      Giờ làm việc *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workingHours}
                      onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                Hành động này không thể hoàn tác.
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