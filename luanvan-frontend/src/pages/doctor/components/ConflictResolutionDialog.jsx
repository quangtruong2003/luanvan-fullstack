import React from 'react';
import { AlertTriangle, Clock, Building2, Stethoscope, X, Check } from 'lucide-react';

const ConflictResolutionDialog = ({ 
  isOpen, 
  onClose, 
  conflictInfo, 
  onResolve, 
  loading = false 
}) => {
  if (!isOpen || !conflictInfo) return null;

  const handleResolve = () => {
    onResolve('DISABLE_CONFLICTING_SLOTS');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(11, 16); // Extract HH:MM from datetime string
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Xung đột lịch khám</h3>
                <p className="text-sm text-amber-700">Phát hiện slot trùng giờ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Time Info */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Thời gian xung đột:</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900">
                {formatTime(conflictInfo.slotTime)} - {formatDate(conflictInfo.slotTime)}
              </p>
            </div>
          </div>

          {/* Conflict Details */}
          {conflictInfo.conflicts && conflictInfo.conflicts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <Stethoscope className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Slot xung đột ({conflictInfo.conflicts.length}):
                </span>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {conflictInfo.conflicts.map((conflict, index) => (
                  <div 
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Building2 className="w-3 h-3 text-red-600" />
                          <span className="text-sm font-medium text-red-900">
                            {conflict.specialtyName}
                          </span>
                        </div>
                        <p className="text-xs text-red-700">
                          {conflict.clinicName}
                        </p>
                        <p className="text-xs text-red-600">
                          {conflict.timeSlot}
                        </p>
                      </div>
                      
                      {conflict.hasAppointments && (
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Đã đặt
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Cần xử lý xung đột
                </p>
                <p className="text-xs text-amber-700">
                  Để mở slot này, các slot xung đột sẽ được tắt tự động. 
                  Slot đã có bệnh nhân đặt lịch sẽ không bị ảnh hưởng.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {conflictInfo.message && (
            <div className="mb-4">
              <p className="text-sm text-gray-700">{conflictInfo.message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleResolve}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Xác nhận</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionDialog; 