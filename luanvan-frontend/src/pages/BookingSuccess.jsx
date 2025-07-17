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
            <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Chi tiết lịch hẹn</h3>
                <div className="space-y-3 text-gray-700">
                    <p><strong>Mã lịch hẹn:</strong> #{appointment.id}</p>
                    <p><strong>Bệnh nhân:</strong> {appointment.patient_name || appointment.patientName || 'N/A'}</p>
                    <p><strong>Bác sĩ:</strong> {appointment.doctor_name || appointment.doctorName || 'N/A'}</p>
                    <p><strong>Chuyên khoa:</strong> {appointment.specialty_name || appointment.specialtyName || 'N/A'}</p>
                    <p><strong>Phòng khám:</strong> {appointment.clinic_name || appointment.clinicName || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {appointment.clinic_address || appointment.clinicAddress || 'N/A'}</p>
                    <p><strong>Ngày giờ:</strong> {formattedTime} - {formattedDate}</p>
                    <p><strong>Trạng thái:</strong> 
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {appointment.status}
                        </span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    {isLoading ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700">Đang xử lý thanh toán</h2>
                            <div className="flex justify-center my-6">
                                <RingLoader color="#4A90E2" size={80} />
                            </div>
                            <p className="text-gray-600">{verificationStatus}</p>
                        </>
                    ) : error ? (
                        <>
                            <h2 className="text-3xl font-bold text-red-600">Xác nhận lịch hẹn thất bại</h2>
                            <p className="mt-4 text-gray-600">Đã có lỗi xảy ra trong quá trình xác nhận thanh toán.</p>
                            <p className="mt-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-green-600">Đặt lịch thành công!</h2>
                            <p className="mt-4 text-gray-600">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Lịch hẹn của bạn đã được xác nhận.</p>
                            {renderAppointmentDetails()}
                        </>
                    )}
                </div>
                {!isLoading && (
                     <div className="mt-8 text-center">
                        <Link to="/my-appointments" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Xem lịch hẹn của tôi
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingSuccess; 