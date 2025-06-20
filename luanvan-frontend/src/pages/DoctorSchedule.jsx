import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DoctorCalendar.css';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [standardShifts, setStandardShifts] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [filteredShifts, setFilteredShifts] = useState([]);
  const { isSignedIn } = useUser();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Tính ngày tối đa có thể đặt (1 tháng từ ngày hiện tại)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  // Khởi tạo standardShifts
  useEffect(() => {
    // Khởi tạo với mảng rỗng để tránh lỗi
    setStandardShifts([]);
  }, []);

  // Lấy thông tin bác sĩ và clinic
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const data = await apiService.getDoctorByUserId(doctorId);
        console.log('DEBUG dữ liệu bác sĩ nhận được (raw):', data);
        console.log('DEBUG dữ liệu bác sĩ nhận được (stringify):', JSON.stringify(data, null, 2));
        
        // Tạo dummy doctor nếu không nhận được dữ liệu hợp lệ
        if (!data) {
          console.error('API trả về dữ liệu bác sĩ rỗng');
          const dummyDoctor = {
            doctor_id: doctorId,
            user: {
              full_name: "Bác sĩ không xác định",
              email: "unknown@example.com",
              phone_number: "Chưa có thông tin" 
            },
            specialties: [],
            bio: "Chưa cập nhật thông tin",
            years_of_experience: 0
          };
          setDoctor(dummyDoctor);
          
          // Tạo dummy clinic
          const dummyClinic = {
            id: 1,
            name: "Phòng khám mặc định",
            address: "Chưa cập nhật địa chỉ",
            email: "info@clinic.com",
            phoneNumber: "0123456789",
            workingHours: "08:00 - 17:00"
          };
          setClinic(dummyClinic);
          return;
        }
        
        // Lưu dữ liệu bác sĩ
        setDoctor(data);
        
        // Kiểm tra tất cả thuộc tính của data để tìm clinic
        console.log('DEBUG kiểm tra các thuộc tính của data:', Object.keys(data));
        
        // Kiểm tra các dạng cấu trúc có thể có của clinic
        if (data.clinic && typeof data.clinic === 'object') {
          console.log('DEBUG: Tìm thấy clinic object trong data.clinic:', data.clinic);
          setClinic(data.clinic);
        } else if (data.clinic_id) {
          console.log('DEBUG: Tìm thấy clinic_id:', data.clinic_id);
          try {
            const clinicData = await apiService.getClinicById(data.clinic_id);
            console.log('DEBUG: Dữ liệu phòng khám từ getClinicById:', clinicData);
            if (clinicData) {
              setClinic(clinicData);
            } else {
              throw new Error("API trả về dữ liệu clinic rỗng");
            }
          } catch (clinicError) {
            console.error('Không thể lấy thông tin phòng khám:', clinicError);
            // Tạo dummy clinic
            const dummyClinic = {
              id: data.clinic_id || 1,
              name: "Phòng khám mặc định",
              address: "Chưa cập nhật địa chỉ",
              email: "info@clinic.com",
              phoneNumber: "0123456789",
              workingHours: "08:00 - 17:00"
            };
            setClinic(dummyClinic);
          }
        } else {
          // Kiểm tra thêm các trường hợp khác
          console.log('DEBUG: Không tìm thấy clinic trong data, kiểm tra thêm các trường khác');
          let found = false;
          
          for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
              console.log(`DEBUG: Kiểm tra thuộc tính ${key}:`, data[key]);
              // Kiểm tra xem object này có phải là clinic không
              if (data[key].name && (data[key].address || data[key].phoneNumber || data[key].email)) {
                console.log('DEBUG: Có thể đã tìm thấy clinic trong:', key, data[key]);
                setClinic(data[key]);
                found = true;
                break;
              }
            }
          }
          
          // Nếu vẫn không tìm thấy, tạo dummy clinic
          if (!found) {
            // Không hiển thị lỗi nữa mà chỉ log
            console.log('Sử dụng thông tin phòng khám mặc định');
            const dummyClinic = {
              id: 1,
              name: "Phòng khám mặc định",
              address: "Chưa cập nhật địa chỉ",
              email: "info@clinic.com",
              phoneNumber: "0123456789",
              workingHours: "08:00 - 17:00"
            };
            setClinic(dummyClinic);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin bác sĩ:', error);
        
        // Tạo dummy doctor và clinic trong trường hợp lỗi
        const dummyDoctor = {
          doctor_id: doctorId,
          user: {
            full_name: "Bác sĩ không xác định",
            email: "unknown@example.com",
            phone_number: "Chưa có thông tin" 
          },
          specialties: [],
          bio: "Chưa cập nhật thông tin",
          years_of_experience: 0
        };
        setDoctor(dummyDoctor);
        
        const dummyClinic = {
          id: 1,
          name: "Phòng khám mặc định",
          address: "Chưa cập nhật địa chỉ",
          email: "info@clinic.com",
          phoneNumber: "0123456789",
          workingHours: "08:00 - 17:00"
        };
        setClinic(dummyClinic);
      }
    };
    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && standardShifts.length > 0) {
      // Ensure we're working with a normalized date
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      const dayOfWeek = normalizedDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase();

      console.log('DEBUG dayOfWeek calculation:', {
        selectedDate: normalizedDate,
        dayOfWeek: dayOfWeek,
        standardShifts: standardShifts.map(s => ({
          day: s.day_of_week,
          name: s.shift_name
        }))
      });

      const filtered = standardShifts.filter(shift => {
        const shiftDay = shift.day_of_week?.trim().toUpperCase();
        console.log('DEBUG comparing shift:', {
          shiftDay: shiftDay,
          dayOfWeek: dayOfWeek,
          matches: shiftDay === dayOfWeek
        });
        return shiftDay === dayOfWeek;
      });

      console.log('DEBUG filteredShifts after filtering:', filtered);
      setFilteredShifts(filtered);
    } else {
      setFilteredShifts([]);
    }
  }, [selectedDate, standardShifts]);

  // Lấy các slot khả dụng của bác sĩ theo ngày
  const fetchAvailableSlots = async (date) => {
    if (!date || !doctorId) return;
    setSlotLoading(true);
    try {
      // Chuyển đổi ngày sang UTC để tránh sai lệch timezone
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const formattedDate = utcDate.toISOString().split('T')[0];
      
      console.log('DEBUG fetchAvailableSlots - Input date:', date);
      console.log('DEBUG fetchAvailableSlots - Formatted date:', formattedDate);
      const response = await apiService.getAvailableSlots(doctorId, formattedDate);
      console.log('DEBUG API response - Full data:', JSON.stringify(response, null, 2));

      setSlots(response || []);
    } catch (error) {
      console.error('ERROR fetchAvailableSlots:', error);
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  // Khi chọn ngày
  const handleDateSelect = (date) => {
    // Normalize the date to midnight in the local timezone
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    setSelectedDate(normalizedDate);
    setSelectedSlot(null);
    fetchAvailableSlots(normalizedDate);
  };

  // Khi chọn slot
  const handleSlotSelect = async (slot) => {
    if (!isSignedIn) {
      localStorage.setItem('pendingBooking', JSON.stringify({
        slotId: slot.slot_id,
        date: selectedDate,
        doctorId: doctorId
      }));
      navigate('/sign-in', { state: { from: window.location.pathname } });
      return;
    }
    
    // Chuyển hướng đến trang nhập thông tin bệnh nhân để đặt lịch
    navigate(`/book-appointment-details`, { 
      state: { 
        slotData: slot,
        doctorData: doctor,
        clinicData: clinic,
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

  // Tính ngày trong tuần từ selectedDate
  const dayOfWeekMap = [
    'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
  ];
  const selectedDayOfWeek = selectedDate ? dayOfWeekMap[selectedDate.getDay()] : null;

  // Log để debug
  console.log('selectedDate:', selectedDate);
  console.log('selectedDayOfWeek:', selectedDayOfWeek);
  console.log('standardShifts:', standardShifts);
  console.log('filteredShifts:', filteredShifts);

  if (!doctorId) {
    return <div className="text-center text-red-500 font-bold mt-8">Không tìm thấy bác sĩ (doctorId).</div>;
  }
  
  if (!doctor) {
    return <div className="text-center font-bold mt-8">Đang tải thông tin bác sĩ...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Thông tin bác sĩ và phòng khám */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {doctor ? (
              <>
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {doctor.user?.full_name?.charAt(0) || 'BS'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-1">{doctor.user?.full_name}</h3>
                <p className="text-center text-gray-600 mb-2">{doctor.specialties?.map(s => s.name).join(', ')}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Email:</b> {doctor.user?.email}</p>
                <p className="text-sm text-gray-600 mb-1"><b>SĐT:</b> {doctor.user?.phone_number || 'Chưa cập nhật'}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Kinh nghiệm:</b> {doctor.years_of_experience} năm</p>
                <p className="text-sm text-gray-600"><b>Tiểu sử:</b> {doctor.bio}</p>
              </>
            ) : <div>Đang tải thông tin bác sĩ...</div>}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {clinic ? (
              <>
                <h4 className="text-base font-semibold mb-2 text-blue-700">{clinic.name}</h4>
                <p className="text-sm text-gray-600 mb-1"><b>Địa chỉ:</b> {clinic.address}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Email:</b> {clinic.email}</p>
                <p className="text-sm text-gray-600 mb-1"><b>SĐT:</b> {clinic.phoneNumber}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Giờ làm việc:</b> {clinic.workingHours}</p>
              </>
            ) : <div>Đang tải thông tin phòng khám...</div>}
          </div>
        </div>
        {/* Lịch và giờ */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center font-semibold text-lg mb-2 text-white bg-[#00cfff] rounded-t-lg shadow-sm py-2 border border-b-0 border-[#00cfff]">
              Vui lòng chọn ngày khám
              <div className="text-sm font-normal mt-1">
                (Chỉ được đặt lịch trong vòng 1 tháng)
              </div>
            </div>
            <div>
              <Calendar
                minDate={tomorrow}
                maxDate={maxDate}
                onChange={handleDateSelect}
                value={selectedDate}
                className="w-full border-0 shadow-none"
                tileClassName={({ date }) => {
                  return "calendar-tile";
                }}
                tileDisabled={({ date }) => {
                  // Disable dates in the past, and dates outside the allowed range
                  return date < tomorrow || date > maxDate;
                }}
              />
            </div>
            {/* Hiển thị các khung giờ khám */}
            <div className="mt-4">
              {selectedDate ? (
                <div>
                  <h3 className="text-base font-semibold mb-3">
                    {selectedDate.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  
                  {slotLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2">Đang tải các khung giờ khám...</p>
                    </div>
                  ) : (
                    <div>
                      {slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                          {slots.map((slot) => (
                            <button
                              key={slot.slot_id}
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`py-2 px-3 rounded text-center text-sm ${
                                slot.available
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border border-dashed border-gray-300 rounded">
                          <p className="text-gray-500 mb-2">
                            Không có khung giờ khám vào ngày này
                          </p>
                          <p className="text-sm text-gray-400">
                            Vui lòng chọn ngày khác hoặc liên hệ phòng khám
                          </p>
                        </div>
                      )}
                      
                      {filteredShifts.length > 0 && slots.length === 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Ca làm việc của bác sĩ:</h4>
                          <div className="text-xs text-gray-600">
                            {filteredShifts.map((shift, index) => (
                              <div key={index} className="mb-1">
                                • {shift.shift_name}: {shift.start_time} - {shift.end_time}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded">
                  <p className="text-gray-500">Vui lòng chọn ngày để xem lịch khám</p>
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