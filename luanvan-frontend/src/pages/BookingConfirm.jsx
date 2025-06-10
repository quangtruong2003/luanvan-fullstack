import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Calendar, Clock, User, Phone, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';

const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { doctorId, doctor, selectedDate, selectedTime } = location.state || {};

  // Redirect if no booking data
  if (!doctorId || !selectedDate || !selectedTime) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Thông tin đặt lịch không hợp lệ</p>
          <button 
            onClick={() => navigate('/book-appointment')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại đặt lịch
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        doctorId: parseInt(doctorId),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        notes: document.getElementById('notes')?.value || ''
      };

      const response = await apiService.createAppointment(bookingData);
      
      if (response) {
        setSuccess(true);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/my-appointments');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt lịch');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đặt lịch thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Lịch khám của bạn đã được đặt thành công. Bạn sẽ được chuyển đến trang lịch hẹn của mình.
          </p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Xem lịch hẹn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Xác nhận đặt lịch
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Appointment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin lịch khám</h3>
          
          <div className="space-y-4">
            {/* Doctor */}
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-600">Bác sĩ:</span>
                <p className="font-medium">{doctor?.user?.fullName || 'Bác sĩ'}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-600">Ngày khám:</span>
                <p className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-600">Giờ khám:</span>
                <p className="font-medium">{selectedTime}</p>
              </div>
            </div>

            {/* Doctor contact */}
            {doctor?.user?.phoneNumber && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <span className="text-sm text-gray-600">Liên hệ bác sĩ:</span>
                  <p className="font-medium">{doctor.user.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú thêm (tùy chọn)
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Mô tả triệu chứng, yêu cầu đặc biệt..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Confirmation buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
          </button>
        </div>
      </div>

      {/* Booking policy */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Vui lòng có mặt trước giờ hẹn 15 phút</li>
          <li>• Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
          <li>• Liên hệ phòng khám để thay đổi lịch hẹn</li>
          <li>• Hủy lịch hẹn trước 24h nếu không thể đến</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingConfirm; 