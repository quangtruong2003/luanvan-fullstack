import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, CheckCircle, Clock, FileText, Info,
  Building, MapPin, Power, PowerOff, AlertTriangle,
  Zap, Users, RefreshCw, Play, Settings
} from 'lucide-react';
import { doctorService } from '../../../services/api';
import { useNotification } from '../../../components/NotificationSystem';
import InfoTooltip from './InfoTooltip';
import WeeklyCalendarView from './WeeklyCalendarView';
import SpecialtyTabBar from './SpecialtyTabBar';
import EnhancedSlotConflictDialog from './EnhancedSlotConflictDialog';
import AutoGenerationPanel from './AutoGenerationPanel';

const ScheduleManagement = ({ 
  specialties,
  selectedSpecialtyForSchedule,
  setSelectedSpecialtyForSchedule,
  handleGenerateSlotsFromWorkShifts,
  handleToggleSlot,
  handleCreateNewSlot,
  refetchData
}) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [internalLoadingSlots, setInternalLoadingSlots] = useState(false);
  const [workShifts, setWorkShifts] = useState([]);
  const [loadingWorkShifts, setLoadingWorkShifts] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [showEnhancedConflictDialog, setShowEnhancedConflictDialog] = useState(false);
  const [enhancedConflictInfo, setEnhancedConflictInfo] = useState(null);
  
  const { showError, showWarning } = useNotification();
  const doctorId = localStorage.getItem('backendUserId');
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId) {
        showError("Không tìm thấy ID bác sĩ để tải lịch làm việc.");
        return;
      }
      setInternalLoadingSlots(true);
      try {
        const response = await doctorService.getAvailabilitySlots(doctorId, 0, 1000);
        // The new endpoint returns a map with a 'slots' array
        setAvailabilitySlots(response.slots || []); 
      } catch (error) {
        console.error('Error fetching availability slots:', error);
        showError('Không thể tải lịch làm việc của bác sĩ.');
        setAvailabilitySlots([]);
      } finally {
        setInternalLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctorId, showError, refetchData]); 

  // Load work shifts when specialty is selected
  useEffect(() => {
    const loadWorkShifts = async () => {
      if (!selectedSpecialtyForSchedule) {
        setWorkShifts([]);
        return;
      }
      
      try {
        setLoadingWorkShifts(true);
        const shifts = await doctorService.getWorkShiftsBySpecialty(selectedSpecialtyForSchedule);
        setWorkShifts(shifts || []);
      } catch (error) {
        console.error('Error loading work shifts:', error);
        showError('Không thể tải ca làm việc của phòng khám.');
        setWorkShifts([]);
      } finally {
        setLoadingWorkShifts(false);
      }
    };

    loadWorkShifts();
  }, [selectedSpecialtyForSchedule, showError]);

  // Filter slots for the selected specialty to pass to the calendar
  const filteredSlotsForCalendar = useMemo(() => {
    if (!selectedSpecialtyForSchedule) return [];
    return availabilitySlots.filter(slot => 
      (slot.specialtyId || slot.specialty_id || slot.specialty?.specialtyId) === selectedSpecialtyForSchedule
    );
  }, [availabilitySlots, selectedSpecialtyForSchedule]);

  // Advanced toggle with conflict checking
  const handleAdvancedToggleSlot = useCallback(async (slotId, currentStatus, slotTime, specialtyName, clinicName) => {
    if (internalLoadingSlots) return;

    // Check for conflicts only if we are enabling a slot and doctor has multiple specialties
    if (currentStatus !== 'AVAILABLE' && specialties.length > 1) {
      try {
        setLoadingWorkShifts(true); // Reuse loading state for conflict check
        const conflictCheck = await doctorService.checkSlotConflicts(slotTime, selectedSpecialtyForSchedule);
        
        if (conflictCheck?.hasConflict) {
          setEnhancedConflictInfo({
            slotId,
            slotTime,
            currentSpecialty: specialtyName,
            currentClinic: clinicName,
            conflictSpecialty: conflictCheck.conflicts[0]?.specialtyName || 'Chuyên khoa khác',
            conflictClinic: conflictCheck.conflicts[0]?.clinicName || 'Phòng khám khác',
            conflictDetails: conflictCheck.message
          });
          setShowEnhancedConflictDialog(true);
          return;
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
        showWarning('Không thể kiểm tra xung đột lịch. Thao tác vẫn sẽ được thực hiện.');
      } finally {
        setLoadingWorkShifts(false);
      }
    }
    
    // Proceed with toggling if no conflict or not applicable
    await handleToggleSlot(slotId, currentStatus, slotTime);
  }, [internalLoadingSlots, specialties.length, selectedSpecialtyForSchedule, handleToggleSlot, showWarning]);
  
  // Handle conflict resolution from the dialog
  const handleEnhancedConflictResolve = useCallback(async (resolution, conflictInfo) => {
    // For now, we only implement the 'switch' logic as it's the most common
    try {
      await handleToggleSlot(conflictInfo.slotId, 'CANCELLED_BY_CLINIC', conflictInfo.slotTime);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      showError('Không thể giải quyết xung đột. Vui lòng thử lại.');
    } finally {
      setShowEnhancedConflictDialog(false);
    }
  }, [handleToggleSlot, showError]);

  // Handle auto-generation request from the panel
  const handleAutoGenerate = async (settings) => {
    if (!selectedSpecialtyForSchedule) {
      showWarning('Vui lòng chọn một chuyên khoa để tạo lịch.');
      return;
    }

    const currentSpecialty = specialties.find(s => (s.specialtyId || s.specialty_id) === selectedSpecialtyForSchedule);
    const clinicId = currentSpecialty?.clinic?.clinicId || currentSpecialty?.clinic?.clinic_id;

    if (!clinicId) {
      showError('Chuyên khoa này không liên kết với phòng khám nào.');
      return;
    }
    
    setAutoGenerating(true);
    try {
      await handleGenerateSlotsFromWorkShifts(selectedSpecialtyForSchedule, clinicId, settings);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setAutoGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">⏰ Quản lý lịch làm việc</h2>
            <p className="text-emerald-100 text-lg">
              Xem và tạo lịch khám cho từng chuyên khoa
            </p>
          </div>
          
          <div className="hidden md:block">
            <Clock className="w-16 h-16 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">🚀 Tính năng thông minh</h3>
              <p className="text-sm text-emerald-100">
                {specialties.length > 1 
                  ? "Tự động xử lý xung đột lịch làm việc giữa các chuyên khoa" 
                  : "Dễ dàng tạo lịch dựa trên ca làm việc của phòng khám"}
              </p>
            </div>
            {specialties.length > 1 && (
              <div className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-300">
                <span className="text-xs font-medium">
                  <Users className="w-3 h-3 inline mr-1" />
                  {specialties.length} chuyên khoa
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SpecialtyTabBar 
        specialties={specialties}
        selectedSpecialty={selectedSpecialtyForSchedule}
        onSelectSpecialty={setSelectedSpecialtyForSchedule}
        loadingWorkShifts={loadingWorkShifts}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <WeeklyCalendarView
            slots={filteredSlotsForCalendar}
            workShifts={workShifts}
            selectedSpecialty={selectedSpecialtyForSchedule}
            specialties={specialties}
            onSlotToggle={handleAdvancedToggleSlot}
            onBulkToggle={handleToggleSlot} 
            loading={internalLoadingSlots || loadingWorkShifts || autoGenerating}
            onCreateNewSlot={handleCreateNewSlot}
            refetchData={refetchData}
          />
        </div>

        <div className="lg:col-span-1">
          <AutoGenerationPanel
            workShifts={workShifts}
            selectedSpecialty={selectedSpecialtyForSchedule}
            specialties={specialties}
            onGenerate={handleAutoGenerate}
            loading={autoGenerating}
          />
        </div>
      </div>

      <EnhancedSlotConflictDialog
        isOpen={showEnhancedConflictDialog}
        onClose={() => setShowEnhancedConflictDialog(false)}
        conflictInfo={enhancedConflictInfo}
        onResolve={handleEnhancedConflictResolve}
        onCancel={() => setShowEnhancedConflictDialog(false)}
      />

      {(autoGenerating || loadingWorkShifts || internalLoadingSlots) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {autoGenerating ? 'Đang tạo lịch tự động...' : 'Đang tải dữ liệu...'}
              </h3>
              
              <button 
                onClick={() => {
                  setAutoGenerating(false);
                  setLoadingWorkShifts(false);
                  setInternalLoadingSlots(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <PowerOff className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <RefreshCw className="w-16 h-16 animate-spin text-emerald-600 mb-4" />
              
              <p className="text-center text-gray-700 mb-2">
                {autoGenerating 
                  ? "Đang xử lý lịch khám dựa trên ca làm việc của phòng khám." 
                  : "Đang tải lịch làm việc và ca khám."}
              </p>
              
              <p className="text-sm text-gray-500">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
