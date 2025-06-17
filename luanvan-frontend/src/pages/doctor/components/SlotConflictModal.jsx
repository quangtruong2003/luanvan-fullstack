import React from 'react';
import { 
  AlertCircle, Clock, CheckCircle, XCircle, Info,
  FileText, Building, TrendingUp, ArrowRight,
  Shield, Zap
} from 'lucide-react';

const SlotConflictModal = ({ 
  showSlotConflictDialog,
  conflictInfo,
  setShowSlotConflictDialog,
  setConflictInfo,
  handleConfirmSlotConflict
}) => {
  if (!showSlotConflictDialog || !conflictInfo) return null;

  // Enhanced conflict details processing
  const conflictDetails = conflictInfo.conflictDetails || [];
  const suggestedAction = conflictInfo.suggestedAction || 'ENABLE_SLOT';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-xl">
          <div className="flex items-center text-white">
            <div className="bg-white/20 p-3 rounded-lg mr-4 backdrop-blur-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">⚠️ Xung đột lịch làm việc được phát hiện</h3>
              <p className="text-yellow-100 text-sm">
                Hệ thống đã tìm thấy xung đột giữa các chuyên khoa - cần xử lý ngay
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-xs font-medium">Đa chuyên khoa</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Content */}
        <div className="p-6 space-y-6">
          {/* Conflict Summary */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-yellow-600 mt-1 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Thông tin xung đột
                </h4>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 mb-4">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center bg-yellow-200 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-bold text-lg">{conflictInfo.slotTime}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Request */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Yêu cầu hiện tại
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 text-blue-500 mr-2" />
                          <span><strong>Chuyên khoa:</strong> {conflictInfo.currentSpecialty}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="w-3 h-3 text-blue-500 mr-2" />
                          <span><strong>Phòng khám:</strong> {conflictInfo.currentClinic}</span>
                        </div>
                        <div className="bg-green-100 px-2 py-1 rounded text-green-800 text-xs font-medium">
                          → Muốn BẬT slot này
                        </div>
                      </div>
                    </div>

                    {/* Conflicting Slot */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-medium text-red-900 mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Slot đang xung đột
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 text-red-500 mr-2" />
                          <span><strong>Chuyên khoa:</strong> {conflictInfo.conflictSpecialty}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="w-3 h-3 text-red-500 mr-2" />
                          <span><strong>Phòng khám:</strong> {conflictInfo.conflictClinic}</span>
                        </div>
                        <div className="bg-red-100 px-2 py-1 rounded text-red-800 text-xs font-medium">
                          ⚠️ Đang BẬT - gây xung đột
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Conflict Information */}
                {conflictDetails.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Chi tiết xung đột
                    </h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {conflictDetails.map((detail, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Solution Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
            <div className="flex items-start">
              <Zap className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-3 text-lg">
                  Giải pháp thông minh đề xuất
                </h4>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-800">Hành động được đề xuất:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {suggestedAction === 'ENABLE_SLOT' ? 'BẬT SLOT MỚI' : 'XỬ LÝ XUNG ĐỘT'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Tắt: {conflictInfo.conflictSpecialty}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Bật: {conflictInfo.currentSpecialty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-blue-700 text-sm">
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                    <span>Tự động tắt slot cùng giờ ở chuyên khoa: <strong>{conflictInfo.conflictSpecialty}</strong></span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                    <span>Bật slot cho chuyên khoa hiện tại: <strong>{conflictInfo.currentSpecialty}</strong></span>
                  </p>
                  <p className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                    <span>Đảm bảo bác sĩ chỉ làm việc 1 chuyên khoa tại 1 thời điểm</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Notice */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Lưu ý quan trọng</h5>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Hệ thống áp dụng nguyên tắc <strong>"một bác sĩ - một chuyên khoa - một thời điểm"</strong> để đảm bảo chất lượng khám chữa bệnh. 
                  Việc này giúp bác sĩ tập trung hoàn toàn vào từng bệnh nhân và tránh nhầm lẫn giữa các quy trình khám bệnh khác nhau.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirmSlotConflict}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Xác nhận thực hiện</span>
            </button>
            <button
              onClick={() => {
                setShowSlotConflictDialog(false);
                setConflictInfo(null);
              }}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Hủy bỏ</span>
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            Thao tác này sẽ được thực hiện ngay lập tức và không thể hoàn tác
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlotConflictModal;
