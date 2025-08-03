import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, CheckCircle, FileText, Info,
  Building, MapPin, Power, PowerOff, AlertTriangle,
  Zap, Users, RefreshCw, Play, Settings
} from 'lucide-react';
import { doctorService } from '../../../services/api';
import { useNotification } from '../../../components/NotificationSystem';
import { formatDateToYYYYMMDD, createLocalISOString } from '../../../utils/dateUtils';
import WeeklyCalendarView from './WeeklyCalendarView';
import SpecialtyTabBar from './SpecialtyTabBar';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import BulkConflictDialog from './BulkConflictDialog';
import AutoGenerationPanel from './AutoGenerationPanel';

const ScheduleManagement = ({ 
  specialties,
  selectedSpecialtyForSchedule,
  setSelectedSpecialtyForSchedule,
  handleGenerateSlotsFromWorkShifts,
  handleToggleSlot,
  handleCreateNewSlot,
  refetchData,
  onShowAppointmentDetails // Expects a function that takes slotId
}) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [internalLoadingSlots, setInternalLoadingSlots] = useState(false);
  const [workShifts, setWorkShifts] = useState([]);
  const [loadingWorkShifts, setLoadingWorkShifts] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [showBulkConflictDialog, setShowBulkConflictDialog] = useState(false);
  const [bulkConflictInfo, setBulkConflictInfo] = useState(null);
  
  const { showError, showWarning, showSuccess } = useNotification();
  const doctorId = localStorage.getItem('backendUserId');
  
  // Tách function để có thể gọi từ component con
  const fetchAvailabilitySlots = useCallback(async () => {
    if (!doctorId) {
      showError("Không tìm thấy ID bác sĩ để tải lịch làm việc.");
      return;
    }
    setInternalLoadingSlots(true);
    try {
      const response = await doctorService.getMyAvailabilitySlots();
      // The API returns an array of slots directly
      setAvailabilitySlots(response || []); 
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      showError('Không thể tải lịch làm việc của bác sĩ.');
      setAvailabilitySlots([]);
    } finally {
      setInternalLoadingSlots(false);
    }
  }, [doctorId, showError]);
  
  useEffect(() => {
    fetchAvailabilitySlots();
  }, [fetchAvailabilitySlots, refetchData]); 

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

    // Nếu đang tắt slot (currentStatus === 'AVAILABLE'), thực hiện trực tiếp
    if (currentStatus === 'AVAILABLE') {
      try {
        await handleToggleSlot(slotId, currentStatus, slotTime);
        await fetchAvailabilitySlots();
        showSuccess('Đã tắt slot thành công!');
      } catch (error) {
        console.error('Error toggling slot:', error);
        showError('Không thể cập nhật slot. Vui lòng thử lại.');
      }
      return;
    }

    // Nếu đang bật slot (currentStatus !== 'AVAILABLE'), kiểm tra xung đột
    try {
      // Ensure consistent timezone handling - use createLocalISOString instead of toISOString
      let slotDateTime;
      if (slotTime instanceof Date) {
        slotDateTime = createLocalISOString(slotTime);
      } else {
        // Parse the datetime string in local timezone consistently
        const localDateTime = new Date(slotTime);
        slotDateTime = createLocalISOString(localDateTime);
      }
      
      console.log('🔍 Checking slot conflicts:', {
        slotId,
        currentStatus,
        slotTime,
        slotDateTime,
        selectedSpecialtyForSchedule,
        specialtyName,
        clinicName
      });
      
      const conflictResponse = await doctorService.checkSlotConflicts(
        slotDateTime, 
        selectedSpecialtyForSchedule
      );

      console.log('🔍 Conflict response:', conflictResponse);

      if (conflictResponse.hasConflict) {
        console.log('⚠️ Conflicts detected, showing dialog');
        // Hiển thị dialog xung đột
        setConflictInfo({
          ...conflictResponse,
          slotId,
          slotTime: slotDateTime,
          targetSpecialtyId: selectedSpecialtyForSchedule
        });
        setShowConflictDialog(true);
      } else {
        console.log('✅ No conflicts, toggling slot directly');
        // Không có xung đột, thực hiện toggle trực tiếp
        await handleToggleSlot(slotId, currentStatus, slotTime);
        await fetchAvailabilitySlots();
        showSuccess('Đã bật slot thành công!');
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // If there's an error checking conflicts, still perform the toggle
      try {
        await handleToggleSlot(slotId, currentStatus, slotTime);
        await fetchAvailabilitySlots();
        showSuccess('Đã bật slot thành công!');
      } catch (toggleError) {
        console.error('Error toggling slot:', toggleError);
        showError('Không thể cập nhật slot. Vui lòng thử lại.');
      }
    }
  }, [internalLoadingSlots, handleToggleSlot, fetchAvailabilitySlots, showSuccess, showError, selectedSpecialtyForSchedule]);
  
  // Enhanced create new slot with automatic conflict resolution
  const handleAdvancedCreateNewSlot = useCallback(async (slotData) => {
    if (internalLoadingSlots) return;

    try {
      // Create a consistent local datetime for conflict checking - avoid timezone confusion
      // Parse date and time in local timezone, then convert to consistent ISO for API
      const localDateTime = new Date(`${slotData.date}T${slotData.startTime}:00`);
      const slotDateTime = createLocalISOString(localDateTime);
      
      console.log('🔍 Checking conflicts for new slot:', {
        slotData,
        localDateTime,
        slotDateTime,
        selectedSpecialtyForSchedule
      });
      
      const conflictResponse = await doctorService.checkSlotConflicts(
        slotDateTime, 
        selectedSpecialtyForSchedule
      );

      console.log('🔍 New slot conflict response:', conflictResponse);

      if (conflictResponse.hasConflict) {
        console.log('⚠️ Conflicts detected for new slot, showing dialog');
        // Show conflict dialog
        setConflictInfo({
          ...conflictResponse,
          slotData,
          slotTime: slotDateTime,
          targetSpecialtyId: selectedSpecialtyForSchedule,
          isCreateNew: true
        });
        setShowConflictDialog(true);
      } else {
        console.log('✅ No conflicts for new slot, creating directly');
        // No conflicts, create the slot directly
        await handleCreateNewSlot(slotData);
        await fetchAvailabilitySlots();
        showSuccess('Đã tạo slot mới thành công!');
      }
    } catch (error) {
      console.error('Error checking conflicts for new slot:', error);
      // If there's an error checking conflicts, still try to create the slot
      try {
        await handleCreateNewSlot(slotData);
        await fetchAvailabilitySlots();
        showSuccess('Đã tạo slot mới thành công!');
      } catch (createError) {
        console.error('Error creating new slot:', createError);
        showError('Không thể tạo slot mới. Vui lòng thử lại.');
      }
    }
  }, [internalLoadingSlots, handleCreateNewSlot, fetchAvailabilitySlots, showError, showSuccess, selectedSpecialtyForSchedule]);
  
  // Handle conflict resolution from the dialog
  const handleConflictResolve = useCallback(async (action) => {
    if (!conflictInfo) return;
    
    console.log('🔧 Resolving conflict:', { action, conflictInfo });
    
    setConflictLoading(true);
    try {
      // Resolve conflicts first
      const resolveResponse = await doctorService.resolveSlotConflicts(
        action, 
        conflictInfo.slotTime, 
        conflictInfo.targetSpecialtyId
      );
      
      console.log('🔧 Conflict resolution response:', resolveResponse);
      
      // Create detailed success message
      let successMessage = '';
      let conflictDetails = '';
      
      if (resolveResponse && resolveResponse.success) {
        const { disabledCount, skippedCount, disabledSlots } = resolveResponse;
        
        if (disabledCount > 0) {
          conflictDetails = `Đã tắt ${disabledCount} slot xung đột`;
          if (skippedCount > 0) {
            conflictDetails += `, bỏ qua ${skippedCount} slot đã có bệnh nhân đặt`;
          }
          conflictDetails += ': ' + disabledSlots.join(', ');
        }
      }
      
      // Then perform the original action
      if (conflictInfo.isCreateNew && conflictInfo.slotData) {
        console.log('🔧 Creating new slot after conflict resolution');
        await handleCreateNewSlot(conflictInfo.slotData);
        
        successMessage = 'Đã tạo slot mới thành công!';
        if (conflictDetails) {
          successMessage += '\n' + conflictDetails;
        }
        showSuccess(successMessage);
      } else if (conflictInfo.slotId) {
        console.log('🔧 Toggling slot after conflict resolution');
        // Convert slotTime back to Date object for handleToggleSlot
        const slotTimeDate = new Date(conflictInfo.slotTime);
        
        // Find the current slot to get its current status
        const currentSlot = availabilitySlots.find(slot => 
          (slot.slotId || slot.slot_id) === conflictInfo.slotId
        );
        const currentStatus = currentSlot?.status || 'CANCELLED_BY_CLINIC';
        
        console.log('🔧 Current slot status:', currentStatus);
        await handleToggleSlot(conflictInfo.slotId, currentStatus, slotTimeDate);
        
        successMessage = 'Đã bật slot thành công!';
        if (conflictDetails) {
          successMessage += '\n' + conflictDetails;
        }
        showSuccess(successMessage);
      }
      
      await fetchAvailabilitySlots();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      showError('Không thể xử lý xung đột. Vui lòng thử lại.');
    } finally {
      setConflictLoading(false);
      setShowConflictDialog(false);
      setConflictInfo(null);
    }
  }, [conflictInfo, handleCreateNewSlot, handleToggleSlot, fetchAvailabilitySlots, showSuccess, showError, availabilitySlots]);

  // Handle auto-generation request from the panel with work shift filtering
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

    // Use formatDateToYYYYMMDD for consistency
    const startDate = settings.startDate ? formatDateToYYYYMMDD(settings.startDate) : null;
    const endDate = settings.endDate ? formatDateToYYYYMMDD(settings.endDate) : null;

    // Show confirmation dialog before generating schedule
    setBulkConflictInfo({
      settings: { ...settings, startDate, endDate },
      specialty: currentSpecialty,
      clinicId,
      totalConflicts: 0 // Will be calculated later
    });
    setShowBulkConflictDialog(true);
  };

  // Handle bulk conflict resolution after user confirms
  const handleBulkConflictConfirm = async () => {
    if (!bulkConflictInfo) return;

    setAutoGenerating(true);
    try {
      // Create payload with work shift filtering information
      const generationPayload = {
        specialtyId: selectedSpecialtyForSchedule,
        clinicId: bulkConflictInfo.clinicId,
        startDate: bulkConflictInfo.settings.startDate,
        endDate: bulkConflictInfo.settings.endDate,
        slotDuration: bulkConflictInfo.settings.slotDuration || 30,
        overwrite: true, // Always overwrite to avoid conflicts
        workShiftFilter: bulkConflictInfo.settings.workShiftFilter || 'all'
      };

      console.log('🚀 Generating bulk slots with payload:', generationPayload);

      const result = await handleGenerateSlotsFromWorkShifts(generationPayload);
      
      // Refetch data for real-time update
      await fetchAvailabilitySlots();
      
      // Display detailed notification
      if (result && result.success) {
        let message = `Đã tạo ${result.createdSlotsCount} slots thành công`;
        if (result.skippedCount > 0) {
          message += `, bỏ qua ${result.skippedCount} slots đã được bệnh nhân đặt`;
        }
        if (result.hasErrors && result.errors) {
          message += `\nCó ${result.errors.length} lỗi nhỏ trong quá trình tạo`;
        }
        showSuccess(message);
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      showError('Không thể tạo slots tự động. Vui lòng thử lại.');
    } finally {
      setAutoGenerating(false);
      setShowBulkConflictDialog(false);
      setBulkConflictInfo(null);
    }
  };

  // This component no longer shows the modal itself, it just calls the parent handler
  const handleShowDetails = useCallback((slotId) => {
    if (onShowAppointmentDetails) {
      onShowAppointmentDetails(slotId);
    }
  }, [onShowAppointmentDetails]);

  return (
    <div className="space-y-6">

      <SpecialtyTabBar 
        specialties={specialties}
        selectedSpecialty={selectedSpecialtyForSchedule}
        onSpecialtyChange={setSelectedSpecialtyForSchedule}
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
            onCreateNewSlot={handleAdvancedCreateNewSlot}
            refetchData={refetchData}
            onShowAppointmentDetails={handleShowDetails} // Pass the new handler
          />
        </div>

        <div className="lg:col-span-1">
          <AutoGenerationPanel
            workShifts={workShifts}
            selectedSpecialty={selectedSpecialtyForSchedule}
            specialties={specialties}
            onGenerate={handleAutoGenerate}
            loading={autoGenerating}
            loadingWorkShifts={loadingWorkShifts}
          />
        </div>
      </div>

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => {
          setShowConflictDialog(false);
          setConflictInfo(null);
        }}
        conflictInfo={conflictInfo}
        onResolve={handleConflictResolve}
        loading={conflictLoading}
      />

      <BulkConflictDialog
        isOpen={showBulkConflictDialog}
        onClose={() => {
          setShowBulkConflictDialog(false);
          setBulkConflictInfo(null);
        }}
        conflictInfo={bulkConflictInfo}
        onConfirm={handleBulkConflictConfirm}
        loading={autoGenerating}
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
