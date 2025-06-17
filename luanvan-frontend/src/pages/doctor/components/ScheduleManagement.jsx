import React, { useState, useEffect, useMemo } from 'react';
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
  availabilitySlots,
  handleGenerateSlotsFromWorkShifts,
  handleToggleSlot,
  setShowSlotConflictDialog,
  setConflictInfo,
  handleCreateNewSlot,
  loadingSlots = false
}) => {
  const [workShifts, setWorkShifts] = useState([]);
  const [loadingWorkShifts, setLoadingWorkShifts] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [showEnhancedConflictDialog, setShowEnhancedConflictDialog] = useState(false);
  const [enhancedConflictInfo, setEnhancedConflictInfo] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'generation'
  const [slotCounts, setSlotCounts] = useState({});
  const [autoGenerationAttempted, setAutoGenerationAttempted] = useState(false);
  
  const { showSuccess, showError, showWarning } = useNotification();
  
  const today = useMemo(() => new Date(), []);

  // Reset auto-generation attempt flag when specialty changes
  useEffect(() => {
    setAutoGenerationAttempted(false);
  }, [selectedSpecialtyForSchedule]);

  // Load work shifts when specialty is selected
  useEffect(() => {
    const loadWorkShifts = async () => {
      if (!selectedSpecialtyForSchedule) return;
      
      try {
        setLoadingWorkShifts(true);
        const shifts = await doctorService.getWorkShiftsBySpecialty(selectedSpecialtyForSchedule);
        setWorkShifts(shifts || []);
      } catch (error) {
        console.error('Error loading work shifts:', error);
        setWorkShifts([]);
      } finally {
        setLoadingWorkShifts(false);
      }
    };

    if (selectedSpecialtyForSchedule) {
      loadWorkShifts();
    }
  }, [selectedSpecialtyForSchedule]);

  // Calculate slot counts by specialty
  useEffect(() => {
    const calculateSlotCounts = () => {
      const counts = {};
      
      specialties.forEach(specialty => {
        const specialtySlots = availabilitySlots.filter(slot => 
          slot.specialty?.specialty_id === specialty.specialty_id
        );
        
        const today = new Date().toISOString().split('T')[0];
        const todaySlots = specialtySlots.filter(slot => slot.date === today);
        
        counts[specialty.specialty_id] = {
          total: todaySlots.length,
          available: todaySlots.filter(slot => slot.status === 'AVAILABLE').length,
          booked: todaySlots.filter(slot => slot.status === 'BOOKED').length,
          cancelled: todaySlots.filter(slot => slot.status === 'CANCELLED_BY_CLINIC').length
        };
      });
      
      setSlotCounts(counts);
    };

    calculateSlotCounts();
  }, [availabilitySlots, specialties]);

  // Auto-trigger slot generation for single specialty doctors
  useEffect(() => {
    const autoGenerateForSingleSpecialty = async () => {
      // Only auto-generate if:
      // 1. Doctor has exactly one specialty
      // 2. Specialty is auto-selected
      // 3. No existing slots for this specialty
      // 4. Work shifts are available
      if (
        specialties.length === 1 && 
        selectedSpecialtyForSchedule && 
        workShifts.length > 0 &&
        availabilitySlots.filter(slot => 
          slot.specialty?.specialty_id === selectedSpecialtyForSchedule
        ).length === 0
      ) {
        console.log('Auto-generating slots for single specialty doctor...');
        
        const selectedSpecialty = specialties.find(s => s.specialty_id === selectedSpecialtyForSchedule);
        if (selectedSpecialty?.clinic?.clinic_id) {
          try {
            setAutoGenerating(true);
            const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            await handleGenerateSlotsFromWorkShifts(
              selectedSpecialtyForSchedule,
              selectedSpecialty.clinic.clinic_id,
              { 
                startDate: today.toISOString().split('T')[0], 
                endDate: endDate.toISOString().split('T')[0] 
              }
            );
            console.log('Auto-generation completed for single specialty doctor');
          } catch (error) {
            console.error('Error in auto-generation:', error);
          } finally {
            setAutoGenerating(false);
          }
        }
      }
    };

    // Only auto-generate after work shifts are loaded and if not attempted yet
    if (
      !autoGenerationAttempted &&
      selectedSpecialtyForSchedule && 
      workShifts.length > 0 && 
      !loadingWorkShifts
    ) {
      setAutoGenerationAttempted(true); // Set flag to prevent re-triggering
      autoGenerateForSingleSpecialty();
    }
  }, [selectedSpecialtyForSchedule, workShifts, specialties, availabilitySlots, loadingWorkShifts, handleGenerateSlotsFromWorkShifts, today, autoGenerationAttempted]);

  // Enhanced toggle with conflict checking for multi-specialty doctors
  const handleAdvancedToggleSlot = async (slotId, currentStatus, slotTime, specialtyName, clinicName) => {
    // If doctor has multiple specialties and trying to enable a slot, check for conflicts
    if (specialties.length > 1 && currentStatus !== 'AVAILABLE') {
      try {
        setLoadingSlots(true);
        const conflictCheck = await doctorService.checkSlotConflicts(slotTime, selectedSpecialtyForSchedule);
        
        if (conflictCheck.hasConflict) {
          // Show enhanced conflict dialog
          setEnhancedConflictInfo({
            slotId,
            slotTime,
            currentSpecialty: specialtyName,
            currentClinic: clinicName,
            conflictSpecialty: conflictCheck.conflictSpecialty,
            conflictClinic: conflictCheck.conflictClinic,
            conflictDetails: conflictCheck.conflictDetails
          });
          setShowEnhancedConflictDialog(true);
          return; // Don't proceed with toggle yet
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
        // Still allow the toggle if conflict check fails
        const proceedAnyway = window.confirm(
          `⚠️ Không thể kiểm tra xung đột lịch.\n\nBạn có muốn tiếp tục thao tác không?`
        );
        if (!proceedAnyway) return;
      } finally {
        setLoadingSlots(false);
      }
    }
    
    // Proceed with toggle
    await handleToggleSlot(slotId, currentStatus, slotTime, specialtyName, clinicName);
  };

  // Handle enhanced conflict resolution
  const handleEnhancedConflictResolve = async (resolution, conflictInfo) => {
    try {
      setLoadingSlots(true);
      
      switch (resolution) {
        case 'switch':
          // Switch to new specialty - disable conflicting slot and enable current
          await doctorService.batchSlotOperations('switch_specialty', [conflictInfo.slotId], {
            new_specialty_id: selectedSpecialtyForSchedule,
            slot_time: conflictInfo.slotTime
          });
          break;
          
        case 'keep_existing':
          // Do nothing - keep existing slot
          break;
          
        case 'force_both':
          // Force enable both (not recommended)
          await handleToggleSlot(
            conflictInfo.slotId, 
            'CANCELLED_BY_CLINIC', // Force it to toggle to AVAILABLE
            conflictInfo.slotTime,
            conflictInfo.currentSpecialty,
            conflictInfo.currentClinic
          );
          break;
      }
      
      // Refresh availability slots
      // This should be handled by parent component
      
    } catch (error) {
      console.error('Error resolving conflict:', error);
      showError('Có lỗi xảy ra khi xử lý xung đột. Vui lòng thử lại.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle bulk toggle operations
  const handleBulkToggle = async (action, slotIds) => {
    try {
      setLoadingSlots(true);
      
      const operation = action === 'enable' ? 'enable_bulk' : 'disable_bulk';
      await doctorService.batchSlotOperations(operation, slotIds, {
        specialty_id: selectedSpecialtyForSchedule
      });
      
      // Refresh data would be handled by parent
      
    } catch (error) {
      console.error('Error in bulk operation:', error);
      showError('Có lỗi xảy ra khi thực hiện thao tác hàng loạt.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle auto generation
  const handleAutoGenerate = async (specialtyId, clinicId, settings) => {
    try {
      setAutoGenerating(true);
      
      // Ensure settings contains slotDuration
      const enhancedSettings = {
        ...settings,
        slotDuration: settings.slotDuration || 30
      };
      
      console.log('Auto generating with settings:', enhancedSettings);
      
      await handleGenerateSlotsFromWorkShifts(specialtyId, clinicId, enhancedSettings);
    } catch (error) {
      console.error('Error in auto generation:', error);
      throw error; // Let AutoGenerationPanel handle the error
    } finally {
      setAutoGenerating(false);
    }
  };

  // Hàm mới để tạo slot khi click vào ô trống
  const handleCreateSlot = async (slotData) => {
    if (!selectedSpecialtyForSchedule) {
      showWarning('Vui lòng chọn chuyên khoa trước khi tạo slot mới!');
      return;
    }
    
    try {
      const selectedSpecialty = specialties.find(s => s.specialty_id === selectedSpecialtyForSchedule);
      if (!selectedSpecialty) {
        throw new Error('Không tìm thấy thông tin chuyên khoa');
      }
      
      // Gọi API tạo slot mới thông qua hàm từ DoctorDashboardNew
      await handleCreateNewSlot({
        date: slotData.date,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        status: "AVAILABLE",
        specialty_id: selectedSpecialtyForSchedule,
        clinic_id: selectedSpecialty.clinic?.clinic_id
      });
      
    } catch (error) {
      console.error('Error creating new slot:', error);
      showError('Không thể tạo slot mới. Vui lòng thử lại sau!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">⏰ Quản lý lịch làm việc thông minh</h2>
            <p className="text-emerald-100 text-lg">
              Tự động tạo slots 30 phút dựa trên ca làm việc - Xử lý xung đột đa chuyên khoa
            </p>
          </div>
          
          <div className="hidden md:block">
            <Clock className="w-16 h-16 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">🚀 Tính năng nâng cao</h3>
              <p className="text-sm text-emerald-100">
                {specialties.length > 1 
                  ? "Đa chuyên khoa: Bật slot ở một khoa sẽ tự động tắt ở khoa khác" 
                  : "Đơn chuyên khoa: Slots được tạo theo ca làm việc phòng khám"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {specialties.length > 1 && (
                <div className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-300">
                  <span className="text-xs font-medium">
                    <Users className="w-3 h-3 inline mr-1" />
                    {specialties.length} chuyên khoa
                  </span>
                </div>
              )}
              <Info className="w-8 h-8 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              viewMode === 'calendar' 
                ? 'bg-white text-emerald-700 font-medium' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch làm việc</span>
          </button>
          
          <button
            onClick={() => setViewMode('generation')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              viewMode === 'generation' 
                ? 'bg-white text-emerald-700 font-medium' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Tự động tạo</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <>
          <SpecialtyTabBar 
            specialties={specialties}
            selectedSpecialty={selectedSpecialtyForSchedule}
            onSpecialtyChange={setSelectedSpecialtyForSchedule}
            slotCounts={slotCounts}
            loading={loadingWorkShifts}
          />
          <WeeklyCalendarView
            slots={availabilitySlots.filter(slot => 
              slot.specialty?.specialty_id === selectedSpecialtyForSchedule
            )}
            workShifts={workShifts}
            selectedSpecialty={selectedSpecialtyForSchedule}
            specialties={specialties}
            onSlotToggle={handleAdvancedToggleSlot}
            onBulkToggle={handleBulkToggle}
            loading={loadingSlots || autoGenerating}
            onCreateNewSlot={handleCreateSlot}
          />
        </>
      ) : (
        <AutoGenerationPanel
          workShifts={workShifts}
          selectedSpecialty={selectedSpecialtyForSchedule}
          specialties={specialties}
          onGenerate={handleAutoGenerate}
          loading={autoGenerating}
          lastGenerated={
            availabilitySlots
              .filter(slot => slot.specialty?.specialty_id === selectedSpecialtyForSchedule && slot.autoGenerated)
              .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]?.created_at
          }
        />
      )}

      {/* Enhanced Conflict Dialog */}
      <EnhancedSlotConflictDialog
        isOpen={showEnhancedConflictDialog}
        onClose={() => setShowEnhancedConflictDialog(false)}
        conflictInfo={enhancedConflictInfo}
        onResolve={handleEnhancedConflictResolve}
        onCancel={() => setShowEnhancedConflictDialog(false)}
      />

      {/* Loading Overlay */}
      {(autoGenerating || loadingWorkShifts) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {autoGenerating ? 'Đang tạo slots tự động...' : 'Đang tải ca làm việc...'}
              </h3>
              <p className="text-gray-600 text-sm">
                {autoGenerating 
                  ? 'Hệ thống đang tạo slots dựa trên ca làm việc của phòng khám' 
                  : 'Đang tải thông tin ca làm việc từ phòng khám'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
