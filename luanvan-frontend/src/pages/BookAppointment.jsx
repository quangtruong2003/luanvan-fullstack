import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, Search, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const BookAppointment = () => {
  const [activeTab, setActiveTab] = useState('specialty');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const specialties = [
    { id: 1, name: 'Tim mạch', image: '/specialties/cardiology.jpg', count: '45 bác sĩ' },
    { id: 2, name: 'Thần kinh', image: '/specialties/neurology.jpg', count: '32 bác sĩ' },
    { id: 3, name: 'Nhi khoa', image: '/specialties/pediatrics.jpg', count: '28 bác sĩ' },
    { id: 4, name: 'Da liễu', image: '/specialties/dermatology.jpg', count: '20 bác sĩ' },
    { id: 5, name: 'Tai mũi họng', image: '/specialties/ent.jpg', count: '25 bác sĩ' },
    { id: 6, name: 'Cơ xương khớp', image: '/specialties/orthopedics.jpg', count: '30 bác sĩ' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'specialty':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((specialty) => (
              <Link
                key={specialty.id}
                to={`/book-appointment/specialty/${specialty.id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 flex items-center gap-4"
              >
                <img
                  src={specialty.image}
                  alt={specialty.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{specialty.name}</h3>
                  <p className="text-sm text-gray-500">{specialty.count}</p>
                </div>
              </Link>
            ))}
          </div>
        );

      case 'doctor':
        if (loading) {
          return (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => setActiveTab('doctor')} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          );
        }

        if (!doctors || doctors.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có bác sĩ nào</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Link
                key={doctor.userId}
                to={`/book-appointment/doctor/${doctor.userId}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  {doctor.imageUrl ? (
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{doctor.fullName}</h3>
                  <p className="text-sm text-gray-500">{doctor.role?.roleName || 'Bác sĩ'}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">SĐT:</span> {doctor.phoneNumber}
                    </p>
                    {doctor.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {doctor.email}
                      </p>
                    )}
                  </div>
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
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
            className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 pr-12"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
