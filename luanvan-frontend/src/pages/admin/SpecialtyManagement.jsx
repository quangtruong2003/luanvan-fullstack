import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Stethoscope, 
  Building, Users, FileText, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { adminService, apiService } from '../../services/api';

const SpecialtyManagement = () => {
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clinicId: ''
  });

  const fetchSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        sort: `${sortConfig.key},${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`
      };
      const response = await apiService.getSpecialties(params);
      const specialtyData = response.content || response || [];
      setSpecialties(specialtyData);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  }, [sortConfig]);

  useEffect(() => {
    fetchSpecialties();
    fetchClinics();
  }, [fetchSpecialties]);

  const fetchClinics = async () => {
    try {
      const response = await apiService.getClinics();
      setClinics(response.content || response || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const handleCreateSpecialty = async (e) => {
    e.preventDefault();
    try {
      await adminService.createSpecialty(formData);
      fetchSpecialties();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating specialty:', error);
      alert('Lỗi khi tạo chuyên khoa: ' + error.message);
    }
  };

  const handleUpdateSpecialty = async (e) => {
    e.preventDefault();
    const specialtyId = selectedSpecialty?.specialtyId;
    if (!specialtyId) {
        alert('Lỗi: Không tìm thấy ID chuyên khoa. Vui lòng thử lại.');
        console.error('Update failed: selectedSpecialty or specialtyId is missing', selectedSpecialty);
        return;
    }
    try {
      await adminService.updateSpecialty(specialtyId, formData);
      fetchSpecialties();
      setShowEditModal(false);
      resetForm();
      alert('Cập nhật chuyên khoa thành công!');
    } catch (error) {
      console.error('Error updating specialty:', error);
      alert('Lỗi khi cập nhật chuyên khoa: ' + error.message);
    }
  };

  const handleDeleteSpecialty = async () => {
    const specialtyId = selectedSpecialty?.specialtyId;
    if (!specialtyId) {
        alert('Lỗi: Không tìm thấy ID chuyên khoa. Vui lòng thử lại.');
        console.error('Delete failed: selectedSpecialty or specialtyId is missing', selectedSpecialty);
        return;
    }
    try {
      await adminService.deleteSpecialty(specialtyId);
      fetchSpecialties();
      setShowDeleteModal(false);
      setSelectedSpecialty(null);
      alert('Đã xóa chuyên khoa thành công!');
    } catch (error) {
      console.error('Error deleting specialty:', error);
      alert('Lỗi khi xóa chuyên khoa: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      clinicId: ''
    });
    setSelectedSpecialty(null);
  };

  const openEditModal = (specialty) => {
    console.log('Opening edit modal for specialty:', specialty);
    setSelectedSpecialty(specialty);
    setFormData({
      name: specialty.name || '',
      description: specialty.description || '',
      clinicId: specialty.clinic?.clinicId || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (specialty) => {
    setSelectedSpecialty(specialty);
    setShowDeleteModal(true);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredSpecialties = specialties.filter(specialty => {
    const matchesSearch = specialty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialty.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinic = !filterClinic || 
                         specialty.clinic?.clinicId?.toString() === filterClinic;
    return matchesSearch && matchesClinic;
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
          <h2 className="text-xl font-semibold text-gray-900">Quản lý Chuyên khoa</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm chuyên khoa
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chuyên khoa..."
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
        </div>
      </div>

      {/* Specialties Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => requestSort('name')} className="flex items-center space-x-1 focus:outline-none">
                    <span>Chuyên khoa</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng khám
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <button onClick={() => requestSort('doctorCount')} className="flex items-center space-x-1 focus:outline-none">
                    <span>Số bác sĩ</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpecialties.map((specialty) => (
                <tr key={specialty.specialtyId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{specialty.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{specialty.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{specialty.clinic?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{specialty.clinic?.address || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {specialty.doctorCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(specialty)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Sửa"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(specialty)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSpecialties.length === 0 && !loading && (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có chuyên khoa</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm chuyên khoa mới.</p>
        </div>
      )}

      {/* Create Specialty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm chuyên khoa mới</h3>
              <form onSubmit={handleCreateSpecialty}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chuyên khoa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên chuyên khoa..."
                    />
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
                      placeholder="Mô tả về chuyên khoa..."
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
                    Tạo chuyên khoa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Specialty Modal */}
      {showEditModal && selectedSpecialty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa chuyên khoa: {selectedSpecialty.name}
              </h3>
              <form onSubmit={handleUpdateSpecialty}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chuyên khoa *
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
      {showDeleteModal && selectedSpecialty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa chuyên khoa</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa chuyên khoa <strong>"{selectedSpecialty.name}"</strong>? 
                Hành động này không thể hoàn tác và có thể ảnh hưởng đến {selectedSpecialty.doctorCount || 0} bác sĩ.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedSpecialty(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteSpecialty}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Xóa chuyên khoa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtyManagement; 