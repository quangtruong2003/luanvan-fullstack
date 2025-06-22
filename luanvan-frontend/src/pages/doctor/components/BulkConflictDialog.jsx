import React from 'react';
import { AlertTriangle, Calendar, Clock, Building2, Zap, X, Check } from 'lucide-react';

const BulkConflictDialog = ({ 
  isOpen, 
  onClose, 
  conflictInfo, 
  onConfirm, 
  loading = false 
}) => {
  if (!isOpen || !conflictInfo) return null;

  const { settings, specialty, totalConflicts } = conflictInfo;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const getDaysText = () => {
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Cảnh báo xung đột lịch</h3>
                <p className="text-sm text-amber-700">Tạo lịch tự động có thể gây xung đột</p>
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
          {/* Generation Info */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Thông tin tạo lịch tự động:</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{specialty?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  {formatDate(settings.startDate)} - {formatDate(settings.endDate)} ({getDaysText()} ngày)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Ca làm việc: {settings.workShiftFilter === 'all' ? 'Cả ngày' : 
                               settings.workShiftFilter === 'morning' ? 'Ca sáng' : 'Ca chiều'}
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Có thể xảy ra xung đột lịch
                </p>
                <p className="text-xs text-amber-700">
                  Việc tạo lịch tự động có thể tạo ra các slot trùng giờ với chuyên khoa khác. 
                  Hệ thống sẽ tự động tắt các slot xung đột từ chuyên khoa khác.
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  ⚠️ Slot đã có bệnh nhân đặt lịch sẽ KHÔNG bị ảnh hưởng.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Bạn có muốn tiếp tục tạo lịch tự động không?
            </p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              <li>• Hệ thống sẽ tạo slots cho chuyên khoa <strong>{specialty?.name}</strong></li>
              <li>• Tự động tắt các slot xung đột từ chuyên khoa khác</li>
              <li>• Bảo vệ các slot đã có bệnh nhân đặt lịch</li>
              <li>• Thông báo chi tiết kết quả sau khi hoàn thành</li>
            </ul>
          </div>
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
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Xác nhận tạo lịch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkConflictDialog; 