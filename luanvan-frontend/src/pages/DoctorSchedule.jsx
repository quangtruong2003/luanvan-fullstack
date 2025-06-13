import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DoctorCalendar.css';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getDoctorById(doctorId);
        setDoctor(response);
      } catch (err) {
        setError('Không thể tải thông tin bác sĩ');
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  // Tính ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Thông tin bác sĩ */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : doctor ? (
              <>
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {doctor?.user?.full_name?.charAt(0) || 'BS'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-1">{doctor?.user?.full_name}</h3>
                <p className="text-center text-gray-600 mb-2">{doctor?.specialties?.map(s => s.name).join(', ')}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Email:</b> {doctor?.user?.email}</p>
                <p className="text-sm text-gray-600 mb-1"><b>SĐT:</b> {doctor?.user?.phone_number || 'Chưa cập nhật'}</p>
                <p className="text-sm text-gray-600 mb-1"><b>Kinh nghiệm:</b> {doctor?.years_of_experience} năm</p>
                <p className="text-sm text-gray-600"><b>Tiểu sử:</b> {doctor?.bio}</p>
              </>
            ) : null}
          </div>
        </div>
        {/* Calendar chọn ngày */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center font-semibold text-lg mb-2 text-white bg-[#00cfff] rounded-t-lg shadow-sm py-2 border border-b-0 border-[#00cfff]">Vui lòng chọn ngày khám</div>
            <div className="">
              <div>
                <Calendar
                  minDate={tomorrow}
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="vi-VN"
                />
                {selectedDate && (
                  <div className="mt-4 text-center text-blue-600 font-semibold">
                    Ngày đã chọn: {selectedDate.toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule; 