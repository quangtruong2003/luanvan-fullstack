import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, Search, UserCircle, MapPin, Clock, Star } from 'lucide-react';
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
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (activeTab === 'doctor') {
        try {
          setLoading(true);
          setError(null);
          const response = await apiService.getDoctors();
          setDoctors(response.content || response.doctors || []);
        } catch (error) {
          setError('Không thể tải danh sách bác sĩ');
          console.error('Error fetching doctors:', error);
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
        } catch (error) {
          console.error('Error fetching specialties:', error);
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
        } catch (error) {
          console.error('Error fetching doctors by specialty:', error);
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
    setIsSearching(true);
    try {
      const doctorRes = await apiService.searchDoctorsByName(searchTerm);
      setDoctorResults(doctorRes.content || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setDoctorResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const bookingOptions = [
    {
      id: 'specialty',
      title: 'Đặt khám theo chuyên khoa',
      description: 'Tìm bác sĩ phù hợp qua chuyên khoa y tế',
      icon: Calendar,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'doctor',
      title: 'Đặt khám theo bác sĩ',
      description: 'Chọn trực tiếp bác sĩ mong muốn',
      icon: Stethoscope,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'search',
      title: 'Tìm kiếm nhanh',
      description: 'Tra cứu thông tin bác sĩ nhanh chóng',
      icon: Search,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
  ];

  const DoctorCard = ({ doctor }) => (
    <Link
      to={`/book-appointment/doctor/${doctor.doctor_id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
    >
      <div className="relative">
        <div className="w-full h-52 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          {doctor.user?.image_url ? (
            <img
              src={doctor.user.image_url}
              alt={doctor.user?.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-20 h-20 text-gray-400" />
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
          {doctor.years_of_experience} năm KN
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {doctor.user?.full_name}
        </h3>
        
        <div className="flex items-center text-blue-600 mb-3">
          <Stethoscope className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            {doctor.specialties?.map(s => s.name).join(', ') || 'Chuyên khoa chung'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{doctor.clinic?.name || 'Phòng khám'}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Sẵn sàng tư vấn</span>
          </div>
        </div>

        {doctor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {doctor.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-700">4.8</span>
            <span className="text-sm text-gray-500 ml-1">(127 đánh giá)</span>
          </div>
          <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
            Đặt lịch →
          </span>
        </div>
      </div>
    </Link>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <span className="ml-3 text-gray-600">Đang tải...</span>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'specialty': {
        if (selectedSpecialty) {
          if (loading) return <LoadingSpinner />;
          if (error) {
            return (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={() => setSelectedSpecialty(null)} 
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            );
          }
          if (!specialtyDoctors || specialtyDoctors.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
                  <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có bác sĩ</h3>
                  <p className="text-gray-600 mb-4">Hiện tại chưa có bác sĩ nào thuộc chuyên khoa này</p>
                  <button 
                    onClick={() => setSelectedSpecialty(null)} 
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Quay lại chọn chuyên khoa
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div>
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setSelectedSpecialty(null)} 
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Quay lại chọn chuyên khoa
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tìm thấy</p>
                  <p className="text-2xl font-bold text-gray-900">{specialtyDoctors.length} bác sĩ</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {specialtyDoctors.map((doctor) => (
                  <DoctorCard key={doctor.doctor_id} doctor={doctor} />
                ))}
              </div>
            </div>
          );
        }
        
        if (loading) return <LoadingSpinner />;
        if (error) {
          return (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          );
        }
        if (!specialties || specialties.length === 0) {
          return (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có chuyên khoa nào</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specialties.map((specialty) => (
              <div
                key={specialty.specialty_id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-6 cursor-pointer"
                onClick={() => setSelectedSpecialty(specialty.specialty_id)}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {specialty.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Số bác sĩ:</span>
                      <span className="font-semibold text-gray-900">{specialty.doctor_count || 0}</span>
                    </div>
                    {specialty.clinic?.name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">{specialty.clinic.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'doctor': {
        const doctorsToShow = hasSearched && doctorResults.length > 0 ? doctorResults : doctors;
        
        if (loading) return <LoadingSpinner />;
        if (error) {
          return (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => setActiveTab('doctor')} 
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          );
        }
        if (!doctorsToShow || doctorsToShow.length === 0) {
          return (
            <div className="text-center py-12">
              <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {hasSearched ? 'Không tìm thấy bác sĩ' : 'Không có bác sĩ nào'}
              </h3>
              <p className="text-gray-600">
                {hasSearched ? 'Vui lòng thử từ khóa khác' : 'Hiện tại chưa có bác sĩ nào trong hệ thống'}
              </p>
            </div>
          );
        }
        
        return (
          <div>
            {hasSearched && (
              <div className="mb-8 text-center">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-bold text-gray-900">{doctorsToShow.length}</span> bác sĩ 
                  cho từ khóa "<span className="font-medium text-blue-600">{searchTerm}</span>"
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctorsToShow.map((doctor) => (
                <DoctorCard key={doctor.doctor_id} doctor={doctor} />
              ))}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tính năng đang phát triển</h3>
            <p className="text-gray-600">Chức năng này sẽ sớm được cập nhật</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Đặt lịch khám bệnh
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hệ thống đặt lịch khám bệnh hiện đại - Dễ dàng, nhanh chóng và tiện lợi
          </p>
        </div>

        {/* Booking Options */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {bookingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`relative p-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === option.id
                    ? 'bg-white shadow-2xl ring-2 ring-blue-500 ring-offset-2'
                    : 'bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                    activeTab === option.id 
                      ? `bg-gradient-to-r ${option.gradient} shadow-lg` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <option.icon
                      className={`w-10 h-10 transition-colors duration-300 ${
                        activeTab === option.id ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                {activeTab === option.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo tên..."
                className="w-full px-6 py-4 pr-16 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-2 font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
