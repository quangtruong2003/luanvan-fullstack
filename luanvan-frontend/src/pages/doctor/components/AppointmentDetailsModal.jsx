import React from 'react';
import { 
  XCircle, CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

const AppointmentDetailsModal = ({ 
  showAppointmentDetails,
  selectedAppointment,
  setShowAppointmentDetails,
  handleUpdateAppointmentStatus,
  getStatusColor,
  getStatusIcon
}) => {
  if (!showAppointmentDetails || !selectedAppointment) return null;

  const appointmentDay = new Date(selectedAppointment.appointmentDateTime || selectedAppointment.appointmentDate);
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
            onClick={() => setShowAppointmentDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Bệnh nhân</label>
            <p className="text-gray-900">{selectedAppointment.patient?.fullName}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
            <p className="text-gray-900">{selectedAppointment.patient?.phoneNumber}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{selectedAppointment.patient?.email || 'Không có'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Ngày khám</label>
            <p className="text-gray-900">
              {new Date(selectedAppointment.appointmentDateTime || selectedAppointment.appointmentDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Giờ khám</label>
            <p className="text-gray-900">{new Date(selectedAppointment.appointmentDateTime || selectedAppointment.appointmentDate).toLocaleTimeString('vi-VN', {
              hour: '2-digit', minute: '2-digit'
            })}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Lý do khám</label>
            <p className="text-gray-900">{selectedAppointment.reasonForVisit || 'Khám tổng quát'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Trạng thái</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
              {getStatusIcon(selectedAppointment.status)}
              <span className="ml-1">{selectedAppointment.status}</span>
            </span>
          </div>
        </div>
        
        {selectedAppointment.status === 'CONFIRMED' && !canUpdate && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-800 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Chỉ có thể cập nhật vào hoặc sau ngày hẹn.</span>
          </div>
        )}

        <div className="mt-6 flex space-x-3">
          {selectedAppointment.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => handleUpdateAppointmentStatus(selectedAppointment.appointmentId, 'COMPLETED')}
                disabled={!canUpdate}
                title={!canUpdate ? "Chỉ có thể cập nhật vào hoặc sau ngày hẹn" : "Đánh dấu là đã hoàn thành"}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleUpdateAppointmentStatus(selectedAppointment.appointmentId, 'CANCELLED')}
                disabled={!canUpdate}
                title={!canUpdate ? "Chỉ có thể hủy vào hoặc sau ngày hẹn" : "Hủy lịch hẹn"}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Hủy lịch
              </button>
            </>
          )}
          <button
            onClick={() => setShowAppointmentDetails(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
