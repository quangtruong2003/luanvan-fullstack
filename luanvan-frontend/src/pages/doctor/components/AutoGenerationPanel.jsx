import React, { useState, useMemo } from 'react';
import {
  Zap, Calendar, Clock, Settings, PlayCircle,
  RefreshCw, AlertCircle, CheckCircle, Building,
  Users, Power, Activity
} from 'lucide-react';

const AutoGenerationPanel = ({
  workShifts = [],
  selectedSpecialty,
  specialties = [],
  onGenerate,
  loading = false,
  lastGenerated = null
}) => {
  const [settings, setSettings] = useState({
    daysAhead: 7,
    includeWeekends: true,
    slotDuration: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    })()
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get current specialty info
  const currentSpecialty = useMemo(() => {
    return specialties.find(s => s.specialty_id === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  // Calculate preview info
  const generationPreview = useMemo(() => {
    if (!workShifts || workShifts.length === 0) {
      return { totalSlots: 0, dailySlots: 0, shifts: [] };
    }

    const slotsPerShift = workShifts.map(shift => {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      const durationMs = end - start;
      const slotCount = Math.floor(durationMs / (settings.slotDuration * 60 * 1000));
      
      return {
        ...shift,
        slotCount,
        timeRange: `${shift.start_time} - ${shift.end_time}`
      };
    });

    const dailySlots = slotsPerShift.reduce((sum, shift) => sum + shift.slotCount, 0);
    const totalDays = Math.ceil((new Date(settings.endDate) - new Date(settings.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const totalSlots = dailySlots * totalDays;

    return {
      totalSlots,
      dailySlots,
      totalDays,
      shifts: slotsPerShift
    };
  }, [workShifts, settings]);

  // Handle generate
  const handleGenerate = async () => {
    if (!selectedSpecialty || !currentSpecialty) {
      alert('Vui lòng chọn chuyên khoa.');
      return;
    }

    // Handle different clinic ID field names
    const clinicId = currentSpecialty.clinic?.clinic_id;

    if (!clinicId) {
      alert('Chuyên khoa này chưa được phân công phòng khám. Vui lòng liên hệ admin.');
      return;
    }

    try {
      await onGenerate(selectedSpecialty, clinicId, {
        startDate: settings.startDate,
        endDate: settings.endDate,
        slotDuration: settings.slotDuration,
        includeWeekends: settings.includeWeekends
      });
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Có lỗi xảy ra khi tạo slots. Vui lòng thử lại.');
    }
  };

  // Quick presets
  const quickPresets = [
    { name: '1 tuần', days: 7 },
    { name: '2 tuần', days: 14 },
    { name: '1 tháng', days: 30 }
  ];

  const applyQuickPreset = (days) => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    setSettings(prev => ({
      ...prev,
      daysAhead: days,
      startDate,
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Tự động tạo lịch làm việc</h3>
              <p className="text-green-100">
                Tạo slots dựa trên ca làm việc của phòng khám
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Tùy chỉnh</span>
          </button>
        </div>
      </div>

      {/* Current Specialty Info */}
      {currentSpecialty ? (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {currentSpecialty.name || 'Chưa có tên'}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Building className="w-4 h-4" />
                  <span>
                    {currentSpecialty.clinic?.name || 'Chưa có phòng khám'}
                  </span>
                </div>
              </div>
            </div>
            
            {lastGenerated && (
              <div className="text-right text-sm text-blue-600">
                <div className="font-medium">Lần tạo cuối:</div>
                <div>{new Date(lastGenerated).toLocaleString('vi-VN')}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-amber-900">Chưa chọn chuyên khoa</h4>
              <p className="text-sm text-amber-700">
                Vui lòng chọn chuyên khoa ở phần trên để xem ca làm việc và tạo lịch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Work Shifts Preview */}
      {workShifts.length > 0 ? (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Ca làm việc hiện tại ({workShifts.length} ca)
          </h4>
          <div className="grid gap-2">
            {generationPreview.shifts.map((shift, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{shift.shift_name}</span>
                    <div className="text-sm text-gray-600">{shift.timeRange}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {shift.slotCount} slots/ngày
                    </div>
                    <div className="text-xs text-gray-500">
                      (mỗi {settings.slotDuration} phút)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">
              {!selectedSpecialty ? 'Chưa chọn chuyên khoa' : 'Chưa có ca làm việc'}
            </h4>
            <p className="text-gray-600 text-sm">
              {!selectedSpecialty 
                ? 'Vui lòng chọn chuyên khoa ở tab bên trên để tiếp tục.' 
                : 'Phòng khám chưa thiết lập ca làm việc. Vui lòng liên hệ admin để cấu hình.'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Tạo nhanh</h4>
        <div className="flex space-x-2">
          {quickPresets.map((preset) => (
            <button
              key={preset.days}
              onClick={() => applyQuickPreset(preset.days)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Cài đặt nâng cao</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng slot (phút)
              </label>
              <select
                value={settings.slotDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
              </select>
            </div>
            
            {/* Include Weekends */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeWeekends"
                checked={settings.includeWeekends}
                onChange={(e) => setSettings(prev => ({ ...prev, includeWeekends: e.target.checked }))}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeWeekends" className="text-sm font-medium text-gray-700">
                Bao gồm cuối tuần
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Generation Preview */}
      {generationPreview.totalSlots > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Xem trước kết quả</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{generationPreview.totalDays}</div>
              <div className="text-sm text-blue-700">Ngày</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{generationPreview.dailySlots}</div>
              <div className="text-sm text-green-700">Slots/ngày</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">{generationPreview.totalSlots}</div>
              <div className="text-sm text-purple-700">Tổng slots</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedSpecialty || generationPreview.totalSlots === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tạo slots...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>Tạo {generationPreview.totalSlots} slots</span>
            </>
          )}
        </button>
        
        {!selectedSpecialty && (
          <p className="text-center text-sm text-red-600 mt-2">
            Vui lòng chọn chuyên khoa trước khi tạo slots
          </p>
        )}
        
        {selectedSpecialty && generationPreview.totalSlots === 0 && (
          <p className="text-center text-sm text-amber-600 mt-2">
            Không có ca làm việc để tạo slots. Vui lòng liên hệ admin.
          </p>
        )}
      </div>
    </div>
  );
};

export default AutoGenerationPanel; 