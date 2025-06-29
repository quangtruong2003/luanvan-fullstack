import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Save, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';

const PaymentManagement = () => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [paymentSettings, setPaymentSettings] = useState({
    enableMomo: true,
    enableVNPay: true,
    momoApiKey: '',
    momoSecretKey: '',
    momoPartnerCode: '',
    vnpayTmnCode: '',
    vnpaySecretKey: '',
    defaultPaymentMethod: 'momo',
    depositAmount: 50000
  });

  useEffect(() => {
    // Load payment settings from localStorage on component mount
    const loadPaymentSettings = () => {
      try {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          if (parsedSettings.payment) {
            setPaymentSettings(parsedSettings.payment);
            console.log('📂 Payment settings loaded from localStorage:', parsedSettings.payment);
          }
        }
      } catch (error) {
        console.warn('Failed to load payment settings from localStorage:', error);
      }
    };

    loadPaymentSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Load existing settings and update payment section
      const existingSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      const updatedSettings = {
        ...existingSettings,
        payment: paymentSettings
      };
      
      // Save to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
      console.log('💾 Payment settings saved to localStorage:', paymentSettings);
      
      setMessage({ type: 'success', content: 'Cài đặt thanh toán đã được lưu thành công' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      setMessage({ type: 'error', content: 'Lỗi khi lưu cài đặt thanh toán: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle Switch Component như iPhone
  const ToggleSwitch = ({ id, checked, onChange, disabled = false, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-600',
      pink: 'bg-pink-500'
    };
    
    return (
      <div className="relative inline-block">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`relative inline-flex items-center cursor-pointer ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <div
            className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              checked
                ? colorClasses[color] || 'bg-blue-600'
                : 'bg-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                checked ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h2>
          <p className="text-gray-600 mt-1">Cấu hình các phương thức thanh toán và tiền đặt cọc</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* Message */}
      {message.content && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.content}
        </div>
      )}

      {/* Payment Settings Content */}
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">Cài đặt Phương thức Thanh toán</h4>
          <p className="text-sm text-blue-700">
            Cấu hình các phương thức thanh toán khả dụng cho hệ thống đặt lịch khám.
          </p>
        </div>

        {/* Payment Methods Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <CreditCard className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">MoMo</h5>
                  <p className="text-sm text-gray-500">Ví điện tử MoMo</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ToggleSwitch
                  id="enableMomo"
                  checked={paymentSettings.enableMomo}
                  onChange={(e) => handleInputChange('enableMomo', e.target.checked)}
                  color="pink"
                />
                <span className="text-sm font-medium text-gray-700">
                  {paymentSettings.enableMomo ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
            </div>
            <div className={`space-y-3 ${!paymentSettings.enableMomo ? 'opacity-50' : ''}`}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Partner Code
                </label>
                <input
                  type="text"
                  disabled={!paymentSettings.enableMomo}
                  value={paymentSettings.momoPartnerCode}
                  onChange={(e) => handleInputChange('momoPartnerCode', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nhập Partner Code"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  disabled={!paymentSettings.enableMomo}
                  value={paymentSettings.momoApiKey}
                  onChange={(e) => handleInputChange('momoApiKey', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nhập API Key"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  disabled={!paymentSettings.enableMomo}
                  value={paymentSettings.momoSecretKey}
                  onChange={(e) => handleInputChange('momoSecretKey', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nhập Secret Key"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">VNPay</h5>
                  <p className="text-sm text-gray-500">Cổng thanh toán VNPay</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ToggleSwitch
                  id="enableVNPay"
                  checked={paymentSettings.enableVNPay}
                  onChange={(e) => handleInputChange('enableVNPay', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">
                  {paymentSettings.enableVNPay ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
            </div>
            <div className={`space-y-3 ${!paymentSettings.enableVNPay ? 'opacity-50' : ''}`}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  TMN Code
                </label>
                <input
                  type="text"
                  disabled={!paymentSettings.enableVNPay}
                  value={paymentSettings.vnpayTmnCode}
                  onChange={(e) => handleInputChange('vnpayTmnCode', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nhập TMN Code"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hash Secret
                </label>
                <input
                  type="password"
                  disabled={!paymentSettings.enableVNPay}
                  value={paymentSettings.vnpaySecretKey}
                  onChange={(e) => handleInputChange('vnpaySecretKey', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nhập Hash Secret"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Amounts */}
        <div className="max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền đặt cọc (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={paymentSettings.depositAmount}
              onChange={(e) => handleInputChange('depositAmount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số tiền đặt cọc"
            />
            <p className="text-xs text-gray-500 mt-1">
              Số tiền đặt cọc người dùng phải thanh toán khi đặt lịch khám
            </p>
          </div>
        </div>

        {/* Default Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phương thức thanh toán mặc định
          </label>
          <select
            value={paymentSettings.defaultPaymentMethod}
            onChange={(e) => handleInputChange('defaultPaymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!paymentSettings.enableMomo && !paymentSettings.enableVNPay}
          >
            <option value="momo" disabled={!paymentSettings.enableMomo}>
              MoMo {!paymentSettings.enableMomo ? '(Đã tắt)' : ''}
            </option>
            <option value="vnpay" disabled={!paymentSettings.enableVNPay}>
              VNPay {!paymentSettings.enableVNPay ? '(Đã tắt)' : ''}
            </option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {(!paymentSettings.enableMomo && !paymentSettings.enableVNPay) ? 
              'Không có phương thức thanh toán nào được bật - Đặt lịch sẽ miễn phí' :
              'Phương thức thanh toán được chọn mặc định khi người dùng đặt cọc'
            }
          </p>
        </div>

        {/* Status Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h6 className="font-medium text-gray-900 mb-2">Tình trạng cấu hình</h6>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Phương thức thanh toán khả dụng:</span>
              <span className="font-medium">
                {[
                  paymentSettings.enableMomo && 'MoMo',
                  paymentSettings.enableVNPay && 'VNPay'
                ].filter(Boolean).join(', ') || 'Không có'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tổng số phương thức:</span>
              <span className="font-medium">
                {(paymentSettings.enableMomo ? 1 : 0) + (paymentSettings.enableVNPay ? 1 : 0)} / 2
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tiền đặt cọc:</span>
              <span className="font-medium text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentSettings.depositAmount)}
              </span>
            </div>
            {(!paymentSettings.enableMomo && !paymentSettings.enableVNPay) && (
              <div className="flex items-center text-sm text-amber-600 mt-3 p-2 bg-amber-50 rounded">
                <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Chế độ miễn phí: Tất cả phương thức thanh toán đã tắt - Không thu tiền đặt cọc</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement; 