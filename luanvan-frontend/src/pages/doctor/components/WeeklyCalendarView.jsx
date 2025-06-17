import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calendar, Clock, Power, PowerOff, User,
  ChevronLeft, ChevronRight, Plus, Check, RotateCw, X
} from 'lucide-react';
import { useNotification } from '../../../components/NotificationSystem';

const WeeklyCalendarView = ({ 
  slots = [], 
  workShifts = [], 
  selectedSpecialty,
  onSlotToggle,
  onBulkToggle, // This can be used for bulk enabling/disabling
  loading = false,
  specialties = [],
  onCreateNewSlot,
  refetchData
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const { showInfo } = useNotification();

  const weekDates = useMemo(() => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  const timeSlots = useMemo(() => {
    const slotsSet = new Set();
    if (workShifts && workShifts.length > 0) {
      workShifts.forEach(shift => {
        const start = new Date(`1970-01-01T${shift.startTime}`);
        const end = new Date(`1970-01-01T${shift.endTime}`);
        let current = start;
        while (current < end) {
          slotsSet.add(current.toTimeString().substring(0, 5));
          current.setMinutes(current.getMinutes() + 30);
        }
      });
    } else {
      for (let hour = 7; hour < 22; hour++) {
        slotsSet.add(`${String(hour).padStart(2, '0')}:00`);
        slotsSet.add(`${String(hour).padStart(2, '0')}:30`);
      }
    }
    return Array.from(slotsSet).sort();
  }, [workShifts]);

  const slotsByDateTime = useMemo(() => {
    const grouped = {};
    if (!slots) return grouped;
    slots.forEach(slot => {
      const dateKey = slot.date;
      if (!dateKey || !slot.startTime) return;
      const timeKey = slot.startTime.substring(0, 5);
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      grouped[dateKey][timeKey] = slot;
    });
    return grouped;
  }, [slots]);

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const handleSlotClick = (date, time, currentSlot) => {
    if (loading) return;
    
    if (currentSlot) {
      onSlotToggle(currentSlot.slotId || currentSlot.slot_id, currentSlot.status, `${date.toISOString().split('T')[0]}T${time}`);
    } else if (onCreateNewSlot && canCreateNewSlot(date, time)) {
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      const endDate = new Date(date);
      endDate.setHours(hours, minutes + 30);
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      onCreateNewSlot({
        date: date.toISOString().split('T')[0],
        startTime: startTime,
        endTime: endTime
      });
    }
  };

  const handleSlotSelection = (slotId, e) => {
    if (e.shiftKey) {
      showInfo('Chức năng chọn hàng loạt đang được phát triển.');
    } else {
      const newSelected = new Set(selectedSlots);
      if (newSelected.has(slotId)) {
        newSelected.delete(slotId);
      } else {
        newSelected.add(slotId);
      }
      setSelectedSlots(newSelected);
    }
  };

  const isPast = (date, time) => {
    const today = new Date();
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    slotDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return slotDateTime < today;
  };

  const currentSpecialtyInfo = useMemo(() => {
    return specialties.find(s => (s.specialtyId || s.specialty_id) === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  const canCreateNewSlot = useCallback((date, time) => {
    if (!currentSpecialtyInfo) return false;
    return !isPast(date, time);
  }, [currentSpecialtyInfo]);

  const getDayLabel = (date) => ({
    day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
    date: date.getDate(),
    isToday: date.toDateString() === new Date().toDateString()
  });

  if (!selectedSpecialty) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center min-h-[500px] flex flex-col justify-center items-center">
        <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">Chọn một chuyên khoa</h3>
        <p className="text-gray-500 mt-2 max-w-sm">
          Vui lòng chọn một chuyên khoa từ thanh bên trên để xem và quản lý lịch làm việc.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentWeek(new Date())} className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100">Hôm nay</button>
            <button onClick={() => navigateWeek(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="text-sm font-semibold text-gray-800 hidden sm:block">
            Tuần: {new Date(weekDates[0]).toLocaleDateString('vi-VN')} - {new Date(weekDates[6]).toLocaleDateString('vi-VN')}
          </div>
          <button onClick={refetchData} className="p-2 rounded-full hover:bg-gray-100" title="Tải lại lịch">
            <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-8 sticky top-0 bg-white z-10">
            <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-b bg-gray-50">Giờ</div>
            {weekDates.map(date => {
              const { day, date: dayNum, isToday } = getDayLabel(date);
              return (
                <div key={date.toISOString()} className={`p-2 text-center border-r border-b ${isToday ? 'bg-blue-50 text-blue-600' : 'bg-gray-50'}`}>
                  <div className="font-semibold text-xs">{day}</div>
                  <div className="text-sm">{dayNum}</div>
                </div>
              );
            })}
          </div>

          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8">
              <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-t bg-gray-50 flex items-center justify-center">{time}</div>
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const currentSlot = slotsByDateTime[dateStr]?.[time];
                const past = isPast(date, time);
                const canCreate = !past && !!currentSpecialtyInfo;
                const isSelected = selectedSlots.has(currentSlot?.slotId);

                let bgColor = 'bg-gray-50';
                let textColor = 'text-gray-400';
                let borderColor = 'border-gray-200';
                let hoverBgColor = 'hover:bg-gray-100';
                let content = <Plus className="w-4 h-4" />;
                let title = 'Click để tạo slot mới';
                let isDisabled = past || loading;

                if (currentSlot) {
                  switch (currentSlot.status) {
                    case 'AVAILABLE':
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-700';
                      borderColor = 'border-green-300';
                      hoverBgColor = 'hover:bg-green-200';
                      content = <Power className="w-4 h-4" />;
                      title = 'Slot có sẵn. Click để tắt.';
                      break;
                    case 'BOOKED':
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-700';
                      borderColor = 'border-blue-300';
                      hoverBgColor = ''; // No hover effect for booked slots
                      content = <User className="w-4 h-4" />;
                      title = `Đã đặt bởi: ${currentSlot.patient?.fullName || 'Bệnh nhân'}`;
                      isDisabled = true; // Cannot toggle booked slots directly
                      break;
                    case 'CANCELLED_BY_CLINIC':
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-700';
                      borderColor = 'border-red-300';
                      hoverBgColor = 'hover:bg-red-200';
                      content = <PowerOff className="w-4 h-4" />;
                      title = 'Slot đã bị tắt. Click để bật.';
                      break;
                    default:
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-500';
                      borderColor = 'border-gray-300';
                      hoverBgColor = '';
                      content = 'N/A';
                  }
                } else {
                  if (!canCreate) {
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-300';
                    borderColor = 'border-gray-100';
                    content = <div className="w-4 h-4" />;
                    title = 'Không thể tạo slot';
                    isDisabled = true;
                  } else {
                     title = 'Click để tạo slot mới';
                  }
                }

                if (past) {
                  bgColor = 'bg-gray-50';
                  textColor = 'text-gray-300';
                  borderColor = 'border-gray-100';
                  hoverBgColor = '';
                }

                return (
                  <div key={dateStr} className="p-1 border-r border-t h-12 flex items-center justify-center">
                    <button
                      title={title}
                      disabled={isDisabled}
                      onClick={() => handleSlotClick(date, time, currentSlot)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (currentSlot) handleSlotSelection(currentSlot.slotId || currentSlot.slot_id, e);
                      }}
                      className={`w-full h-full rounded-md border-2 transition-all duration-150 flex items-center justify-center
                        ${bgColor} ${textColor} ${borderColor} ${hoverBgColor}
                        ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {content}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></div><span className="text-xs">Có thể đặt</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300"></div><span className="text-xs">Đã đặt</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-red-100 border-red-300"></div><span className="text-xs">Đã tắt</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-gray-100 border-gray-200 border-dashed"></div><span className="text-xs">Chưa tạo</span></div>
          </div>
          
          {selectedSlots.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{selectedSlots.size} slot đã chọn</span>
              <button onClick={() => onBulkToggle('enable', Array.from(selectedSlots))} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Bật</button>
              <button onClick={() => onBulkToggle('disable', Array.from(selectedSlots))} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Tắt</button>
              <button onClick={() => setSelectedSlots(new Set())} className="p-1 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="flex items-center space-x-3">
            <RotateCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-700">Đang cập nhật lịch...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarView; 