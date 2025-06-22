import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ArrowLeft, CheckCircle, AlertCircle, 
  Clock, User, Calendar, Stethoscope, Building, 
  Smartphone, Shield, Info
} from 'lucide-react';
import { apiService } from '../services/api';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('momo');
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    enableMomo: true,
    enableVNPay: true,
    defaultPaymentMethod: 'momo',
    depositAmount: 50000,
    examinationFee: 200000
  });

  // Get appointment data from location state
  const appointmentData = location.state?.appointmentData;
  const appointmentInfo = location.state?.appointmentInfo;

  useEffect(() => {
    // If no appointment data, redirect back
    if (!appointmentData) {
      navigate('/book-appointment', { replace: true });
      return;
    }

    // Fetch payment configuration from admin settings
    fetchPaymentConfig();
  }, [appointmentData, navigate]);

  const fetchPaymentConfig = async () => {
    try {
      // Try to fetch from admin settings API
      // For now, simulate API call or use localStorage for demo
      let config = {
        enableMomo: true,
        enableVNPay: true,
        defaultPaymentMethod: 'momo',
        depositAmount: 50000,
        examinationFee: 200000
      };

      // Try to get from localStorage (for demo purposes)
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        try {
          const adminSettings = JSON.parse(savedSettings);
          if (adminSettings.payment) {
            config = { ...config, ...adminSettings.payment };
          }
        } catch (parseError) {
          console.warn('Failed to parse admin settings from localStorage:', parseError);
        }
      }

      console.log('💰 Payment config loaded:', config);

      setPaymentConfig(config);

      // Check if no payment methods are enabled
      const hasPaymentMethods = config.enableMomo || config.enableVNPay;
      
      if (!hasPaymentMethods) {
        console.log('🆓 No payment methods enabled - Auto-booking with free mode');
        // Auto-process free appointment
        setTimeout(() => {
          handleFreeAppointment();
        }, 1000);
      } else {
        // Set default payment method if any are available
        if (config.enableMomo && config.defaultPaymentMethod === 'momo') {
          setSelectedPaymentMethod('momo');
        } else if (config.enableVNPay && config.defaultPaymentMethod === 'vnpay') {
          setSelectedPaymentMethod('vnpay');
        } else if (config.enableMomo) {
          setSelectedPaymentMethod('momo');
        } else if (config.enableVNPay) {
          setSelectedPaymentMethod('vnpay');
        }
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
    }
  };

  const handleFreeAppointment = async () => {
    setLoading(true);
    
    try {
      console.log('🆓 Processing free appointment...');
      
      // Update appointment data for free booking
      const freeAppointmentData = {
        ...appointmentData,
        depositAmount: 0.0,
        isDepositPaid: false,
        isDepositNonRefundable: false
      };
      
      console.log('📤 Free appointment data:', freeAppointmentData);
      
      // Create appointment directly
      const appointmentResponse = await apiService.createAppointment(freeAppointmentData);
      console.log('✅ Free appointment created:', appointmentResponse);
      
      // Navigate to success page
      navigate('/booking-success', {
        state: {
          appointment: appointmentResponse,
          paymentMethod: 'free',
          paymentStatus: 'completed'
        }
      });
      
    } catch (error) {
      console.error('❌ Free appointment error:', error);
      alert('Có lỗi xảy ra khi đặt lịch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // Check if no payment methods are enabled
    if (!paymentConfig.enableMomo && !paymentConfig.enableVNPay) {
      await handleFreeAppointment();
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setLoading(true);

    try {
      // Update appointment data with actual deposit amount
      const paymentAppointmentData = {
        ...appointmentData,
        depositAmount: paymentConfig.depositAmount || 0.0,
        isDepositPaid: false,
        isDepositNonRefundable: false
      };

      console.log('📤 Payment appointment data:', paymentAppointmentData);

      // Step 1: Create appointment first
      const appointmentResponse = await apiService.createAppointment(paymentAppointmentData);
      
      if (appointmentResponse && appointmentResponse.appointmentId) {
        // Step 2: Process payment if needed
        if (selectedPaymentMethod === 'momo') {
          await processmomoPayment(appointmentResponse);
        } else if (selectedPaymentMethod === 'vnpay') {
          await processVNPayPayment(appointmentResponse);
        } else {
          // Direct success for free appointments
          navigate('/booking-success', {
            state: {
              appointment: appointmentResponse,
              paymentMethod: 'free'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing appointment and payment:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processmomoPayment = async (appointment) => {
    try {
      // Mock MoMo payment flow
      console.log('Processing MoMo payment for appointment:', appointment.appointmentId);
      
      // Simulate payment processing
      setTimeout(() => {
        navigate('/booking-success', {
          state: {
            appointment: appointment,
            paymentMethod: 'momo',
            paymentStatus: 'completed'
          }
        });
      }, 2000);

    } catch (error) {
      console.error('MoMo payment error:', error);
      throw new Error('Lỗi thanh toán MoMo: ' + error.message);
    }
  };

  const processVNPayPayment = async (appointment) => {
    try {
      // Mock VNPay payment flow
      console.log('Processing VNPay payment for appointment:', appointment.appointmentId);
      
      // Simulate payment processing
      setTimeout(() => {
        navigate('/booking-success', {
          state: {
            appointment: appointment,
            paymentMethod: 'vnpay',
            paymentStatus: 'completed'
          }
        });
      }, 2000);

    } catch (error) {
      console.error('VNPay payment error:', error);
      throw new Error('Lỗi thanh toán VNPay: ' + error.message);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin lịch hẹn</h2>
          <p className="text-gray-600 mb-4">Vui lòng quay lại và thử lại</p>
          <button
            onClick={() => navigate('/book-appointment')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Đặt lịch mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán & Xác nhận lịch hẹn</h1>
          <p className="text-gray-600 mt-2">Vui lòng chọn phương thức thanh toán và xác nhận thông tin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lịch hẹn</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Bệnh nhân</p>
                    <p className="text-gray-600">{appointmentInfo?.patientName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{appointmentInfo?.patientPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Stethoscope className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Bác sĩ</p>
                    <p className="text-gray-600">{appointmentInfo?.doctorName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{appointmentInfo?.specialtyName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-5 w-5 text-purple-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Phòng khám</p>
                    <p className="text-gray-600">{appointmentInfo?.clinicName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Thời gian</p>
                    <p className="text-gray-600">{formatDateTime(appointmentData?.appointmentDateTime)}</p>
                  </div>
                </div>

                {appointmentData?.reasonForVisit && (
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Lý do khám</p>
                      <p className="text-gray-600">{appointmentData.reasonForVisit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h2>
              
              <div className="space-y-4">
                {/* MoMo Payment */}
                {paymentConfig.enableMomo && (
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'momo'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('momo')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                          <Smartphone className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Ví MoMo</h3>
                          <p className="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedPaymentMethod === 'momo'}
                          onChange={() => setSelectedPaymentMethod('momo')}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                    {selectedPaymentMethod === 'momo' && (
                      <div className="mt-3 pl-16">
                        <div className="bg-pink-25 border border-pink-200 rounded p-3">
                          <div className="flex items-center text-sm text-pink-700">
                            <Shield className="h-4 w-4 mr-2" />
                            An toàn và bảo mật với MoMo
                          </div>
                          <p className="text-xs text-pink-600 mt-1">
                            Giao dịch được mã hóa và bảo vệ bởi MoMo
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* VNPay Payment */}
                {paymentConfig.enableVNPay && (
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'vnpay'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('vnpay')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">VNPay</h3>
                          <p className="text-sm text-gray-600">Thanh toán qua cổng VNPay</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedPaymentMethod === 'vnpay'}
                          onChange={() => setSelectedPaymentMethod('vnpay')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {selectedPaymentMethod === 'vnpay' && (
                      <div className="mt-3 pl-16">
                        <div className="bg-blue-25 border border-blue-200 rounded p-3">
                          <div className="flex items-center text-sm text-blue-700">
                            <Shield className="h-4 w-4 mr-2" />
                            Bảo mật cao với VNPay
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Hỗ trợ thanh toán qua thẻ ATM, Visa, Mastercard
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No payment methods available */}
                {!paymentConfig.enableMomo && !paymentConfig.enableVNPay && (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-gray-600">Hiện tại chưa có phương thức thanh toán nào khả dụng</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary & Actions */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt thanh toán</h2>
              
              <div className="space-y-3">
                {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) ? (
                  // Free mode display
                  <div className="text-center py-4">
                    <div className="text-green-600 font-semibold text-lg mb-2">🆓 Miễn phí</div>
                    <p className="text-sm text-gray-500">Đặt lịch không tính phí</p>
                  </div>
                ) : (
                  // Normal payment display
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí khám</span>
                      <span className="text-gray-900">{formatCurrency(paymentConfig.examinationFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí đặt cọc</span>
                      <span className="text-gray-900">{formatCurrency(paymentConfig.depositAmount)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Tổng cộng</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(paymentConfig.examinationFee + paymentConfig.depositAmount)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : (!paymentConfig.enableMomo && !paymentConfig.enableVNPay)
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin h-4 w-4 mr-2" />
                    {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) ? 'Đang đặt lịch...' : 'Đang xử lý...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) 
                      ? 'Xác nhận đặt lịch miễn phí' 
                      : 'Xác nhận đặt lịch & Thanh toán'
                    }
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng cách nhấn "Xác nhận", bạn đồng ý với điều khoản sử dụng của chúng tôi
              </p>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Vui lòng có mặt đúng giờ hẹn</li>
                <li>• Mang theo giấy tờ tùy thân khi đến khám</li>
                <li>• Phí đặt cọc sẽ được trừ vào tổng chi phí khám</li>
                <li>• Liên hệ phòng khám để hủy/thay đổi lịch hẹn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 