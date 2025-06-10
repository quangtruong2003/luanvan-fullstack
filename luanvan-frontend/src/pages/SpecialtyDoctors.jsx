import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, MapPin, Star } from 'lucide-react';
import { doctors, specialties } from '../data/mockData';

const SpecialtyDoctors = () => {
  const { specialtyId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Lấy thông tin chuyên khoa và bác sĩ
  useEffect(() => {
    const currentSpecialty = specialties.find(s => s.id === parseInt(specialtyId));
    setSpecialty(currentSpecialty);

    const specialtyDoctors = doctors.filter(doctor => 
      doctor.specialty.toLowerCase() === currentSpecialty?.name.toLowerCase()
    );
    setFilteredDoctors(specialtyDoctors);
  }, [specialtyId]);

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!specialty) return;

    const specialtyDoctors = doctors.filter(doctor => 
      doctor.specialty.toLowerCase() === specialty.name.toLowerCase() &&
      doctor.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDoctors(specialtyDoctors);
  };

  if (!specialty) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={specialty.image}
            alt={specialty.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Đặt khám {specialty.name}
            </h1>
            <p className="text-gray-600 mb-3">{specialty.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                {specialty.doctorCount} bác sĩ
              </span>
              <span>•</span>
              <span>Các bệnh thường gặp: {specialty.commonDiseases.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeFilter === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              Có lịch hôm nay
            </button>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-xl shadow-md p-6 h-[600px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Vui lòng chọn bác sĩ</h2>
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-28 h-28 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                          {doctor.name}
                        </h2>
                        <p className="text-blue-600 font-medium mb-2">
                          {doctor.degree}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {doctor.hospital}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {doctor.rating}
                          </span>
                          <span>{doctor.experience} kinh nghiệm</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 mb-1">Giá khám</p>
                        <p className="text-lg font-bold text-blue-600">{doctor.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          Lịch khám: Thứ 2 - Thứ 6
                        </span>
                      </div>
                      <a
                        href={`/book-appointment/doctor/${doctor.id}`}
                        className="inline-flex items-center justify-center px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Đặt lịch khám
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy bác sĩ phù hợp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialtyDoctors; 