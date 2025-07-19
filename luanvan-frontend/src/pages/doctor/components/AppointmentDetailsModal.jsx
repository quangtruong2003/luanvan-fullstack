import React from 'react';
import { 
  XCircle, CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

const AppointmentDetailsModal = ({ 
  isOpen,
  appointment,
  onClose,
  onUpdateStatus, // Renamed for clarity
  loading
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED_BY_CLINIC':
      case 'CANCELLED_BY_PATIENT':
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PENDING_PAYMENT':
      case 'PENDING_CONFIRMATION': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED_BY_CLINIC':
      case 'CANCELLED_BY_PATIENT':
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'PENDING_PAYMENT':
      case 'PENDING_CONFIRMATION': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const parseLocalDateTime = (dateTime) => {
    if (!dateTime) return null;
    // If it's already a string, assume it's valid
    if (typeof dateTime === 'string') {
      return new Date(dateTime);
    }
    // If it's an array [YYYY, MM, DD, HH, MM, SS]
    if (Array.isArray(dateTime)) {
      const [year, month, day, hour, minute, second] = dateTime;
      // Month is 0-indexed in JS Date
      return new Date(year, month - 1, day, hour, minute, second || 0);
    }
    // Fallback for unexpected formats
    return null;
  };


  const appointmentDate = parseLocalDateTime(appointment.appointmentDateTime || appointment.appointment_date_time);

  if (!appointmentDate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p>Lỗi: Không thể hiển thị ngày giờ cuộc hẹn.</p>
          <button onClick={onClose} className="mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Đóng</button>
        </div>
      </div>
    );
  }

  const appointmentDay = new Date(appointmentDate);
  appointmentDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canUpdate = today >= appointmentDay;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chi tiết lịch hẹn</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center p-8">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Bệnh nhân</label>
                <p className="text-gray-900">{appointment.patient?.fullName || appointment.patient?.full_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p className="text-gray-900">{appointment.patient?.phoneNumber || appointment.patient?.phone_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{appointment.patient?.email || 'Không có'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày khám</label>
                <p className="text-gray-900">
                  {appointmentDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Giờ khám</label>
                <p className="text-gray-900">{appointmentDate.toLocaleTimeString('vi-VN', {
                  hour: '2-digit', minute: '2-digit'
                })}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Lý do khám</label>
                <p className="text-gray-900">{appointment.reasonForVisit || appointment.reason_for_visit || 'Khám tổng quát'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">{appointment.status}</span>
                </span>
              </div>
            </div>
            
            {appointment.status === 'CONFIRMED' && !canUpdate && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-800 flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Chỉ có thể cập nhật vào hoặc sau ngày hẹn.</span>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              {appointment.status === 'CONFIRMED' && onUpdateStatus && (
                <>
                  <button
                    onClick={() => onUpdateStatus(appointment.appointmentId || appointment.appointment_id, 'COMPLETED')}
                    disabled={!canUpdate}
                    title={!canUpdate ? "Chỉ có thể cập nhật vào hoặc sau ngày hẹn" : "Đánh dấu là đã hoàn thành"}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => onUpdateStatus(appointment.appointmentId || appointment.appointment_id, 'CANCELLED_BY_CLINIC')}
                    disabled={!canUpdate}
                    title={!canUpdate ? "Chỉ có thể hủy vào hoặc sau ngày hẹn" : "Hủy lịch hẹn"}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Hủy lịch
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
