import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DoctorCalendar.css';
import { useAuth } from '../context/AuthContext';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Calendar as LucideCalendar, Clock, User, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const formatWorkingHours = (shifts) => {
  if (!shifts || shifts.length === 0) {
    return 'Chưa cập nhật';
  }

  const dayMap = {
    MONDAY: 'Thứ 2', TUESDAY: 'Thứ 3', WEDNESDAY: 'Thứ 4',
    THURSDAY: 'Thứ 5', FRIDAY: 'Thứ 6', SATURDAY: 'Thứ 7', SUNDAY: 'CN'
  };
  const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  // Group shifts by time range (e.g., "08:00 - 12:00")
  const shiftsByTime = shifts.reduce((acc, shift) => {
    const startTime = (shift.startTime || shift.start_time)?.substring(0, 5);
    const endTime = (shift.endTime || shift.end_time)?.substring(0, 5);
    if (!startTime || !endTime) return acc;
    
    const timeRange = `${startTime} - ${endTime}`;
    if (!acc[timeRange]) {
      acc[timeRange] = [];
    }
    acc[timeRange].push(shift.dayOfWeek || shift.day_of_week);
    return acc;
  }, {});

  // Format each group into a string like "Thứ 2 - Thứ 6: 08:00 - 17:00"
  const formattedStrings = Object.entries(shiftsByTime).map(([timeRange, days]) => {
    if (days.length === 0) return '';
    
    // Sort days chronologically
    days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    // Group consecutive days
    const dayGroups = [];
    if (days.length > 0) {
      let currentGroup = [days[0]];
      for (let i = 1; i < days.length; i++) {
        if (dayOrder.indexOf(days[i]) === dayOrder.indexOf(days[i-1]) + 1) {
          currentGroup.push(days[i]);
        } else {
          dayGroups.push(currentGroup);
          currentGroup = [days[i]];
        }
      }
      dayGroups.push(currentGroup);
    }

    const dayString = dayGroups.map(group => {
      if (group.length > 2) { // Show range for 3 or more consecutive days
        return `${dayMap[group[0]]} - ${dayMap[group[group.length - 1]]}`;
      }
      return group.map(day => dayMap[day]).join(', '); // List individual days
    }).join(', ');
    
    return `${dayString}: ${timeRange}`;
  });

  return formattedStrings.join('; ');
};

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [workShifts, setWorkShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [minimumAdvanceBookingDays, setMinimumAdvanceBookingDays] = useState(1);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load admin settings to get minimum advance booking days
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const adminSettings = JSON.parse(savedSettings);
        if (adminSettings.general?.minimumAdvanceBookingDays !== undefined) {
          setMinimumAdvanceBookingDays(adminSettings.general.minimumAdvanceBookingDays);
        }
      }
    } catch (error) {
      console.warn('Failed to load admin settings for minimum booking days:', error);
    }
  }, []);

  // Calculate the minimum bookable date based on admin setting
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minimumAdvanceBookingDays);
  minDate.setHours(0, 0, 0, 0);

  // Calculate the maximum bookable date (1 month from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  // Fetch doctor and clinic info
  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        const data = await apiService.getDoctorByUserId(doctorId);
        console.log('DEBUG doctor data received (raw):', data);
        console.log('DEBUG doctor specialties:', data.specialties);
        setDoctor(data);
        
        let foundClinic = null;
        let clinicId = null;
        
        // Try multiple approaches to find clinic
        if (data.clinic && typeof data.clinic === 'object') {
            foundClinic = data.clinic;
            clinicId = data.clinic.clinicId || data.clinic.clinic_id || data.clinic.id;
            console.log('Found clinic in data.clinic:', foundClinic, 'clinicId:', clinicId);
        } else if (data.specialties && data.specialties.length > 0) {
            // Check if clinic is in first specialty
            const firstSpecialty = data.specialties[0];
            console.log('DEBUG first specialty:', firstSpecialty);
            
            if (firstSpecialty.clinic) {
                foundClinic = firstSpecialty.clinic;
                clinicId = firstSpecialty.clinic.clinicId || firstSpecialty.clinic.clinic_id || firstSpecialty.clinic.id;
                console.log('Found clinic in specialty.clinic:', foundClinic, 'clinicId:', clinicId);
            } else if (firstSpecialty.clinicId || firstSpecialty.clinic_id) {
                clinicId = firstSpecialty.clinicId || firstSpecialty.clinic_id;
                console.log('Found clinicId in specialty:', clinicId);
                try {
                  foundClinic = await apiService.getClinicById(clinicId);
                } catch (clinicError) {
                  console.error('Error fetching clinic by specialty clinicId:', clinicError);
                }
            }
        } else if (data.clinic_id || data.clinicId) {
            clinicId = data.clinic_id || data.clinicId;
            console.log('Found clinicId directly:', clinicId);
            try {
              foundClinic = await apiService.getClinicById(clinicId);
            } catch (clinicError) {
              console.error('Error fetching clinic by direct clinicId:', clinicError);
            }
        }
        
        if (foundClinic && clinicId) {
            setClinic(foundClinic);
            // Fetch work shifts for the clinic
            try {
              console.log('🔍 Fetching work shifts for clinicId:', clinicId);
              console.log('🔍 Clinic object:', foundClinic);
              console.log('🔍 API URL will be:', `${apiService.API_BASE_URL || 'http://localhost:9090/api'}/standard-work-shifts/clinic/${clinicId}`);
              
              const shifts = await apiService.getStandardWorkShiftsByClinic(clinicId);
              console.log('✅ Raw API response:', shifts);
              console.log('✅ Response type:', typeof shifts);
              console.log('✅ Is array?', Array.isArray(shifts));
              
              if (shifts && Array.isArray(shifts)) {
                console.log('✅ Setting work shifts:', shifts.length, 'items');
                shifts.forEach((shift, index) => {
                  console.log(`  Shift ${index}:`, {
                    dayOfWeek: shift.dayOfWeek || shift.day_of_week,
                    startTime: shift.startTime || shift.start_time,
                    endTime: shift.endTime || shift.end_time,
                    clinicId: shift.clinicId || shift.clinic_id
                  });
                });
                setWorkShifts(shifts);
              } else if (shifts && shifts.data && Array.isArray(shifts.data)) {
                console.log('✅ Setting work shifts from .data property:', shifts.data.length, 'items');
                setWorkShifts(shifts.data);
              } else {
                console.warn('⚠️ Unexpected shifts format:', shifts);
                setWorkShifts([]);
              }
            } catch (shiftError) {
              console.error("❌ Error fetching work shifts:", shiftError);
              console.error("❌ Error details:", {
                message: shiftError.message,
                status: shiftError.status,
                response: shiftError.response
              });
              setWorkShifts([]);
            }
        } else {
            console.warn('⚠️ Could not find clinic info or clinicId');
            console.log('Debug clinic search results:', {
              foundClinic,
              clinicId,
              'data.clinic': data.clinic,
              'data.specialties': data.specialties,
              'data.clinic_id': data.clinic_id,
              'data.clinicId': data.clinicId
            });
            setClinic({
              id: 1, name: "Phòng khám mặc định", address: "Chưa cập nhật địa chỉ",
              email: "info@clinic.com", phoneNumber: "0123456789"
            });
            setWorkShifts([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin bác sĩ:', error);
        setDoctor({ user: { full_name: "Bác sĩ không xác định" } });
        setClinic({ name: "Phòng khám không xác định" });
        setWorkShifts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
  }, [doctorId]);

  // Fetch available slots for the doctor by date
  const fetchAvailableSlots = async (date) => {
    if (!date || !doctorId) return;
    setSlotLoading(true);
    try {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const formattedDate = utcDate.toISOString().split('T')[0];
      const response = await apiService.getAvailableSlots(doctorId, formattedDate);
      setSlots(response || []);
    } catch (error) {
      console.error('ERROR fetchAvailableSlots:', error);
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  // When a date is selected
  const handleDateSelect = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);
    fetchAvailableSlots(normalizedDate);
  };

  // When a slot is selected
  const handleSlotSelect = (slot) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    navigate('/book-appointment-details', {
      state: {
        slotData: slot,
        doctorData: doctor,
        date: selectedDate.toISOString().split('T')[0]
      }
    });
  };

  useEffect(() => {
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking && isAuthenticated) {
      const bookingData = JSON.parse(pendingBooking);
      localStorage.removeItem('pendingBooking');
      navigate(`/book-appointment/doctor/${bookingData.doctorId}`, {
        state: { bookingData }
      });
    }
  }, [isAuthenticated, navigate]);

  // Modern tile class name with better styling
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tileDate = new Date(date);
    tileDate.setHours(0, 0, 0, 0);
    
    let classes = 'calendar-tile ';
    
    // Past date styling
    if (tileDate.getTime() < today.getTime()) {
      classes += 'calendar-tile-past ';
    }
    
    // Today styling (takes priority over past)
    if (tileDate.getTime() === today.getTime()) {
      classes += 'calendar-tile-today ';
    }
    
    // Selected date styling (takes priority over all)
    if (selectedDate && tileDate.getTime() === selectedDate.getTime()) {
      classes += 'calendar-tile-selected ';
    }
    
    // Weekend styling (applies if not selected and not today)
    if ((tileDate.getDay() === 0 || tileDate.getDay() === 6) && 
        tileDate.getTime() !== today.getTime() && 
        (!selectedDate || tileDate.getTime() !== selectedDate.getTime())) {
      classes += 'calendar-tile-weekend ';
    }
    
    return classes.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
        </div>
      </div>
    );
  }
  
  if (!doctorId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 bg-red-50 p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Lỗi</h2>
          <p>Không tìm thấy thông tin bác sĩ</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch khám bệnh</h1>
          <p className="text-gray-600">Chọn ngày và giờ phù hợp với lịch trình của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor and Clinic Info - Modern Card Design */}
          <div className="lg:col-span-1 space-y-6">
            {/* Doctor Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {doctor?.user?.full_name?.charAt(0) || 'BS'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{doctor?.user?.full_name || 'Bác sĩ không xác định'}</h3>
                    <p className="text-blue-100">{doctor?.specialties?.map(s => s.name).join(', ') || 'Chuyên khoa chung'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{doctor?.user?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điện thoại</p>
                    <p className="text-gray-900">{doctor?.user?.phone_number || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kinh nghiệm</p>
                    <p className="text-gray-900">{doctor?.years_of_experience || 0} năm</p>
                  </div>
                </div>
                
                {doctor?.bio && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Tiểu sử</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{doctor.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clinic Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                <h4 className="text-lg font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {clinic?.name || clinic?.clinic_name || 'Phòng khám'}
                </h4>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="text-gray-900 text-sm">{clinic?.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 text-sm">{clinic?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điện thoại</p>
                    <p className="text-gray-900 text-sm">{clinic?.phoneNumber || clinic?.phone_number || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giờ làm việc</p>
                    <p className="text-gray-900 text-sm leading-relaxed">{formatWorkingHours(workShifts)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Slots - Modern Design */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold mb-2">Chọn ngày khám</h2>
                <p className="text-indigo-100 text-sm">
                  {minimumAdvanceBookingDays === 0 
                    ? 'Có thể đặt lịch từ hôm nay, trong vòng 1 tháng'
                    : `Phải đặt trước ít nhất ${minimumAdvanceBookingDays} ngày, trong vòng 1 tháng`
                  }
                </p>
              </div>
              
              {/* Calendar */}
              <div className="p-6">
                <Calendar
                  minDate={minDate}
                  maxDate={maxDate}
                  onChange={handleDateSelect}
                  value={selectedDate}
                  className="w-full border-0 shadow-none modern-calendar"
                  tileClassName={getTileClassName}
                  tileDisabled={({ date }) => date < minDate || date > maxDate}
                  locale="vi-VN"
                  formatShortWeekday={(locale, date) => {
                    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                    return weekdays[date.getDay()];
                  }}
                  formatMonthYear={(locale, date) => {
                    return `tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
                  }}
                  showNeighboringMonth={false}
                  calendarType="iso8601"
                />
              </div>
              
              {/* Time Slots */}
              {selectedDate && (
                <div className="border-t border-gray-100 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Chọn giờ khám
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {selectedDate.toLocaleDateString('vi-VN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {slotLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải các khung giờ khám...</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {slots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {slots.map((slot) => (
                            <button
                              key={slot.slot_id}
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                slot.available
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-semibold">
                                  {slot.start_time.substring(0, 5)}
                                </div>
                                <div className="text-xs opacity-90">
                                  {slot.end_time.substring(0, 5)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch khám</h3>
                          <p className="text-gray-500 mb-4">Không có khung giờ khám vào ngày này</p>
                          <p className="text-sm text-gray-400">Vui lòng chọn ngày khác hoặc liên hệ phòng khám</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Instructions when no date selected */}
              {!selectedDate && (
                <div className="border-t border-gray-100 p-6">
                  <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h12M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H3a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn ngày khám</h3>
                    <p className="text-gray-600">Vui lòng chọn ngày trên lịch để xem các khung giờ khám có sẵn</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule; 