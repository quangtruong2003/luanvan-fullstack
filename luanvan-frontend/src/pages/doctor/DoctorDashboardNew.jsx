import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
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

  const { showSuccess, showError, showWarning } = useNotification();

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
  const handleToggleSlot = useCallback(async (slotId, currentStatus, slotTime) => {
    try {
      setLoadingSlots(true);
      const newStatus = currentStatus === 'AVAILABLE' ? 'CANCELLED_BY_CLINIC' : 'AVAILABLE';
      
      await doctorService.updateMyAvailabilitySlot(slotId, { status: newStatus });
      
      // Refresh data
      const slotsRes = await doctorService.getMyAvailabilitySlots();
      setAvailabilitySlots(slotsRes.content || slotsRes || []);
      
      showSuccess(`Đã ${newStatus === 'AVAILABLE' ? 'bật' : 'tắt'} slot thành công!`);
    } catch (error) {
      console.error('Error toggling slot:', error);
      showError('Không thể cập nhật slot. Vui lòng thử lại!');
    } finally {
      setLoadingSlots(false);
    }
  }, [showSuccess, showError]);

  // Xử lý xác nhận conflict
  const handleConfirmSlotConflict = useCallback(async () => {
    if (!conflictInfo) return;
    
    try {
      // Toggle the slot with force enable
      await doctorService.toggleSlotAvailability(conflictInfo.slotId, true);
      
      // Refresh slots to reflect changes
      const slotsRes = await doctorService.getMyAvailabilitySlots();
      setAvailabilitySlots(slotsRes.content || slotsRes || []);
      
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
  const handleGenerateSlotsFromWorkShifts = useCallback(async (specialtyId, clinicId, dateRange) => {
    try {
      setLoadingSlots(true);
      
      console.log('Generating slots with specialtyId:', specialtyId);
      
      await doctorService.createBulkSlotsFromWorkShifts({
        specialtyId: specialtyId,
        clinicId: clinicId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        slotDurationMinutes: dateRange.slotDuration || 30
      });
      
      // Refresh data
      const slotsRes = await doctorService.getMyAvailabilitySlots();
      setAvailabilitySlots(slotsRes.content || slotsRes || []);
      
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
      
      const payload = {
        ...slotData,
        doctorId: doctorInfo.doctorId || doctorInfo.doctor_id,
        status: 'AVAILABLE'
      };
      
      console.log('Creating new slot with payload:', payload);

      // Backend DTO uses camelCase, so we ensure it here.
      const apiPayload = {
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: payload.status,
        doctorId: payload.doctorId,
        clinicId: payload.clinic_id,
        specialtyId: payload.specialty_id
      };

      await doctorService.createMyAvailabilitySlot(apiPayload);
      
      // Refresh slots
      const slotsRes = await doctorService.getMyAvailabilitySlots();
      setAvailabilitySlots(slotsRes.content || slotsRes || []);
      showSuccess('Đã tạo slot mới thành công!');
      
    } catch (error) {
      console.error('Error creating new slot:', error);
      showError('Không thể tạo slot mới. Vui lòng thử lại!', 'Lỗi');
    } finally {
      setLoadingSlots(false);
    }
  }, [showSuccess, showError]);

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
            availabilitySlots={availabilitySlots}
            loadingSlots={loadingSlots}
            handleGenerateSlotsFromWorkShifts={handleGenerateSlotsFromWorkShifts}
            handleToggleSlot={handleToggleSlot}
            setShowSlotConflictDialog={setShowSlotConflictDialog}
            setConflictInfo={setConflictInfo}
            handleCreateNewSlot={handleCreateNewSlot}
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
        {/* Header Welcome */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    👋 Chào mừng quay trở lại, {doctorName}!
                </h1>
                  <p className="text-gray-600 mt-1">
                    Hôm nay bạn có <span className="font-semibold text-blue-600">{stats.todayAppointments}</span> lịch hẹn
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Clickable Avatar */}
              <button
                  onClick={() => setActiveTab('profile')}
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Xem hồ sơ cá nhân"
                >
                  <span className="text-lg font-semibold">
                    {(doctorName.split(' ').map(word => word[0]).join('').slice(0, 2) || 'BS').toUpperCase()}
                  </span>
              </button>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  title="Tải lại dữ liệu (Ctrl+R)"
                >
                  <Clock className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
                <div className="hidden md:block">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
            })}
          </div>
        </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Sidebar Navigation */}
          <DoctorSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
            availabilitySlots={availabilitySlots}
            handleLogout={handleLogout}
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
