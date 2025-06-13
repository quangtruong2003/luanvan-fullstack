import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Stethoscope, Search, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const BookAppointment = () => {
  const [activeTab, setActiveTab] = useState('specialty');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialtyDoctors, setSpecialtyDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorResults, setDoctorResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (activeTab === 'doctor') {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getDoctors();
          setDoctors(response.content || response.doctors || []);
        } catch (err) {
          setError('Không thể tải danh sách bác sĩ');
          console.error('Error fetching doctors:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctors();
  }, [activeTab]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      if (activeTab === 'specialty') {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getSpecialties();
          setSpecialties(response.content || []);
        } catch (err) {
          setError('Không thể tải danh sách chuyên khoa');
          setSpecialties([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSpecialties();
  }, [activeTab]);

  useEffect(() => {
    const fetchDoctorsBySpecialty = async () => {
      if (selectedSpecialty) {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getDoctorsBySpecialty(selectedSpecialty);
          setSpecialtyDoctors(response.content || []);
        } catch (err) {
          setError('Không thể tải danh sách bác sĩ theo chuyên khoa');
          setSpecialtyDoctors([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDoctorsBySpecialty();
  }, [selectedSpecialty]);

  const handleSearch = async () => {
    setHasSearched(false);
    if (!searchTerm.trim()) {
      setDoctorResults([]);
      return;
    }
    setSearching(true);
    try {
      const doctorRes = await apiService.searchDoctorsByName(searchTerm);
      setDoctorResults(doctorRes.content || []);
    } catch (err) {
      setDoctorResults([]);
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  };

  const bookingOptions = [
    {
      id: 'specialty',
      title: 'Đặt khám theo chuyên khoa',
      description: 'Chọn chuyên khoa phù hợp với nhu cầu khám bệnh của bạn',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'doctor',
      title: 'Đặt khám theo bác sĩ',
      description: 'Chọn bác sĩ mà bạn mong muốn thăm khám',
      icon: Stethoscope,
      color: 'green'
    },
    {
      id: 'search',
      title: 'Tra cứu thông tin',
      description: 'tra cứu thông tin bệnh nhân',
      icon: Search,
      color: 'yellow'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'specialty':
        if (selectedSpecialty) {
          if (loading) {
            return <div className="text-center py-12">Đang tải...</div>;
          }
          if (error) {
            return <div className="text-center py-12 text-red-500">{error}</div>;
          }
          if (!specialtyDoctors || specialtyDoctors.length === 0) {
            return (
              <div className="text-center py-12">
                <button onClick={() => setSelectedSpecialty(null)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Quay lại</button>
                <div className="text-gray-500">Không có bác sĩ nào thuộc chuyên khoa này</div>
              </div>
            );
          }
          return (
            <div>
              <button onClick={() => setSelectedSpecialty(null)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Quay lại</button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {specialtyDoctors.map((doctor) => (
                  <Link
                    key={doctor.doctor_id}
                    to={`/book-appointment/doctor/${doctor.doctor_id}`}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      {doctor.user.image_url ? (
                        <img
                          src={doctor.user.image_url}
                          alt={doctor.user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-24 h-24 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">{doctor.user.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {doctor.specialties.map(s => s.name).join(', ')}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">SĐT:</span> {doctor.user.phone_number || 'Chưa cập nhật'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {doctor.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Kinh nghiệm:</span> {doctor.years_of_experience} năm
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        }
        if (loading) {
          return <div className="text-center py-12">Đang tải...</div>;
        }
        if (error) {
          return <div className="text-center py-12 text-red-500">{error}</div>;
        }
        if (!specialties || specialties.length === 0) {
          return <div className="text-center py-12 text-gray-500">Không có chuyên khoa nào</div>;
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((specialty) => (
              <div
                key={specialty.specialty_id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-[#00cfff] transition-all duration-200 p-5 flex flex-col gap-2 cursor-pointer group"
                onClick={() => setSelectedSpecialty(specialty.specialty_id)}
              >
                <div className="font-bold text-xl text-gray-800 mb-1 group-hover:text-[#00cfff] transition-colors">{specialty.name}</div>
                <div className="text-sm text-gray-600 mb-2">{specialty.description}</div>
                <div className="flex-1"></div>
                <div className="text-xs text-gray-500">Số bác sĩ: <span className="font-semibold text-gray-700">{specialty.doctor_count}</span></div>
                <div className="text-xs text-gray-500">Phòng khám: <span className="font-semibold text-gray-700">{specialty.clinic?.name}</span></div>
              </div>
            ))}
          </div>
        );

      case 'doctor':
        let doctorsToShow = doctors;
        if (hasSearched && doctorResults.length > 0) {
          doctorsToShow = doctorResults;
        }
        if (loading) {
          return <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>;
        }
        if (error) {
          return <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button onClick={() => setActiveTab('doctor')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Thử lại</button>
          </div>;
        }
        if (!doctorsToShow || doctorsToShow.length === 0) {
          return <div className="text-center py-12">
            <p className="text-gray-500">Không có bác sĩ nào</p>
          </div>;
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctorsToShow.map((doctor) => (
              <Link
                key={doctor.doctor_id}
                to={`/book-appointment/doctor/${doctor.doctor_id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  {doctor.user.image_url ? (
                    <img
                      src={doctor.user.image_url}
                      alt={doctor.user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{doctor.user.full_name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialties.map(s => s.name).join(', ')}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">SĐT:</span> {doctor.user.phone_number || 'Chưa cập nhật'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {doctor.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Kinh nghiệm:</span> {doctor.years_of_experience} năm
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Tính năng đang được phát triển</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Đặt lịch khám bệnh
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Chọn hình thức đặt khám phù hợp với nhu cầu của bạn
        </p>
      </div>

      {/* Booking Options */}
      <div className="flex justify-center items-center mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {bookingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveTab(option.id)}
              className={`p-8 rounded-xl text-center transition-all transform hover:scale-105 ${
                activeTab === option.id
                  ? `bg-${option.color}-50 border-2 border-${option.color}-500 shadow-lg`
                  : 'bg-white border-2 border-transparent hover:border-gray-200 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  activeTab === option.id ? `bg-${option.color}-100` : 'bg-gray-50'
                }`}>
                  <option.icon
                    className={`w-10 h-10 ${
                      activeTab === option.id ? `text-${option.color}-500` : 'text-gray-400'
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-xl text-gray-800 mb-3">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto flex">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bác sĩ..."
            className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 pr-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#00cfff] text-white rounded-full px-4 py-2 font-semibold hover:bg-cyan-600 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default BookAppointment;
