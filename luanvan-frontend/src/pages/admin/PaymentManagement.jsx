import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Save, RefreshCw, AlertCircle, CheckCircle, DollarSign
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

const PaymentManagement = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const initialLoadGuard = React.useRef(true); // Guard để chống StrictMode chạy 2 lần
  
  const [paymentSettings, setPaymentSettings] = useState({
    enableDeposit: true,
    enableMomo: true,
    enableVnPay: true, // Sửa ở đây
    momoApiKey: '',
    momoSecretKey: '',
    momoPartnerCode: '',
    vnpayTmnCode: '',
    vnpaySecretKey: '',
    defaultPaymentMethod: 'momo',
    depositAmount: 50000
  });

  useEffect(() => {
    // Sử dụng guard để đảm bảo hàm chỉ chạy một lần duy nhất khi mount
    if (initialLoadGuard.current) {
      loadPaymentSettings();
    }
    
    // Cleanup function để set guard thành false
    return () => {
      initialLoadGuard.current = false;
    }
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      console.log('📂 Loading payment settings from database...');
      
      const config = await adminService.getSystemConfig();
      console.log('✅ System config loaded:', config);
      console.log('🕵️‍♂️ DEBUG: Raw config from API:', JSON.stringify(config, null, 2)); // Dòng debug mới
      
      if (config) {
        const settings = {
          enableDeposit: config.enableDeposit === true || config.enable_deposit == 1,
          enableMomo: config.enableMomo === true || config.enable_momo == 1,
          enableVnPay: config.enableVnPay === true || config.enable_vn_pay == 1, // Sửa ở đây
          momoApiKey: config.momoApiKey || config.momo_access_key || '',
          momoSecretKey: config.momoSecretKey || config.momo_secret_key || '',
          momoPartnerCode: config.momoPartnerCode || config.momo_partner_code || '',
          vnpayTmnCode: config.vnpayTmnCode || config.vnpay_tmn_code || '',
          vnpaySecretKey: config.vnpaySecretKey || config.vnpay_secret_key || '',
          defaultPaymentMethod: config.defaultPaymentMethod || config.default_payment_method || 'momo',
          depositAmount: config.defaultDepositAmount || config.default_deposit_amount || 50000
        };
        
        setPaymentSettings(settings);
        console.log('📄 Payment settings loaded from database:', settings);
        //showInfo('Đã tải cài đặt thanh toán từ database', 'Tải thành công');
      } else {
        // If no config found, create default
        console.log('⚠️ No config found, creating default configuration...');
        await adminService.createDefaultConfiguration();
        // Retry loading after creating default
        const newConfig = await adminService.getSystemConfig();
        if (newConfig) {
          const settings = {
            enableDeposit: newConfig.enableDeposit === true || newConfig.enable_deposit == 1,
            enableMomo: newConfig.enableMomo === true || newConfig.enable_momo == 1,
            enableVnPay: newConfig.enableVnPay === true || newConfig.enable_vn_pay == 1, // Sửa ở đây
            momoApiKey: newConfig.momoApiKey || newConfig.momo_access_key || '',
            momoSecretKey: newConfig.momoSecretKey || newConfig.momo_secret_key || '',
            momoPartnerCode: newConfig.momoPartnerCode || newConfig.momo_partner_code || '',
            vnpayTmnCode: newConfig.vnpayTmnCode || newConfig.vnpay_tmn_code || '',
            vnpaySecretKey: newConfig.vnpaySecretKey || newConfig.vnpay_secret_key || '',
            defaultPaymentMethod: newConfig.defaultPaymentMethod || newConfig.default_payment_method || 'momo',
            depositAmount: newConfig.defaultDepositAmount || newConfig.default_deposit_amount || 50000
          };
          setPaymentSettings(settings);
          showInfo('Đã tạo và tải cấu hình mặc định từ database', 'Khởi tạo thành công');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load payment settings:', error);
      
      // Set default values on error before showing notification
      setPaymentSettings({
        enableDeposit: true,
        enableMomo: true,
        enableVnPay: true, // Sửa ở đây
        momoApiKey: '',
        momoSecretKey: '',
        momoPartnerCode: '',
        vnpayTmnCode: '',
        vnpaySecretKey: '',
        defaultPaymentMethod: 'momo',
        depositAmount: 50000
      });

      // Gộp 2 thông báo thành 1 để tránh duplicate
      showError('Không thể tải cài đặt. Đã áp dụng cấu hình mặc định.', 'Lỗi & Fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving payment settings to database...', paymentSettings);
      
      // Validate settings before saving
      if (paymentSettings.depositAmount < 0) {
        showError('Số tiền đặt cọc không thể âm', 'Lỗi validation');
        return;
      }
      
      // Prepare config data for API with snake_case keys
      const configData = {
        enable_deposit: paymentSettings.enableDeposit,
        enable_momo: paymentSettings.enableMomo,
        enable_vn_pay: paymentSettings.enableVnPay, // Sửa ở đây
        momo_partner_code: paymentSettings.momoPartnerCode,
        momo_access_key: paymentSettings.momoApiKey,
        momo_secret_key: paymentSettings.momoSecretKey,
        vnpay_tmn_code: paymentSettings.vnpayTmnCode,
        vnpay_secret_key: paymentSettings.vnpaySecretKey,
        default_payment_method: paymentSettings.defaultPaymentMethod,
        default_deposit_amount: paymentSettings.depositAmount
      };
      
      // Save to database using API
      const result = await adminService.updateSystemConfig(configData);
      console.log('✅ Payment settings saved to database:', result);
      
      setMessage({ type: 'success', content: 'Cài đặt thanh toán đã được lưu thành công vào database' });
      showSuccess('Cài đặt thanh toán đã được lưu vào database và có hiệu lực toàn hệ thống', 'Lưu thành công');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 5000);
    } catch (error) {
      console.error('❌ Error saving payment settings:', error);
      setMessage({ type: 'error', content: 'Lỗi khi lưu cài đặt thanh toán: ' + error.message });
      showError('Lỗi khi lưu cài đặt thanh toán: ' + error.message, 'Lỗi lưu dữ liệu');
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

  const handleToggleChange = async (field, value) => {
    // Optimistic UI update
    const originalSettings = { ...paymentSettings };
    const updatedSettings = { ...paymentSettings, [field]: value };
    setPaymentSettings(updatedSettings);

    try {
      const configData = {
        enable_deposit: updatedSettings.enableDeposit,
        enable_momo: updatedSettings.enableMomo,
        enable_vn_pay: updatedSettings.enableVnPay, // Sửa ở đây
        momo_partner_code: updatedSettings.momoPartnerCode,
        momo_access_key: updatedSettings.momoApiKey,
        momo_secret_key: updatedSettings.momoSecretKey,
        vnpay_tmn_code: updatedSettings.vnpayTmnCode,
        vnpay_secret_key: updatedSettings.vnpaySecretKey,
        default_payment_method: updatedSettings.defaultPaymentMethod,
        default_deposit_amount: updatedSettings.depositAmount
      };
      
      await adminService.updateSystemConfig(configData);
      
      showSuccess(`Trạng thái đã được cập nhật thành công!`);

    } catch (error) {
      console.error('❌ Error toggling payment method:', error);
      showError('Lỗi khi thay đổi trạng thái: ' + error.message, 'Lỗi');
      
      // Revert on error
      setPaymentSettings(originalSettings);
    }
  };

  // Toggle Switch Component như iPhone
  const ToggleSwitch = ({ id, checked, onChange, disabled = false, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-600',
      pink: 'bg-pink-500',
      green: 'bg-green-600'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải cài đặt thanh toán...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h2>
          <p className="text-gray-600 mt-1">Cấu hình các phương thức thanh toán và tiền đặt cọc</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadPaymentSettings}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
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
            Cấu hình các phương thức thanh toán và trạng thái đặt cọc cho hệ thống.
            <span className="font-medium"> Cài đặt được lưu vào database và đồng bộ trên tất cả thiết bị.</span>
          </p>
        </div>

        {/* General Deposit Setting */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Bật/Tắt Đặt cọc</h5>
                <p className="text-sm text-gray-500">
                  {paymentSettings.enableDeposit 
                    ? 'Hệ thống đang yêu cầu đặt cọc khi đặt lịch' 
                    : 'Hệ thống đang không yêu cầu đặt cọc'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ToggleSwitch
                id="enableDeposit"
                checked={paymentSettings.enableDeposit}
                onChange={(e) => handleToggleChange('enableDeposit', e.target.checked)}
                color="green"
              />
              <span className="text-sm font-medium text-gray-700">
                {paymentSettings.enableDeposit ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>
          </div>
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
                  onChange={(e) => handleToggleChange('enableMomo', e.target.checked)}
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
                  id="enableVnPay"
                  checked={paymentSettings.enableVnPay}
                  onChange={(e) => handleToggleChange('enableVnPay', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">
                  {paymentSettings.enableVnPay ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
            </div>
            <div className={`space-y-3 ${!paymentSettings.enableVnPay ? 'opacity-50' : ''}`}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  TMN Code
                </label>
                <input
                  type="text"
                  disabled={!paymentSettings.enableVnPay}
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
                  disabled={!paymentSettings.enableVnPay}
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
            disabled={!paymentSettings.enableMomo && !paymentSettings.enableVnPay}
          >
            <option value="momo" disabled={!paymentSettings.enableMomo}>
              MoMo {!paymentSettings.enableMomo ? '(Đã tắt)' : ''}
            </option>
            <option value="vnpay" disabled={!paymentSettings.enableVnPay}>
              VNPay {!paymentSettings.enableVnPay ? '(Đã tắt)' : ''}
            </option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {(!paymentSettings.enableMomo && !paymentSettings.enableVnPay) ? 
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
                  paymentSettings.enableVnPay && 'VNPay'
                ].filter(Boolean).join(', ') || 'Không có'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tổng số phương thức:</span>
              <span className="font-medium">
                {(paymentSettings.enableMomo ? 1 : 0) + (paymentSettings.enableVnPay ? 1 : 0)} / 2
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Tiền đặt cọc:</span>
              <span className="font-medium text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentSettings.depositAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Lưu trữ dữ liệu:</span>
              <span className="font-medium text-green-600">Database</span>
            </div>
            {(!paymentSettings.enableMomo && !paymentSettings.enableVnPay) && (
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