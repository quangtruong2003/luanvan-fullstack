import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap, Calendar, Clock, Settings, PlayCircle,
  RefreshCw, AlertCircle, CheckCircle, Building,
  Activity, Info
} from 'lucide-react';
import { formatDateToYYYYMMDD, createLocalDate } from '../../../utils/dateUtils';

const daysOfWeekJava = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const AutoGenerationPanel = ({
  workShifts = [],
  selectedSpecialty,
  specialties = [],
  onGenerate,
  loading = false,
  loadingWorkShifts = false
}) => {
  const [settings, setSettings] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return formatDateToYYYYMMDD(date);
    })(),
    workShiftFilter: 'all', // 'all', 'morning', 'afternoon'
  });

  useEffect(() => {
    const start = createLocalDate(settings.startDate);
    const end = createLocalDate(settings.endDate);
    if (start > end) {
      const newEndDate = new Date(start);
      newEndDate.setDate(start.getDate() + 7);
      setSettings(prev => ({ ...prev, endDate: formatDateToYYYYMMDD(newEndDate) }));
    }
  }, [settings.startDate, settings.endDate]);

  const currentSpecialty = useMemo(() => {
    if (!selectedSpecialty) return null;
    return specialties.find(s => (s.specialty_id || s.specialtyId) === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  // Lọc ca làm việc theo lựa chọn
  const filteredWorkShifts = useMemo(() => {
    if (!workShifts || workShifts.length === 0) return [];
    
    if (settings.workShiftFilter === 'all') {
      return workShifts;
    }
    
    return workShifts.filter(shift => {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      
      if (settings.workShiftFilter === 'morning') {
        return startHour < 12; // Ca sáng: trước 12h
      } else if (settings.workShiftFilter === 'afternoon') {
        return startHour >= 12; // Ca chiều: từ 12h trở đi
      }
      
      return true;
    });
  }, [workShifts, settings.workShiftFilter]);

  const generationPreview = useMemo(() => {
    if (!filteredWorkShifts || filteredWorkShifts.length === 0) {
      return { totalSlots: 0, dailySlots: 0, shifts: [], totalDays: 0 };
    }

    const start = createLocalDate(settings.startDate);
    const end = createLocalDate(settings.endDate);
    if (start > end) return { totalSlots: 0, dailySlots: 0, shifts: [], totalDays: 0 };

    let totalSlots = 0;
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let tempDate = new Date(start);
    for (let i = 0; i < totalDays; i++) {
        const dayOfWeekJs = tempDate.getDay();
        const dayOfWeekJava = dayOfWeekJs === 0 ? 'SUNDAY' : daysOfWeekJava[dayOfWeekJs - 1];

        const dayShifts = filteredWorkShifts.filter(shift => shift.dayOfWeek === dayOfWeekJava);

        dayShifts.forEach(shift => {
            const shiftStart = new Date(`1970-01-01T${shift.startTime}`);
            const shiftEnd = new Date(`1970-01-01T${shift.endTime}`);
            const durationMs = shiftEnd - shiftStart;
            // Sử dụng 30 phút mặc định (do admin quản lý)
            const slotCount = Math.floor(durationMs / (30 * 60 * 1000));
            totalSlots += slotCount;
        });
        tempDate.setDate(tempDate.getDate() + 1);
    }
    
    return {
      totalSlots,
      totalDays,
    };
  }, [filteredWorkShifts, settings.startDate, settings.endDate]);
  
  const handleGenerate = async () => {
    if (!selectedSpecialty || !currentSpecialty) {
      alert('Vui lòng chọn chuyên khoa.');
      return;
    }

    const clinicId = currentSpecialty.clinic?.clinic_id || currentSpecialty.clinic?.clinicId;

    if (!clinicId) {
      alert('Chuyên khoa này chưa được phân công phòng khám.');
      return;
    }

    // Kiểm tra workShifts
    if (!workShifts || workShifts.length === 0) {
      alert('Không tìm thấy ca làm việc cho chuyên khoa này. Vui lòng liên hệ admin để thiết lập ca làm việc.');
      return;
    }

    // Note: Không cần kiểm tra filteredWorkShifts nữa vì các button đã được disable

    // Thêm thông tin lọc ca làm việc vào settings
    const generationSettings = {
      ...settings,
      workShiftFilter: settings.workShiftFilter,
      slotDuration: 30 // Mặc định 30 phút do admin quản lý
    };

    await onGenerate(generationSettings);
  };

  const applyQuickPreset = (days) => {
    const startDate = new Date();
    const endDate = new Date();
    // Sửa logic: nếu chọn 7 ngày thì từ hôm nay + 6 ngày nữa = 7 ngày
    endDate.setDate(startDate.getDate() + days - 1);
    
    setSettings(prev => ({
      ...prev,
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }));
  };

  const getShiftFilterInfo = () => {
    if (!workShifts || workShifts.length === 0) {
      return {
        total: 0,
        morning: 0,
        afternoon: 0
      };
    }
    
    const morningShifts = workShifts.filter(shift => parseInt(shift.startTime.split(':')[0]) < 12);
    const afternoonShifts = workShifts.filter(shift => parseInt(shift.startTime.split(':')[0]) >= 12);
    
    return {
      total: workShifts.length,
      morning: morningShifts.length,
      afternoon: afternoonShifts.length
    };
  };

  const shiftInfo = getShiftFilterInfo();

  // Auto-reset filter if selected filter has no shifts
  useEffect(() => {
    if (settings.workShiftFilter === 'morning' && shiftInfo.morning === 0) {
      setSettings(prev => ({ ...prev, workShiftFilter: 'all' }));
    } else if (settings.workShiftFilter === 'afternoon' && shiftInfo.afternoon === 0) {
      setSettings(prev => ({ ...prev, workShiftFilter: 'all' }));
    }
  }, [settings.workShiftFilter, shiftInfo.morning, shiftInfo.afternoon]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-900 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tạo lịch tự động</h3>
            <p className="text-sm text-emerald-700">Dựa trên ca làm việc của phòng khám</p>
          </div>
        </div>
      </div>
      
      {currentSpecialty ? (
        <div className="p-4 bg-blue-50 border-y border-blue-200 space-y-3">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{currentSpecialty.name}</h4>
              <div className="text-sm text-blue-700 flex items-center">
                <Building className="w-3 h-3 mr-1" />
                <span>{currentSpecialty.clinic?.name}</span>
              </div>
              {currentSpecialty.clinic?.address && (
                <div className="text-xs text-blue-600 mt-1">
                  📍 {currentSpecialty.clinic.address}
                </div>
              )}
            </div>
          </div>
          
          {/* Hiển thị lịch làm việc */}
          {workShifts.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-xs font-medium text-blue-800 mb-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Lịch làm việc phòng khám ({workShifts.length} ca)
              </div>
              <div className="grid grid-cols-1 gap-1">
                {workShifts.slice(0, 5).map((shift, index) => (
                  <div key={index} className="text-xs text-blue-700 flex justify-between">
                    <span className="font-medium">{shift.dayOfWeek === 'MONDAY' ? 'Thứ 2' :
                                                   shift.dayOfWeek === 'TUESDAY' ? 'Thứ 3' :
                                                   shift.dayOfWeek === 'WEDNESDAY' ? 'Thứ 4' :
                                                   shift.dayOfWeek === 'THURSDAY' ? 'Thứ 5' :
                                                   shift.dayOfWeek === 'FRIDAY' ? 'Thứ 6' :
                                                   shift.dayOfWeek === 'SATURDAY' ? 'Thứ 7' :
                                                   shift.dayOfWeek === 'SUNDAY' ? 'CN' : shift.dayOfWeek}</span>
                    <span>{shift.startTime} - {shift.endTime}</span>
                  </div>
                ))}
                {workShifts.length > 5 && (
                  <div className="text-xs text-blue-600 italic">
                    ... và {workShifts.length - 5} ca khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border-y border-amber-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800 font-medium">Chọn một chuyên khoa để bắt đầu</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2 text-sm">Khoảng thời gian</h4>
          <div className="flex space-x-2">
            <button onClick={() => applyQuickPreset(7)} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">7 ngày</button>
            <button onClick={() => applyQuickPreset(14)} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">14 ngày</button>
            <button onClick={() => applyQuickPreset(30)} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">30 ngày</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={settings.endDate}
              min={settings.startDate}
              onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ca làm việc</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSettings(prev => ({ ...prev, workShiftFilter: 'all' }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.workShiftFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cả ngày
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, workShiftFilter: 'morning' }))}
              disabled={shiftInfo.morning === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.workShiftFilter === 'morning' 
                  ? 'bg-orange-500 text-white' 
                  : shiftInfo.morning === 0
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={shiftInfo.morning === 0 ? 'Không có ca sáng' : 'Chọn ca sáng'}
            >
              Ca sáng
              {shiftInfo.morning === 0 && <span className="ml-1 text-xs">✗</span>}
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, workShiftFilter: 'afternoon' }))}
              disabled={shiftInfo.afternoon === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.workShiftFilter === 'afternoon' 
                  ? 'bg-indigo-600 text-white' 
                  : shiftInfo.afternoon === 0
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={shiftInfo.afternoon === 0 ? 'Không có ca chiều' : 'Chọn ca chiều'}
            >
              Ca chiều
              {shiftInfo.afternoon === 0 && <span className="ml-1 text-xs">✗</span>}
            </button>
          </div>
          
          {/* Hiển thị thông tin ca làm việc */}
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>Tổng ca: {shiftInfo.total}</span>
              <span>Ca sáng: {shiftInfo.morning}</span>
              <span>Ca chiều: {shiftInfo.afternoon}</span>
            </div>
            <div className="mt-1">
              <span className="font-medium">Đang chọn: </span>
              {settings.workShiftFilter === 'all' && `Tất cả ${shiftInfo.total} ca`}
              {settings.workShiftFilter === 'morning' && `${shiftInfo.morning} ca sáng (trước 12h)`}
              {settings.workShiftFilter === 'afternoon' && `${shiftInfo.afternoon} ca chiều (từ 12h)`}
            </div>
          </div>
        </div>



        {loadingWorkShifts ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 p-3 rounded-lg text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <p className="text-sm">Đang tải ca làm việc...</p>
          </div>
        ) : workShifts.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-center">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            <p className="text-sm font-medium">Chưa có ca làm việc</p>
            <p className="text-xs">Vui lòng liên hệ admin để thiết lập ca làm việc cho chuyên khoa này</p>
          </div>
        ) : generationPreview.totalDays > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-center">
            <p className="font-semibold">Dự kiến tạo khoảng <span className="text-xl">{generationPreview.totalSlots}</span> slots</p>
            <p className="text-xs">trong {generationPreview.totalDays} ngày</p>
            <p className="text-xs mt-1">
              {settings.workShiftFilter === 'all' && 'Từ tất cả ca làm việc'}
              {settings.workShiftFilter === 'morning' && 'Chỉ từ ca sáng'}
              {settings.workShiftFilter === 'afternoon' && 'Chỉ từ ca chiều'}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedSpecialty || loadingWorkShifts}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tạo...</span>
            </>
          ) : loadingWorkShifts ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tải ca làm việc...</span>
            </>
          ) : !selectedSpecialty ? (
            <>
              <AlertCircle className="w-5 h-5" />
              <span>Chọn chuyên khoa</span>
            </>
          ) : workShifts.length === 0 ? (
            <>
              <AlertCircle className="w-5 h-5" />
              <span>Chưa có ca làm việc</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>Tạo lịch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AutoGenerationPanel; 