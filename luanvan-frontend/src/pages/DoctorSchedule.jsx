import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDoctorById(doctorId);
        setDoctor(response);
      } catch (err) {
        setError('Không thể tải thông tin bác sĩ');
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      navigate('/book-appointment/confirm', {
        state: {
          doctorId,
          doctor,
          selectedDate,
          selectedTime
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Đặt lịch khám với {doctor?.user?.fullName || 'Bác sĩ'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {doctor?.user?.fullName?.charAt(0) || 'BS'}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{doctor?.user?.fullName}</h3>
              <p className="text-gray-600">{doctor?.user?.role?.roleName}</p>
            </div>
            
            {doctor?.bio && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Thông tin:</h4>
                <p className="text-sm text-gray-600">{doctor.bio}</p>
              </div>
            )}
            
            {doctor?.yearsOfExperience && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Kinh nghiệm:</h4>
                <p className="text-sm text-gray-600">{doctor.yearsOfExperience} năm</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">Chọn thời gian khám</h3>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Chọn ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Chọn giờ
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 text-center rounded-lg border transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason for visit */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khám (tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả triệu chứng hoặc lý do khám..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Booking Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedDate && selectedTime
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Đặt lịch khám
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule; 