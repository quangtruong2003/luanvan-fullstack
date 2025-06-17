import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calendar, Clock, Power, PowerOff, Eye, EyeOff,
  ChevronLeft, ChevronRight, RotateCcw, Zap,
  AlertCircle, CheckCircle, Building, Plus
} from 'lucide-react';
import { useNotification } from '../../../components/NotificationSystem';

const WeeklyCalendarView = ({ 
  slots = [], 
  workShifts = [], 
  selectedSpecialty,
  onSlotToggle,
  onBulkToggle,
  loading = false,
  specialties = [],
  onCreateNewSlot
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const { showWarning } = useNotification();

  // Tính toán tuần hiện tại
  const weekDates = useMemo(() => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh để Thứ 2 là ngày đầu tuần
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  // Lấy specialty hiện tại
  const currentSpecialty = useMemo(() => {
    return specialties.find(s => s.specialty_id === selectedSpecialty);
  }, [specialties, selectedSpecialty]);

  // Tạo time slots từ work shifts
  const timeSlots = useMemo(() => {
    // Tạo Set để lưu các time slots duy nhất
    const slotsSet = new Set();
    
    if (workShifts && workShifts.length > 0) {
      // Sử dụng workShifts để tạo slots
      workShifts.forEach(shift => {
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        
        const current = new Date(start);
        while (current < end) {
          const timeStr = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
          slotsSet.add(timeStr);
          current.setMinutes(current.getMinutes() + 30);
        }
      });
    } else {
      // Default time slots nếu không có work shifts
      for (let hour = 8; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slotsSet.add(timeStr);
        }
      }
    }
    
    // Chuyển thành mảng và sắp xếp
    return Array.from(slotsSet).sort();
  }, [workShifts]);

  // Group slots by date and time
  const slotsByDateTime = useMemo(() => {
    const grouped = {};
    slots.forEach(slot => {
      // Chuẩn hóa định dạng ngày từ database
      const dateKey = slot.date; // Database lưu dưới dạng "YYYY-MM-DD"
      
      // Chuẩn hóa định dạng thời gian từ database
      // Database có thể lưu dưới dạng "HH:mm:ss" hoặc "HH:mm:ss.SSSSSS"
      const timeKey = slot.start_time.split('.')[0]; // Lấy phần "HH:mm:ss" 
      
      if (!grouped[dateKey]) grouped[dateKey] = {};
      grouped[dateKey][timeKey] = slot;
    });
    return grouped;
  }, [slots]);

  // Điều hướng tuần
  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  // Toggle slot - Đã tối ưu để tạo mới slot khi click vào slot chưa tồn tại
  const handleSlotToggle = async (date, time, currentSlot) => {
    if (loading) return;

    const dateStr = date.toISOString().split('T')[0];
    
    if (currentSlot) {
      // Slot đã tồn tại, toggle status
      await onSlotToggle(
        currentSlot.slot_id, 
        currentSlot.status, 
        `${dateStr} ${time}`,
        currentSpecialty?.name,
        currentSpecialty?.clinic?.name
      );
    } else if (currentSpecialty && onCreateNewSlot) {
      // Kiểm tra xem slot đã tồn tại chưa trong toàn bộ availabilitySlots
      const existingSlot = slots.find(slot => 
        slot.date === dateStr && 
        slot.start_time === time &&
        slot.specialty?.specialty_id === selectedSpecialty
      );

      if (existingSlot) {
        showWarning('Slot đã tồn tại cho chuyên khoa này', 'Không thể tạo mới');
        return;
      }

      // Slot chưa tồn tại, tạo mới
      const [hours, minutes] = time.split(':');
      const startTime = time;
      
      // Tính thời gian kết thúc (mặc định +30 phút)
      const endTimeDate = new Date(date);
      endTimeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10) + 30, 0, 0);
      const endTime = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;
      
      await onCreateNewSlot({
        date: dateStr,
        startTime,
        endTime,
        specialty_id: currentSpecialty.specialty_id,
        clinic_id: currentSpecialty.clinic?.clinic_id,
        status: 'AVAILABLE'
      });
    }
  };

  // Bulk operations
  const handleBulkToggle = async (action) => {
    if (selectedSlots.size === 0) return;
    
    const slotIds = Array.from(selectedSlots);
    await onBulkToggle(action, slotIds);
    setSelectedSlots(new Set());
  };

  // Select/deselect slot
  const toggleSlotSelection = (slotId) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  // Get slot status color
  const getSlotStatusColor = (slot) => {
    if (!slot) return 'bg-gray-100 text-gray-400 border-gray-200';
    
    switch (slot.status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CANCELLED_BY_CLINIC':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Format date
  const formatDate = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.getMonth() + 1
    };
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is past
  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Kiểm tra xem có thể tạo slot mới hay không
  const canCreateNewSlot = useCallback((date) => {
    if (!currentSpecialty) return false;
    if (isPast(date)) return false;
    return true;
  }, [currentSpecialty]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold">Lịch làm việc</h3>
              <p className="text-blue-100">
                {currentSpecialty ? 
                  `${currentSpecialty.name || 'Chưa có tên'} - ${currentSpecialty.clinic?.name || 'Chưa có phòng khám'}` : 
                  'Chọn chuyên khoa để xem lịch'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {viewMode === 'week' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-white/20 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setCurrentWeek(new Date())}
                className="px-3 py-2 hover:bg-white/20 rounded-md transition-colors text-sm font-medium"
              >
                Hôm nay
              </button>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-white/20 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Week range display */}
        <div className="text-center">
          <span className="text-lg font-semibold">
            {formatDate(weekDates[0]).date}/{formatDate(weekDates[0]).month} - {formatDate(weekDates[6]).date}/{formatDate(weekDates[6]).month}
          </span>
        </div>

        {/* Bulk operations */}
        {selectedSlots.size > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white/20 rounded-lg p-3">
            <span className="text-sm font-medium">
              Đã chọn {selectedSlots.size} slot
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkToggle('enable')}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs font-medium transition-colors"
              >
                <Power className="w-3 h-3 inline mr-1" />
                Bật tất cả
              </button>
              <button
                onClick={() => handleBulkToggle('disable')}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs font-medium transition-colors"
              >
                <PowerOff className="w-3 h-3 inline mr-1" />
                Tắt tất cả
              </button>
              <button
                onClick={() => setSelectedSlots(new Set())}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-xs font-medium transition-colors"
              >
                Hủy chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-auto max-h-96">
        <div className="min-w-full">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3 text-sm font-medium text-gray-600 border-r border-gray-200">
              Giờ
            </div>
            {weekDates.map((date, index) => {
              const dateInfo = formatDate(date);
              return (
                <div 
                  key={index}
                  className={`p-3 text-center border-r border-gray-200 ${
                    isToday(date) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
                  } ${isPast(date) ? 'opacity-60' : ''}`}
                >
                  <div className="text-xs font-medium">{dateInfo.day}</div>
                  <div className="text-sm">{dateInfo.date}/{dateInfo.month}</div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
              {/* Time label */}
              <div className="p-2 text-sm font-medium text-gray-600 border-r border-gray-200 bg-gray-50 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {timeSlot}
              </div>

              {/* Slots for each day */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const currentSlot = slotsByDateTime[dateStr]?.[timeSlot];
                const isSelected = currentSlot && selectedSlots.has(currentSlot.slot_id);
                const isPastDate = isPast(date);
                const canCreate = canCreateNewSlot(date);
                
                return (
                  <div 
                    key={dayIndex}
                    className="p-1 border-r border-gray-100 h-12 flex items-center justify-center"
                  >
                    <button
                      onClick={() => !isPastDate && handleSlotToggle(date, timeSlot, currentSlot)}
                      onDoubleClick={() => currentSlot && toggleSlotSelection(currentSlot.slot_id)}
                      disabled={loading || isPastDate}
                      className={`w-full h-full rounded-md border-2 transition-all duration-200 text-xs font-medium
                        ${getSlotStatusColor(currentSlot)}
                        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                        ${isPastDate ? 'opacity-50 cursor-not-allowed' : ''}
                        ${!currentSlot && !isPastDate && canCreate ? 'hover:bg-blue-50 hover:border-blue-300 border-dashed' : ''}
                        ${!currentSlot && !isPastDate && !canCreate ? 'opacity-50 cursor-not-allowed' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {currentSlot ? (
                        <div className="flex items-center justify-center h-full">
                          {currentSlot.status === 'AVAILABLE' ? (
                            <Power className="w-3 h-3" />
                          ) : currentSlot.status === 'BOOKED' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full opacity-50">
                          {canCreate ? <Plus className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium text-gray-700">Trạng thái:</div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-xs text-gray-600">Có thể đặt</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-xs text-gray-600">Đã đặt</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-xs text-gray-600">Đã hủy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded border-dashed"></div>
              <span className="text-xs text-gray-600">Chưa tạo</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <span className="font-medium">Thao tác:</span> Click để bật/tắt/tạo mới | Double-click để chọn nhiều
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <RotateCcw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-700">Đang cập nhật lịch...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarView; 