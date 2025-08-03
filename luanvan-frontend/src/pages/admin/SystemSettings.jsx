import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, Mail, Shield, 
  Bell, AlertCircle, CheckCircle
} from 'lucide-react';
import { adminService } from '../../services/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Hệ thống Quản lý Phòng khám',
      systemDescription: 'Hệ thống quản lý lịch hẹn và khám bệnh trực tuyến',
      maintenanceMode: false,
      maxAppointmentsPerDay: 50,
      appointmentDuration: 30,
      workingStartTime: '08:00',
      workingEndTime: '20:00',
      minimumAdvanceBookingDays: 1
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      emailFrom: '',
      enableEmailNotifications: true
    },
    notifications: {
      enableSMS: false,
      enablePushNotifications: true,
      appointmentReminder: true,
      reminderTimeBefore: 24,
      enableAppointmentConfirmation: true
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordMinLength: 8,
      requireSpecialCharacters: true,
      enableTwoFactor: false
    }
  });

  // Fetch system configuration from database
  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemConfig();
      
      if (response) {
        console.log('📂 Raw system config from database:', response);
        
        // Map database fields to UI settings
        setSettings(prev => ({
          ...prev,
          general: {
            ...prev.general,
            // Convert hours to days for UI display
            minimumAdvanceBookingDays: Math.floor((response.patient_cancellation_time_limit_hours || 24) / 24)
          }
        }));
        
        console.log('📂 System config loaded and mapped to UI:', {
          database_hours: response.patient_cancellation_time_limit_hours,
          ui_days: Math.floor((response.patient_cancellation_time_limit_hours || 24) / 24)
        });
        
        // Load other settings from localStorage for immediate sync
        loadSettingsFromLocalStorage();
      }
    } catch (error) {
      console.warn('Failed to load system config from database, using defaults:', error);
      // Fallback to localStorage if database fails
      loadSettingsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to load from localStorage
  const loadSettingsFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Only merge non-database settings, keeping database values for minimumAdvanceBookingDays
        setSettings(prev => ({
          ...parsedSettings,
          general: {
            ...parsedSettings.general,
            // Keep database value for minimumAdvanceBookingDays if it exists
            minimumAdvanceBookingDays: prev.general.minimumAdvanceBookingDays
          }
        }));
        console.log('📂 Settings loaded from localStorage (merged with database):', parsedSettings);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  };

  useEffect(() => {
    fetchSystemConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for database - convert days to hours
      const configData = {
        patient_cancellation_time_limit_hours: settings.general.minimumAdvanceBookingDays * 24
      };
      
      console.log('💾 Preparing to save config:', {
        ui_days: settings.general.minimumAdvanceBookingDays,
        database_hours: configData.patient_cancellation_time_limit_hours,
        configData
      });
      
      // Save to database
      await adminService.updateSystemConfig(configData);
      console.log('💾 System config saved to database:', configData);
      
      // Also save to localStorage for immediate UI updates (other settings not in DB)
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      console.log('💾 Settings also saved to localStorage for UI sync:', settings);
      
      setMessage({ 
        type: 'success', 
        content: 'Cài đặt đã được lưu thành công! "Đặt trước tối thiểu" được lưu vào database, các cài đặt khác lưu tạm thời.' 
      });
      
      // Refresh data from database to confirm save
      setTimeout(async () => {
        try {
          const response = await adminService.getSystemConfig();
          console.log('🔄 Refreshed config from database:', response);
        } catch (error) {
          console.warn('Could not refresh config:', error);
        }
      }, 1000);
      
      // Auto hide message after 5 seconds (longer message)
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error saving system config:', error);
      setMessage({ type: 'error', content: 'Lỗi khi lưu cài đặt: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Chung', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'security', name: 'Bảo mật', icon: Shield }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên hệ thống
        </label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả hệ thống
        </label>
        <textarea
          rows="3"
          value={settings.general.systemDescription}
          onChange={(e) => handleInputChange('general', 'systemDescription', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Đặt trước tối thiểu (ngày)
        </label>
        <input
          type="number"
          min="0"
          value={settings.general.minimumAdvanceBookingDays}
          onChange={(e) => handleInputChange('general', 'minimumAdvanceBookingDays', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Số ngày tối thiểu người dùng phải đặt lịch trước (0 = đặt cùng ngày)
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
          Bật chế độ bảo trì
        </label>
      </div>

      {/* General Settings Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h6 className="font-medium text-gray-900 mb-3">Tóm tắt cài đặt chung</h6>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-600">
              {settings.general.minimumAdvanceBookingDays === 0 ? 'Cùng ngày' : `${settings.general.minimumAdvanceBookingDays} ngày`}
            </div>
            <div className="text-xs text-gray-600">Đặt trước tối thiểu</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-600">{settings.general.maintenanceMode ? 'BẢO TRÌ' : 'HOẠT ĐỘNG'}</div>
            <div className="text-xs text-gray-600">Trạng thái hệ thống</div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded border">
          <div className="flex items-center text-sm">
            <span className="text-blue-700">
              <strong>Quy định đặt lịch:</strong> 
              {settings.general.minimumAdvanceBookingDays === 0 
                ? ' Người dùng có thể đặt lịch cùng ngày.'
                : ` Người dùng phải đặt lịch trước ít nhất ${settings.general.minimumAdvanceBookingDays} ngày.`
              }
            </span>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-green-50 rounded border">
          <div className="flex items-center text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700">
              <strong>Trạng thái lưu trữ:</strong> "Đặt trước tối thiểu" được lưu vào database. 
              Các cài đặt khác lưu tạm thời trong trình duyệt.
            </span>
          </div>
        </div>
      </div>
    </div>
  );



  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'email':
        return <div className="text-center py-12 text-gray-500">Cài đặt Email đang được phát triển...</div>;
      case 'notifications':
        return <div className="text-center py-12 text-gray-500">Cài đặt Thông báo đang được phát triển...</div>;
      case 'security':
        return <div className="text-center py-12 text-gray-500">Cài đặt Bảo mật đang được phát triển...</div>;
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Cài đặt Hệ thống</h2>
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
          <div className={`mb-4 p-4 rounded-lg flex items-center ${
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Payment Settings Note */}
        {/* {activeTab === 'general' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h6 className="font-medium text-blue-900">Thông báo</h6>
                <p className="text-sm text-blue-700 mt-1">
                  Cài đặt thanh toán đã được di chuyển sang tab <strong>"Thanh toán"</strong> riêng biệt để quản lý dễ dàng hơn.
                </p>
              </div>
            </div>
          </div>
        )} */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SystemSettings; 