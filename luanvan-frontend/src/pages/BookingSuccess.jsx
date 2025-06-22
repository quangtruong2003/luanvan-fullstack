import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Calendar, Clock, User, Building, 
  Stethoscope, CreditCard, ArrowLeft, Home 
} from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const appointment = location.state?.appointment;
  const paymentMethod = location.state?.paymentMethod;
  const paymentStatus = location.state?.paymentStatus;

  // Debug appointment data structure
  console.log('🎉 BookingSuccess - Appointment data:', appointment);
  console.log('🎉 BookingSuccess - Payment method:', paymentMethod);
  console.log('🎉 BookingSuccess - Payment status:', paymentStatus);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'momo':
        return {
          name: 'Ví MoMo',
          icon: '📱',
          color: 'text-pink-600 bg-pink-100'
        };
      case 'vnpay':
        return {
          name: 'VNPay',
          icon: '💳',
          color: 'text-blue-600 bg-blue-100'
        };
      default:
        return {
          name: 'Miễn phí',
          icon: '🆓',
          color: 'text-green-600 bg-green-100'
        };
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <CheckCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Không tìm thấy thông tin đặt lịch</h2>
          <p className="mt-2 text-gray-600">Vui lòng quay lại trang chủ</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const appointmentDateTime = appointment.appointmentDateTime || appointment.appointment_date_time;
  const dateTime = formatDateTime(appointmentDateTime);
  
  console.log('📅 DateTime value:', appointmentDateTime);
  console.log('📅 Formatted dateTime:', dateTime);
  console.log('👨‍⚕️ Doctor object:', appointment?.doctor);
  console.log('🏥 Clinic object:', appointment?.clinic);
  console.log('🩺 Specialty object:', appointment?.specialty);
  console.log('📝 Reason for visit:', appointment?.reasonForVisit || appointment?.reason_for_visit);
  const paymentInfo = getPaymentMethodInfo(paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đặt lịch thành công!</h1>
          <p className="mt-2 text-gray-600">
            Cảm ơn bạn đã sử dụng dịch vụ. Thông tin chi tiết về lịch hẹn như sau:
          </p>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Thông tin lịch hẹn</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Mã lịch hẹn</p>
                  <p className="text-gray-600 font-mono">
                    #{appointment.appointmentId || appointment.appointment_id || appointment.id || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Ngày khám</p>
                  <p className="text-gray-600">{dateTime.date}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Giờ khám</p>
                  <p className="text-gray-600">{dateTime.time}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Stethoscope className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Bác sĩ</p>
                  <p className="text-gray-600">
                    {appointment.doctor?.user?.fullName || 
                     appointment.doctor?.user?.full_name ||
                     appointment.doctor?.fullName || 
                     appointment.doctor?.full_name ||
                     appointment.doctor?.name ||
                     'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.specialty?.name || 
                     appointment.specialty?.specialty_name ||
                     'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Phòng khám</p>
                  <p className="text-gray-600">
                    {appointment.clinic?.name || 
                     appointment.clinic?.clinic_name ||
                     'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.clinic?.address || 
                     appointment.clinic?.clinic_address ||
                     'N/A'}
                  </p>
                </div>
              </div>

              {(appointment.reasonForVisit || appointment.reason_for_visit) && (
                <div className="flex items-start">
                  <div className="h-5 w-5 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                    <span className="text-yellow-600 text-xs">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Lý do khám</p>
                    <p className="text-gray-600">
                      {appointment.reasonForVisit || appointment.reason_for_visit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {paymentMethod && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thanh toán</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${paymentInfo.color}`}>
                  <span className="text-lg">{paymentInfo.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{paymentInfo.name}</p>
                  <p className="text-sm text-gray-500">
                    Trạng thái: 
                    <span className="ml-1 text-green-600 font-medium">
                      {paymentStatus === 'completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {paymentMethod === 'free' ? 'Miễn phí' : formatCurrency(
                    (appointment.depositAmount || appointment.deposit_amount || 0) + 
                    (appointment.examinationFee || appointment.examination_fee || 200000)
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {paymentMethod === 'free' ? 'Không tính phí' : 'Tổng thanh toán'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Lưu ý quan trọng</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Vui lòng có mặt đúng giờ hẹn, đến sớm 15-30 phút để làm thủ tục
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Mang theo giấy tờ tùy thân (CMND/CCCD) và thẻ bảo hiểm y tế (nếu có)
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Thông tin lịch hẹn đã được gửi đến email và SMS của bạn
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Để hủy hoặc thay đổi lịch hẹn, vui lòng liên hệ phòng khám trước 24 giờ
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-appointments')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Xem lịch hẹn của tôi
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Về trang chủ
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ hotline: 
            <a href="tel:1900123456" className="ml-1 text-blue-600 hover:underline">
              1900 123 456
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 