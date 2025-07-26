import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Calendar, Clock, Power, PowerOff, User,
  ChevronLeft, ChevronRight, Plus, Check, RotateCw, X, AlertTriangle
} from 'lucide-react';
import { useNotification } from '../../../components/NotificationSystem';
import { clinicOfflineService } from '../../../services/clinicOfflineService'; // Import a new service

const WeeklyCalendarView = ({ 
  slots = [], 
  workShifts = [], 
  selectedSpecialty,
  onSlotToggle,
  onBulkToggle, // This can be used for bulk enabling/disabling
  loading = false,
  specialties = [],
  onCreateNewSlot,
  refetchData,
  onShowAppointmentDetails,
  readOnly = false // New readOnly prop
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  const [offlineDates, setOfflineDates] = useState([]); // State for offline dates
  const { showInfo, showError } = useNotification();

  // Get current clinic ID from selected specialty
  const currentClinicId = useMemo(() => {
    if (!selectedSpecialty || !specialties.length) return null;
    const specialty = specialties.find(s => (s.specialtyId || s.specialty_id) === selectedSpecialty);
    return specialty?.clinic?.clinic_id || specialty?.clinic?.clinicId || null;
  }, [selectedSpecialty, specialties]);

  // Fetch offline dates when clinic changes
  useEffect(() => {
    if (!currentClinicId) {
      setOfflineDates([]);
      return;
    }

    const fetchOfflineDates = async () => {
      try {
        const data = await clinicOfflineService.getAllClinicOfflineDates(currentClinicId);
        setOfflineDates(data || []);
      } catch (error) {
        console.error("Error fetching offline dates:", error);
        showError("Không thể tải danh sách ngày nghỉ của phòng khám.");
      }
    };

    fetchOfflineDates();
  }, [currentClinicId, showError]);

  const offlineDatesMap = useMemo(() => {
    const map = new Map();
    offlineDates.forEach(d => {
      // Normalize date to YYYY-MM-DD format without time zone issues
      const dateKey = new Date(d.date).toISOString().split('T')[0];
      map.set(dateKey, d.reason || 'Phòng khám nghỉ');
    });
    return map;
  }, [offlineDates]);

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

  // Check if current week has any slots
  const currentWeekHasSlots = useMemo(() => {
    if (!slots || slots.length === 0) return false;
    
    const weekStart = new Date(currentWeek);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return slots.some(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= weekStart && slotDate <= weekEnd;
    });
  }, [slots, currentWeek]);

  // Auto-navigate to nearest week with slots
  useEffect(() => {
    if (!slots || slots.length === 0 || hasAutoNavigated || currentWeekHasSlots) {
      return;
    }

    // Find the nearest week with slots
    const findNearestWeekWithSlots = () => {
      const today = new Date();
      const sortedSlots = [...slots]
        .filter(slot => new Date(slot.date) >= today) // Only future slots
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (sortedSlots.length === 0) {
        // If no future slots, check past slots
        const pastSlots = [...slots]
          .filter(slot => new Date(slot.date) < today)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (pastSlots.length > 0) {
          return new Date(pastSlots[0].date);
        }
        return null;
      }

      return new Date(sortedSlots[0].date);
    };

    const nearestSlotDate = findNearestWeekWithSlots();
    if (nearestSlotDate) {
      // Navigate to the week containing the nearest slot
      const targetWeek = new Date(nearestSlotDate);
      const dayOfWeek = targetWeek.getDay();
      const diff = targetWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      targetWeek.setDate(diff);
      
      setCurrentWeek(targetWeek);
      setHasAutoNavigated(true);
      
      showInfo(`Đã chuyển đến tuần có lịch khám gần nhất (${nearestSlotDate.toLocaleDateString('vi-VN')})`);
    }
  }, [slots, currentWeekHasSlots, hasAutoNavigated, showInfo]);

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
    // Reset auto-navigation flag when user manually navigates
    setHasAutoNavigated(false);
  };

  // Reset auto-navigation when specialty changes
  useEffect(() => {
    setHasAutoNavigated(false);
  }, [selectedSpecialty]);

  const handleSlotClick = (date, time, currentSlot) => {
    const dateStr = date.toISOString().split('T')[0];
    if (offlineDatesMap.has(dateStr)) {
      showInfo(`Phòng khám nghỉ vào ngày này.`, `Lý do: ${offlineDatesMap.get(dateStr)}`);
      return;
    }

    // If a slot is booked, always allow showing details regardless of readOnly mode
    if (currentSlot && (currentSlot.status === 'BOOKED' || currentSlot.status === 'CONFIRMED') && onShowAppointmentDetails) {
      const slotId = currentSlot.slotId || currentSlot.slot_id;
      onShowAppointmentDetails(slotId);
      return;
    }

    // If in readOnly mode, prevent any other actions
    if (readOnly || loading) {
      return;
    }
    
    if (currentSlot) {
      // Tạo datetime object để truyền vào handleAdvancedToggleSlot
      const slotDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      slotDateTime.setHours(hours, minutes, 0, 0);
      
      // Get specialty and clinic names for display
      const specialty = specialties.find(s => (s.specialtyId || s.specialty_id) === selectedSpecialty);
      const specialtyName = specialty?.name || 'Chuyên khoa không xác định';
      const clinicName = specialty?.clinic?.name || 'Phòng khám không xác định';
      
      // Gọi với đầy đủ tham số
      onSlotToggle(
        currentSlot.slotId || currentSlot.slot_id, 
        currentSlot.status,
        slotDateTime,
        specialtyName,
        clinicName
      );
    } else if (onCreateNewSlot && canCreateNewSlot(date, time)) {
      // Thực hiện tạo slot ngay lập tức - ghi đè tuyệt đối
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      const endDate = new Date(date);
      endDate.setHours(hours, minutes + 30);
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      const slotData = {
        date: date.toISOString().split('T')[0],
        startTime: startTime,
        endTime: endTime,
        specialtyId: selectedSpecialty
      };
      
      onCreateNewSlot(slotData);
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
              {weekDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const currentSlot = slotsByDateTime[dateStr]?.[time];
                const past = isPast(date, time);
                const canCreate = !past && !!currentSpecialtyInfo;
                const isSelected = selectedSlots.has(currentSlot?.slotId);
                const isOffline = offlineDatesMap.has(dateStr);
                const offlineReason = isOffline ? offlineDatesMap.get(dateStr) : '';

                // Determine if the slot is interactive
                const isClickableForDetails = currentSlot && (currentSlot.status === 'BOOKED' || currentSlot.status === 'CONFIRMED');
                const isInteractive = (!readOnly && !isOffline) || isClickableForDetails;

                let bgColor = 'bg-gray-50';
                let textColor = 'text-gray-400';
                let borderColor = 'border-gray-200';
                let hoverBgColor = 'hover:bg-gray-100';
                let content = <Plus className="w-4 h-4" />;
                let title = readOnly ? 'Lịch chỉ xem' : 'Click để tạo slot mới';
                let isDisabled = loading || past; // Remove !isInteractive from here

                if (isOffline) {
                  bgColor = 'bg-gray-200';
                  textColor = 'text-gray-500';
                  borderColor = 'border-gray-300';
                  content = <AlertTriangle className="w-4 h-4 text-orange-500" />;
                  title = `Ngày nghỉ: ${offlineReason}. Click để xem chi tiết.`;
                  isDisabled = loading || past; // Can be clicked even if offline, unless it's in the past
                } else if (currentSlot) {
                  switch (currentSlot.status) {
                    case 'AVAILABLE':
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-700';
                      borderColor = 'border-green-300';
                      hoverBgColor = 'hover:bg-green-200';
                      content = <Power className="w-4 h-4" />;
                      title = isInteractive ? 'Slot có sẵn. Click để tắt.' : 'Slot có sẵn';
                      break;
                    case 'BOOKED':
                    case 'CONFIRMED':
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-700';
                      borderColor = 'border-blue-300';
                      hoverBgColor = 'hover:bg-blue-200';
                      content = <User className="w-4 h-4" />;
                      title = `Đã đặt bởi: ${currentSlot.patient?.fullName || 'Bệnh nhân'}. Click để xem chi tiết.`;
                      isDisabled = loading; // Can be clicked to see details
                      break;
                    case 'CANCELLED_BY_CLINIC':
                    case 'DISABLED':
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-700';
                      borderColor = 'border-red-300';
                      hoverBgColor = 'hover:bg-red-200';
                      content = <PowerOff className="w-4 h-4" />;
                      title = isInteractive ? 'Slot đã tắt. Click để bật.' : 'Slot đã tắt';
                      break;
                    case 'PENDING_PAYMENT':
                    case 'PENDING_CONFIRMATION':
                    case 'PENDING':
                      bgColor = 'bg-yellow-100';
                      textColor = 'text-yellow-700';
                      borderColor = 'border-yellow-300';
                      hoverBgColor = ''; // No hover for pending slots
                      content = <Clock className="w-4 h-4" />;
                      title = 'Chờ xác nhận từ bệnh nhân';
                      isDisabled = true; // Cannot toggle pending slots
                      break;
                    case 'CANCELLED_BY_PATIENT':
                    case 'CANCELLED':
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-600';
                      borderColor = 'border-gray-300';
                      hoverBgColor = 'hover:bg-gray-200';
                      content = <X className="w-4 h-4" />;
                      title = isInteractive ? 'Đã hủy bởi bệnh nhân. Click để bật lại.' : 'Đã hủy bởi bệnh nhân';
                      break;
                    default:
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-500';
                      borderColor = 'border-gray-300';
                      hoverBgColor = '';
                      content = 'N/A';
                      title = `Status: ${currentSlot.status}`;
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
                     title = isInteractive ? 'Click để tạo slot mới' : 'Lịch chỉ xem';
                  }
                }

                if (past && !isOffline) { // Don't override offline styling
                  bgColor = 'bg-gray-50';
                  textColor = 'text-gray-300';
                  borderColor = 'border-gray-100';
                  hoverBgColor = '';
                }

                const effectiveHover = isInteractive || isOffline ? hoverBgColor : ''; // Allow hover on offline slots
                const cursorClass = isDisabled ? 'cursor-not-allowed' : (isInteractive || isOffline ? 'cursor-pointer' : 'cursor-default');

                return (
                  <div key={dateStr} className="p-1 border-r border-t h-12 flex items-center justify-center">
                    <button
                      title={title}
                      disabled={isDisabled}
                      onClick={() => handleSlotClick(date, time, currentSlot)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (currentSlot && isInteractive) handleSlotSelection(currentSlot.slotId || currentSlot.slot_id, e);
                      }}
                      className={`w-full h-full rounded-md border-2 transition-all duration-150 flex items-center justify-center
                        ${bgColor} ${textColor} ${borderColor} ${effectiveHover}
                        ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                        ${isDisabled ? 'opacity-50' : ''} ${cursorClass}
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
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300"></div><span className="text-xs">Ngày nghỉ</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-gray-100 border-gray-200 border-dashed"></div><span className="text-xs">Chưa tạo</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-sm bg-yellow-100 border-yellow-300"></div><span className="text-xs">Chờ xác nhận</span></div>
          </div>
          
          {selectedSlots.size > 0 && !readOnly && (
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