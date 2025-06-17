import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap, Calendar, Clock, Settings, PlayCircle,
  RefreshCw, AlertCircle, CheckCircle, Building,
  Activity, Info
} from 'lucide-react';

const AutoGenerationPanel = ({
  workShifts = [],
  selectedSpecialty,
  specialties = [],
  onGenerate,
  loading = false
}) => {
  const [settings, setSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    })(),
    slotDuration: 30,
    overwrite: false,
  });

  useEffect(() => {
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    if (start > end) {
      const newEndDate = new Date(start);
      newEndDate.setDate(start.getDate() + 7);
      setSettings(prev => ({ ...prev, endDate: newEndDate.toISOString().split('T')[0] }));
    }
  }, [settings.startDate]);

  const currentSpecialty = useMemo(() => {
    if (!selectedSpecialty) return null;
    return specialties.find(s => (s.specialty_id || s.specialtyId) === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  const daysOfWeekJava = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const generationPreview = useMemo(() => {
    if (!workShifts || workShifts.length === 0) {
      return { totalSlots: 0, dailySlots: 0, shifts: [], totalDays: 0 };
    }

    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    if (start > end) return { totalSlots: 0, dailySlots: 0, shifts: [], totalDays: 0 };

    let totalSlots = 0;
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let tempDate = new Date(start);
    for (let i = 0; i < totalDays; i++) {
        const dayOfWeekJs = tempDate.getDay();
        const dayOfWeekJava = dayOfWeekJs === 0 ? 'SUNDAY' : daysOfWeekJava[dayOfWeekJs - 1];

        const dayShifts = workShifts.filter(shift => shift.dayOfWeek === dayOfWeekJava);

        dayShifts.forEach(shift => {
            const shiftStart = new Date(`1970-01-01T${shift.startTime}`);
            const shiftEnd = new Date(`1970-01-01T${shift.endTime}`);
            const durationMs = shiftEnd - shiftStart;
            const slotCount = Math.floor(durationMs / (settings.slotDuration * 60 * 1000));
            totalSlots += slotCount;
        });
        tempDate.setDate(tempDate.getDate() + 1);
    }
    
    return {
      totalSlots,
      totalDays,
    };
  }, [workShifts, settings.startDate, settings.endDate, settings.slotDuration]);
  
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

    await onGenerate(selectedSpecialty, clinicId, settings);
  };

  const applyQuickPreset = (days) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days - 1);
    
    setSettings(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

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
        <div className="p-4 bg-blue-50 border-y border-blue-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">{currentSpecialty.name}</h4>
              <div className="text-sm text-blue-700 flex items-center">
                <Building className="w-3 h-3 mr-1" />
                <span>{currentSpecialty.clinic?.name}</span>
              </div>
            </div>
          </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng slot (phút)</label>
          <select
            value={settings.slotDuration}
            onChange={(e) => setSettings(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value={15}>15 phút</option>
            <option value={30}>30 phút (Mặc định)</option>
            <option value={45}>45 phút</option>
            <option value={60}>60 phút</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.overwrite}
              onChange={(e) => setSettings(prev => ({ ...prev, overwrite: e.target.checked }))}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Ghi đè lịch hiện tại</span>
            <Info className="w-3 h-3 text-gray-400 ml-1" />
          </label>
        </div>

        {generationPreview.totalDays > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-center">
            <p className="font-semibold">Dự kiến tạo khoảng <span className="text-xl">{generationPreview.totalSlots}</span> slots</p>
            <p className="text-xs">trong {generationPreview.totalDays} ngày</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedSpecialty || !workShifts.length}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tạo...</span>
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