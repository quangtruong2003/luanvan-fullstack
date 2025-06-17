import React, { useState } from 'react';
import {
  AlertTriangle, X, ArrowRight, Building, Activity,
  Clock, Calendar, CheckCircle, Power, PowerOff
} from 'lucide-react';

const EnhancedSlotConflictDialog = ({
  isOpen,
  onClose,
  conflictInfo,
  onResolve,
  onCancel
}) => {
  const [selectedResolution, setSelectedResolution] = useState('switch');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !conflictInfo) return null;

  const {
    slotId,
    slotTime,
    currentSpecialty,
    currentClinic,
    conflictSpecialty,
    conflictClinic,
    conflictDetails
  } = conflictInfo;

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString;
      }
      return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      await onResolve(selectedResolution, conflictInfo);
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolutionOptions = [
    {
      id: 'switch',
      title: 'Chuyển sang chuyên khoa này',
      description: `Tắt slot tại ${conflictSpecialty} - ${conflictClinic} và bật tại ${currentSpecialty} - ${currentClinic}`,
      icon: ArrowRight,
      color: 'blue',
      recommended: true
    },
    {
      id: 'keep_existing',
      title: 'Giữ nguyên slot hiện tại',
      description: `Giữ slot tại ${conflictSpecialty} - ${conflictClinic}, không thay đổi gì`,
      icon: PowerOff,
      color: 'gray'
    },
    {
      id: 'force_both',
      title: 'Bật cả hai (Không khuyến nghị)',
      description: 'Bật slot tại cả hai chuyên khoa - có thể gây xung đột đặt lịch',
      icon: Power,
      color: 'red',
      warning: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Phát hiện xung đột lịch làm việc</h2>
                <p className="text-orange-100">Cần xử lý xung đột để tiếp tục</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conflict Details */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chi tiết xung đột</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-800 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Thời gian:</span>
                <span>{formatTime(slotTime)}</span>
              </div>
              <p className="text-amber-700 text-sm">
                Slot này đã được bật tại một chuyên khoa khác. Bạn chỉ có thể làm việc tại một chuyên khoa trong cùng khung giờ.
              </p>
            </div>
          </div>

          {/* Current vs Conflict Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Chuyên khoa muốn bật</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{currentSpecialty}</span>
                </div>
                <div className="text-blue-700">{currentClinic}</div>
              </div>
            </div>

            {/* Conflicting Slot */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Power className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Slot hiện tại đang bật</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-red-600" />
                  <span className="text-red-800">{conflictSpecialty}</span>
                </div>
                <div className="text-red-700">{conflictClinic}</div>
              </div>
            </div>
          </div>

          {/* Additional conflict details */}
          {conflictDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Thông tin bổ sung:</span> {conflictDetails}
              </div>
            </div>
          )}
        </div>

        {/* Resolution Options */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn cách xử lý</h3>
          <div className="space-y-3">
            {resolutionOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedResolution === option.id;
              
              return (
                <label key={option.id} className="cursor-pointer">
                  <div className={`border-2 rounded-lg p-4 transition-all duration-200 
                    ${isSelected 
                      ? `border-${option.color}-500 bg-${option.color}-50` 
                      : 'border-gray-200 hover:border-gray-300'}
                    ${option.warning ? 'border-red-300 bg-red-50' : ''}
                  `}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="resolution"
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedResolution(e.target.value)}
                        className={`mt-1 text-${option.color}-600 focus:ring-${option.color}-500`}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className={`w-5 h-5 text-${option.color}-600`} />
                          <span className={`font-medium text-${option.color}-900`}>
                            {option.title}
                          </span>
                          {option.recommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Khuyến nghị
                            </span>
                          )}
                          {option.warning && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Cảnh báo
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-${option.color}-700`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button
            onClick={handleResolve}
            disabled={loading || !selectedResolution}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Xác nhận</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSlotConflictDialog; 