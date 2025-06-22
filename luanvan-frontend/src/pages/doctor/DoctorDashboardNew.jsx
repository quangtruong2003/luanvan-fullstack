import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { doctorService } from '../../services/api';
import { useNotification } from '../../components/NotificationSystem';

// Import components
import {
  DoctorSidebar,
  DashboardOverview,
  AppointmentManagement,
  ScheduleManagement,
  AppointmentDetailsModal,
  SlotConflictModal,
  DoctorProfileManagement
} from './components';
import DebugInfo from './components/DebugInfo';

const DoctorDashboardNew = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule'); // Mặc định là tab lịch hẹn nổi bật nhất
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showSlotConflictDialog, setShowSlotConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [selectedSpecialtyForSchedule, setSelectedSpecialtyForSchedule] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [doctorName, setDoctorName] = useState('Bác sĩ');
  const [showDebug, setShowDebug] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Parallel API calls
      const [appointmentsRes, specialtiesRes, slotsRes] = await Promise.all([
        doctorService.getMyAppointments(),
        doctorService.getMySpecialties(),
        doctorService.getMyAvailabilitySlots()
      ]);
      
      const appointmentList = appointmentsRes.content || appointmentsRes || [];
      const specialtiesList = specialtiesRes || [];
      
      // Xử lý dữ liệu slots từ database, đảm bảo đúng định dạng
      let slots = slotsRes.content || slotsRes || [];
      slots = slots.map(slot => ({
        ...slot,
        // Đảm bảo date có định dạng YYYY-MM-DD
        date: slot.date ? new Date(slot.date).toISOString().split('T')[0] : null,
        // Đảm bảo status có giá trị
        status: slot.status || 'CANCELLED_BY_CLINIC'
      }));
      
      setAppointments(appointmentList);
      setSpecialties(specialtiesList);
      setAvailabilitySlots(slots);
      
      // Get doctor name from profile
      try {
        const profile = await doctorService.getMyProfile();
        if (profile && profile.user) {
          setDoctorName(profile.user.fullName || profile.user.full_name || 'Bác sĩ');
        }
      } catch (error) {
        console.warn('Không thể lấy tên bác sĩ:', error);
        setDoctorName('Bác sĩ');
      }
      
      // Auto-select specialty based on conditions
      if (!selectedSpecialtyForSchedule) {
        if (specialtiesList.length === 1) {
          // Single specialty: auto-select
          const specialtyId = specialtiesList[0].specialty_id || specialtiesList[0].specialtyId;
          console.log('🎯 Auto-selecting single specialty:', specialtyId);
          setSelectedSpecialtyForSchedule(specialtyId);
        } else if (specialtiesList.length > 1) {
          // Multiple specialties: select primary or first
          const primarySpecialty = specialtiesList.find(s => s.is_primary);
          if (primarySpecialty) {
            const specialtyId = primarySpecialty.specialty_id || primarySpecialty.specialtyId;
            console.log('🎯 Auto-selecting primary specialty:', specialtyId);
            setSelectedSpecialtyForSchedule(specialtyId);
          } else {
            const specialtyId = specialtiesList[0].specialty_id || specialtiesList[0].specialtyId;
            console.log('🎯 Auto-selecting first specialty:', specialtyId);
            setSelectedSpecialtyForSchedule(specialtyId);
          }
        }
      }
        
        // Calculate stats
        const today = new Date().toDateString();
      const todayAppointments = appointmentList.filter(apt => 
        new Date(apt.appointment_date_time).toDateString() === today
      );
        
        setStats({
        todayAppointments: todayAppointments.length,
        totalAppointments: appointmentList.length,
        completedAppointments: appointmentList.filter(apt => apt.status === 'COMPLETED').length,
        cancelledAppointments: appointmentList.filter(apt => apt.status?.startsWith('CANCELLED')).length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Handle specific authentication errors
      if (error.message.includes('Dữ liệu xác thực không hợp lệ') || 
          error.message.includes('User not found') ||
          error.message.includes('Không tìm thấy thông tin bác sĩ')) {
        // Show user-friendly error and redirect to login
        showError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục.');
        
        // Clear localStorage and redirect
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      
      // For other errors, show generic message
      showError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialtyForSchedule, showError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTab('dashboard');
            break;
          case '2':
            event.preventDefault();
            setActiveTab('appointments');
            break;
          case '3':
            event.preventDefault();
            setActiveTab('schedule');
            break;
          case '4':
            event.preventDefault();
            setActiveTab('patients');
            break;
          case '5':
            event.preventDefault();
            setActiveTab('articles');
            break;
          case '6':
            event.preventDefault();
            setActiveTab('profile');
            break;
          case 'r':
            event.preventDefault();
            fetchDashboardData();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fetchDashboardData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Xem chi tiết lịch hẹn
  const handleViewAppointmentDetails = async (appointmentId) => {
    try {
      const details = await doctorService.getAppointmentDetails(appointmentId);
      setSelectedAppointment(details);
      setShowAppointmentDetails(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      // Show error notification instead of alert
      const errorMessage = error.response?.data?.message || 'Không thể tải thông tin lịch hẹn. Vui lòng thử lại!';
      showError(errorMessage);
    }
  };

  // Cập nhật trạng thái lịch hẹn
  const handleUpdateAppointmentStatus = async (appointmentId, status, notes = '') => {
    try {
      await doctorService.updateMyAppointmentStatus(appointmentId, { 
        status: status, 
        cancellation_reason: notes 
      });
      // Refresh data
      await fetchDashboardData();
      setShowAppointmentDetails(false);
      // Show success notification
      showSuccess('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại!';
      showError(errorMessage);
    }
  };
  // Bật/tắt slot và xử lý xung đột
  const handleToggleSlot = useCallback(async (slotId, currentStatus, slotTime = null) => {
    try {
      setLoadingSlots(true);
      const isAvailable = currentStatus !== 'AVAILABLE';
      
      console.log('🔄 Toggling slot:', { slotId, currentStatus, slotTime, isAvailable });
      
      await doctorService.toggleSlotAvailability(slotId, isAvailable);
      
      // Refresh data
      await fetchDashboardData();
      
      showSuccess(`Đã ${isAvailable ? 'bật' : 'tắt'} slot thành công!`);
    } catch (error) {
      console.error('Error toggling slot:', error);
      showError('Không thể cập nhật slot. Vui lòng thử lại!');
    } finally {
      setLoadingSlots(false);
    }
  }, [showSuccess, showError, fetchDashboardData]);

  // Xử lý xác nhận conflict
  const handleConfirmSlotConflict = useCallback(async () => {
    if (!conflictInfo) return;
    
    try {
      // Toggle the slot with force enable
      await doctorService.toggleSlotAvailability(conflictInfo.slotId, true);
      
      // Refresh slots to reflect changes
      await fetchDashboardData();
      
      setShowSlotConflictDialog(false);
      setConflictInfo(null);
      
      // Success notification
      showSuccess(`Đã bật slot ${conflictInfo.slotTime} cho ${conflictInfo.currentSpecialty}! Slot cùng giờ ở chuyên khoa khác đã được tự động tắt.`);
    } catch (error) {
      console.error('Error resolving slot conflict:', error);
      showError('Không thể cập nhật slot. Vui lòng thử lại!');
    }
  }, [conflictInfo, showSuccess, showError]);

  // Tạo slots từ work shifts
  const handleGenerateSlotsFromWorkShifts = useCallback(async (payload) => {
    try {
      setLoadingSlots(true);
      
      // Xử lý cả format cũ và mới
      let requestData;
      if (typeof payload === 'object' && payload.specialtyId) {
        // Format mới: payload là object hoàn chỉnh
        requestData = {
          specialtyId: payload.specialtyId,
          clinicId: payload.clinicId,
          startDate: payload.startDate,
          endDate: payload.endDate,
          slotDurationMinutes: payload.slotDuration || 30,
          overwrite: payload.overwrite || true,
          workShiftFilter: payload.workShiftFilter || 'all'
        };
      } else {
        // Format cũ: legacy support
        const [specialtyId, clinicId, dateRange] = arguments;
        requestData = {
          specialtyId: specialtyId,
          clinicId: clinicId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          slotDurationMinutes: dateRange.slotDuration || 30,
          overwrite: true,
          workShiftFilter: 'all'
        };
      }
      
      console.log('🚀 Generating slots with payload:', requestData);
      
      await doctorService.generateSlotsFromWorkShifts(requestData);
      
      // Refresh data
      await fetchDashboardData();
      
      showSuccess('Tạo lịch làm việc thành công!');
    } catch (error) {
      console.error('Error generating slots:', error);
      showError('Không thể tạo lịch làm việc. Vui lòng thử lại!');
    } finally {
      setLoadingSlots(false);
    }
  }, [showSuccess, showError]);
  // Hàm mới để tạo slot mới khi click vào ô trống
  const handleCreateNewSlot = useCallback(async (slotData) => {
    try {
      setLoadingSlots(true);
      
      const doctorInfo = await doctorService.getMyProfile();
      
      // Get current selected specialty info
      const currentSpecialty = specialties.find(s => 
        (s.specialtyId || s.specialty_id) === selectedSpecialtyForSchedule
      );
      
      if (!currentSpecialty) {
        showError('Vui lòng chọn chuyên khoa trước khi tạo slot.');
        return;
      }
      
      const clinicId = currentSpecialty.clinic?.clinicId || currentSpecialty.clinic?.clinic_id;
      const specialtyId = currentSpecialty.specialtyId || currentSpecialty.specialty_id;
      
      if (!clinicId) {
        showError('Không tìm thấy thông tin phòng khám cho chuyên khoa này.');
        return;
      }
      
      const payload = {
        ...slotData,
        doctorId: doctorInfo.doctorId || doctorInfo.doctor_id,
        clinicId: clinicId,
        specialtyId: specialtyId,
        status: 'AVAILABLE'
      };
      
      console.log('Creating new slot with payload:', payload);

      // Ghi đè tuyệt đối: Tạo slot trước, server sẽ tự động xử lý conflict
      await doctorService.createMyAvailabilitySlot(payload);
      
      // Refresh slots
      await fetchDashboardData();
      showSuccess('Đã tạo slot mới thành công!');
      
    } catch (error) {
      console.error('Error creating new slot:', error);
      showError('Không thể tạo slot mới. Vui lòng thử lại!', 'Lỗi');
    } finally {
      setLoadingSlots(false);
    }
  }, [showSuccess, showError, specialties, selectedSpecialtyForSchedule]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'CANCELLED_BY_PATIENT':
      case 'CANCELLED_BY_CLINIC':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_PAYMENT': return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
      case 'CANCELLED_BY_PATIENT':
      case 'CANCELLED_BY_CLINIC':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <AppointmentManagement 
            appointments={appointments}
            stats={stats}
            setActiveTab={setActiveTab}
            handleViewAppointmentDetails={handleViewAppointmentDetails}
          />
        );
      case 'schedule':        
        return (
          <ScheduleManagement 
            specialties={specialties}
            selectedSpecialtyForSchedule={selectedSpecialtyForSchedule}
            setSelectedSpecialtyForSchedule={setSelectedSpecialtyForSchedule}
            handleGenerateSlotsFromWorkShifts={handleGenerateSlotsFromWorkShifts}
            handleToggleSlot={handleToggleSlot}
            handleCreateNewSlot={handleCreateNewSlot}
            refetchData={fetchDashboardData}
          />
        );
      case 'patients':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bệnh nhân</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'articles':
        return <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-semibold">Quản lý bài viết</h2><p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p></div>;
      case 'profile':
        return <DoctorProfileManagement />;
      default:
        return <DashboardOverview stats={stats} loading={loading} />;
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bảng điều khiển Bác sĩ
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Xin chào, <span className="font-medium">{doctorName}</span>
                </span>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                  title="Tải lại dữ liệu (Ctrl+R)"
                >
                  <Clock className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex space-x-6">
          {/* Sidebar Navigation */}          <DoctorSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
            availabilitySlots={availabilitySlots}
            doctorName={doctorName}
          />

      {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppointmentDetailsModal
        showAppointmentDetails={showAppointmentDetails}
        selectedAppointment={selectedAppointment}
        setShowAppointmentDetails={setShowAppointmentDetails}
        handleUpdateAppointmentStatus={handleUpdateAppointmentStatus}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />
      <SlotConflictModal
        showSlotConflictDialog={showSlotConflictDialog}
        conflictInfo={conflictInfo}
        setShowSlotConflictDialog={setShowSlotConflictDialog}
        setConflictInfo={setConflictInfo}
        handleConfirmSlotConflict={handleConfirmSlotConflict}
      />

      {/* Debug Info (only in development or when needed) */}
      <DebugInfo 
        show={showDebug}
        onToggle={() => setShowDebug(!showDebug)}
      />

    </div>
  );
};

export default DoctorDashboardNew;
