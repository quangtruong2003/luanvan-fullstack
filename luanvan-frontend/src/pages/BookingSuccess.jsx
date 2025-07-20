import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { apiService, notificationService } from '../services/api';
import { RingLoader } from 'react-spinners';

function BookingSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('Verifying...');

    useEffect(() => {
        const verifyPayment = async () => {
            // Lấy chuỗi query trực tiếp từ href để đảm bảo tính toàn vẹn
            const href = window.location.href;
            const queryStringIndex = href.indexOf('?');
            
            if (queryStringIndex !== -1) {
                const queryString = href.substring(queryStringIndex + 1);
                
                try {
                    setIsLoading(true);
                    setVerificationStatus('Confirming transaction with the server...');

                    // Gửi chuỗi query gốc lên backend để xác thực
                    const updatedAppointment = await apiService.handleVNPayReturn(queryString);

                    if (updatedAppointment && updatedAppointment.id) {
                        setAppointment(updatedAppointment);
                        setVerificationStatus('Payment Verified Successfully!');
                        notificationService.showSuccess('Xác nhận thanh toán và đặt lịch thành công!');
                    } else {
                        throw new Error('Failed to retrieve appointment details after payment.');
                    }
                } catch (err) {
                    console.error("Payment verification failed:", err);
                    setError(err.message || 'An unexpected error occurred during payment verification.');
                    setVerificationStatus('Verification Failed');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError('Invalid callback parameters from payment gateway.');
                setVerificationStatus('Verification Failed');
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [location, navigate]); // Thêm dependencies để tránh warning

    const renderAppointmentDetails = () => {
        if (!appointment) return null;

        const dateTimeString = appointment.appointment_date_time || appointment.appointmentDateTime;
        const appointmentDateTime = new Date(dateTimeString);

        const formattedDate = !isNaN(appointmentDateTime) ? appointmentDateTime.toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }) : 'Ngày không hợp lệ';

        const formattedTime = !isNaN(appointmentDateTime) ? appointmentDateTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        }) : 'Giờ không hợp lệ';

        return (
            <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Chi tiết lịch hẹn</h3>
                
                <div className="grid gap-4">
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Mã lịch hẹn</span>
                        <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">#{appointment.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Bệnh nhân</span>
                        <span className="font-semibold text-gray-800">{appointment.patient_name || appointment.patientName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Bác sĩ</span>
                        <span className="font-semibold text-gray-800">{appointment.doctor_name || appointment.doctorName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Chuyên khoa</span>
                        <span className="font-semibold text-gray-800">{appointment.specialty_name || appointment.specialtyName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Phòng khám</span>
                        <span className="font-semibold text-gray-800">{appointment.clinic_name || appointment.clinicName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Địa chỉ</span>
                        <span className="font-semibold text-gray-800 text-right max-w-xs">{appointment.clinic_address || appointment.clinicAddress || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Thời gian</span>
                        <div className="text-right">
                            <div className="font-bold text-green-700">{formattedTime}</div>
                            <div className="text-sm text-gray-600">{formattedDate}</div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Trạng thái</span>
                        <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                            appointment.status === 'CONFIRMED' 
                                ? 'bg-green-500 text-white shadow-md' 
                                : 'bg-yellow-400 text-yellow-800 shadow-md'
                        }`}>
                            {appointment.status === 'CONFIRMED' ? 'Đã xác nhận' : appointment.status}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="text-center p-8">
                        {isLoading ? (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <RingLoader color="#3B82F6" size={60} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán</h2>
                                    <p className="text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block">{verificationStatus}</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-600 mb-4">Xác nhận lịch hẹn thất bại</h2>
                                    <p className="text-gray-600 mb-4">Đã có lỗi xảy ra trong quá trình xác nhận thanh toán.</p>
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-green-600 mb-2">Đặt lịch thành công!</h1>
                                    <p className="text-lg text-gray-700 mb-2">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi</p>
                                    <p className="text-gray-600">Lịch hẹn của bạn đã được xác nhận và email thông báo đã được gửi</p>
                                </div>
                                {renderAppointmentDetails()}
                            </div>
                        )}
                    </div>
                    
                    {!isLoading && (
                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/my-appointments" 
                                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Xem lịch hẹn của tôi
                                </Link>
                                
                                <Link 
                                    to="/" 
                                    className="flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Về trang chủ
                                </Link>
                            </div>
                            
                            {!error && appointment && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-sm text-blue-700">
                                            <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                                            <ul className="list-disc list-inside space-y-1 text-blue-600">
                                                <li>Vui lòng có mặt trước 15 phút so với giờ hẹn</li>
                                                <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                                                <li>Liên hệ hotline nếu cần thay đổi lịch hẹn</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookingSuccess; 