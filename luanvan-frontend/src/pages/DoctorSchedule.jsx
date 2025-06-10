import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MapPin, Award, DollarSign } from 'lucide-react';
import { doctors } from '../data/mockData';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Lấy thông tin bác sĩ từ dữ liệu giả
  useEffect(() => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    if (doctor) {
      setDoctorInfo(doctor);
    }
  }, [doctorId]);

  // Cập nhật slots khi chọn ngày
  useEffect(() => {
    if (selectedDate && doctorInfo) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = doctorInfo.schedules[dateStr] || [];
      setAvailableSlots(slots);
      setSelectedTime(null); // Reset selected time when date changes
    }
  }, [selectedDate, doctorInfo]);

  // Tạo mảng các ngày trong tháng
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Thêm ngày trống cho các ngày trước ngày 1
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Thêm các ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Chuyển tháng
  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  // Format date to display
  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(date);
  };

  // Kiểm tra xem ngày có phải là quá khứ
  const isPastDate = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Xử lý đặt lịch
  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Vui lòng chọn ngày và giờ khám');
      return;
    }
    
    const bookingInfo = {
      doctorId: parseInt(doctorId),
      doctorName: doctorInfo.name,
      specialty: doctorInfo.specialty,
      date: formatDate(selectedDate),
      time: selectedTime,
      price: doctorInfo.price
    };
    
    navigate('/book-appointment/confirm', { state: { bookingInfo } });
  };

  if (!doctorInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Thông tin bác sĩ */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={doctorInfo.image}
            alt={doctorInfo.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{doctorInfo.name}</h2>
            <p className="text-blue-600 font-medium mb-2">{doctorInfo.specialty}</p>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{doctorInfo.degree}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{doctorInfo.hospital}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>Giá khám: {doctorInfo.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span>{doctorInfo.rating}/5 ({Math.floor(doctorInfo.rating * 10)} đánh giá)</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(currentMonth)}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'].map((day) => (
              <div key={day} className="text-center font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth().map((date, index) => (
              <button
                key={index}
                onClick={() => date && !isPastDate(date) && setSelectedDate(date)}
                disabled={!date || isPastDate(date)}
                className={`
                  p-2 rounded-lg text-center
                  ${!date ? 'invisible' : ''}
                  ${isPastDate(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                  ${selectedDate && date && selectedDate.toDateString() === date.toDateString()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white'}
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate
              ? `Chọn giờ khám - ${formatDate(selectedDate)}`
              : 'Vui lòng chọn ngày khám'}
          </h3>
          
          {selectedDate && (
            <>
              {availableSlots.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          flex items-center justify-center gap-2 p-3 rounded-lg border
                          ${selectedTime === time
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200'}
                        `}
                      >
                        <Clock className="w-4 h-4" />
                        {time}
                      </button>
                    ))}
                  </div>

                  {selectedTime && (
                    <div className="border-t pt-6 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Thông tin lịch hẹn</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                          <p>Bác sĩ: {doctorInfo.name}</p>
                          <p>Ngày khám: {formatDate(selectedDate)}</p>
                          <p>Giờ khám: {selectedTime}</p>
                          <p>Giá khám: {doctorInfo.price}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleBooking}
                        className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Xác nhận đặt lịch
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Không có lịch khám trong ngày này
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule; 