import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ArrowLeft, CheckCircle, AlertCircle, 
  Clock, User, Calendar, Stethoscope, Building, 
  Smartphone, Shield, Info, ChevronLeft, 
  DollarSign, Zap, Star, Heart, 
  MapPin, Phone, Mail, FileText,
  Banknote, Wallet, CreditCardIcon,
  CheckSquare, Lock, Gift
} from 'lucide-react';
import { apiService } from '../services/api';
import { useNotification } from '../components/NotificationSystem';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useNotification();
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
      showError('Có lỗi xảy ra khi đặt lịch: ' + error.message, 'Lỗi đặt lịch');
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
      showError('Vui lòng chọn phương thức thanh toán', 'Chưa chọn phương thức');
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
      showError('Có lỗi xảy ra: ' + error.message, 'Lỗi xử lý thanh toán');
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy thông tin lịch hẹn</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Vui lòng quay lại trang đặt lịch để tiếp tục quy trình thanh toán.
            </p>
            <button
              onClick={() => navigate('/book-appointment')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Đặt lịch mới</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-12">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Thanh toán & Xác nhận
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Chọn phương thức thanh toán và hoàn tất quy trình đặt lịch khám bệnh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Appointment Details */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Thông tin lịch hẹn</h2>
                    <p className="text-blue-100">Chi tiết cuộc hẹn của bạn</p>
                  </div>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Bệnh nhân</p>
                        <p className="font-bold text-gray-900">{appointmentInfo?.patientName || 'N/A'}</p>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{appointmentInfo?.patientPhone || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Bác sĩ</p>
                        <p className="font-bold text-gray-900">{appointmentInfo?.doctorName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{appointmentInfo?.specialtyName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Phòng khám</p>
                        <p className="font-bold text-gray-900">{appointmentInfo?.clinicName || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Thời gian</p>
                        <p className="font-bold text-gray-900">{formatDateTime(appointmentData?.appointmentDateTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {appointmentData?.reasonForVisit && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-600 font-medium mb-1">Lý do khám</p>
                        <p className="text-gray-700 leading-relaxed">{appointmentData.reasonForVisit}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Payment Methods */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
                    <p className="text-emerald-100">Chọn cách thức thanh toán phù hợp</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Options */}
              <div className="p-6 space-y-4">
                {/* MoMo Payment */}
                {paymentConfig.enableMomo && (
                  <div
                    className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      selectedPaymentMethod === 'momo'
                        ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-pink-100 shadow-lg shadow-pink-200'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod('momo')}
                  >
                    {selectedPaymentMethod === 'momo' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Smartphone className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Ví MoMo</h3>
                            <p className="text-gray-600">Thanh toán nhanh chóng & bảo mật</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-500">Phổ biến nhất</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'momo' && (
                        <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-xl">
                          <div className="flex items-center space-x-2 text-pink-700 mb-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-medium">Bảo mật tuyệt đối</span>
                          </div>
                          <p className="text-sm text-pink-600 leading-relaxed">
                            • Mã hóa 256-bit SSL<br/>
                            • Xác thực sinh trắc học<br/>
                            • Hoàn tiền 100% nếu có sự cố
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* VNPay Payment */}
                {paymentConfig.enableVNPay && (
                  <div
                    className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      selectedPaymentMethod === 'vnpay'
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-200'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod('vnpay')}
                  >
                    {selectedPaymentMethod === 'vnpay' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <CreditCard className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">VNPay</h3>
                            <p className="text-gray-600">Đa dạng hình thức thanh toán</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Heart className="w-4 h-4 text-red-400 fill-current" />
                              <span className="text-sm text-gray-500">Tin cậy cao</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'vnpay' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center space-x-2 text-blue-700 mb-2">
                            <Lock className="h-5 w-5" />
                            <span className="font-medium">Đa phương thức</span>
                          </div>
                          <p className="text-sm text-blue-600 leading-relaxed">
                            • Thẻ ATM nội địa<br/>
                            • Visa, Mastercard<br/>
                            • Internet Banking
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No payment methods available */}
                {!paymentConfig.enableMomo && !paymentConfig.enableVNPay && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt lịch miễn phí!</h3>
                    <p className="text-gray-600">Hiện tại bạn có thể đặt lịch mà không cần thanh toán trước</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Payment Summary & Actions */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Chi phí dự kiến</h2>
                    <p className="text-violet-100">Tóm tắt thanh toán</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="p-6">
                {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) ? (
                  // Free mode display
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">Miễn phí!</div>
                    <p className="text-gray-600">Đặt lịch không tính phí trước</p>
                  </div>
                ) : (
                  // Normal payment display
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Phí khám</span>
                      </div>
                      <span className="text-gray-900 font-bold">{formatCurrency(paymentConfig.examinationFee)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Phí đặt cọc</span>
                      </div>
                      <span className="text-gray-900 font-bold">{formatCurrency(paymentConfig.depositAmount)}</span>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-gray-200 pt-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(paymentConfig.examinationFee + paymentConfig.depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full relative overflow-hidden rounded-2xl py-6 px-8 text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : (!paymentConfig.enableMomo && !paymentConfig.enableVNPay)
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                <div className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>
                        {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) ? 'Đang đặt lịch...' : 'Đang xử lý...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-6 w-6" />
                      <span>
                        {(!paymentConfig.enableMomo && !paymentConfig.enableVNPay) 
                          ? 'Xác nhận đặt lịch miễn phí' 
                          : 'Xác nhận & Thanh toán'
                        }
                      </span>
                      <Zap className="h-6 w-6" />
                    </>
                  )}
                </div>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                Bằng cách nhấn "Xác nhận", bạn đồng ý với <span className="font-medium text-blue-600">điều khoản sử dụng</span> của chúng tôi
              </p>
            </div>

            {/* Enhanced Important Notes */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-800">Lưu ý quan trọng</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-amber-700">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Vui lòng có mặt đúng giờ hẹn</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-700">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Mang theo giấy tờ tùy thân khi đến khám</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-700">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Phí đặt cọc sẽ được trừ vào tổng chi phí khám</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-700">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Liên hệ phòng khám để hủy/thay đổi lịch hẹn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 