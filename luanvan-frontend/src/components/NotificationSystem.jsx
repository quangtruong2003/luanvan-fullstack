import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Clock, Zap, Heart, Star, AlertTriangle, Bell } from 'lucide-react';

// Error message mappings for specific cases
const ERROR_MESSAGES = {
  // Authentication & Authorization Errors
  AUTH: {
    401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    'Session expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    'Access denied': 'Truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này.',
    'Unauthorized': 'Chưa được xác thực. Vui lòng đăng nhập.',
    'token': 'Token không hợp lệ. Vui lòng đăng nhập lại.'
  },

  // Network & Connection Errors
  NETWORK: {
    'fetch': 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.',
    'network': 'Lỗi kết nối mạng. Vui lòng thử lại sau.',
    'ECONNREFUSED': 'Không thể kết nối tới server. Server có thể đang bảo trì.',
    'timeout': 'Quá thời gian chờ phản hồi. Vui lòng thử lại.',
    'CORS': 'Lỗi CORS. Vui lòng liên hệ quản trị viên.'
  },

  // Validation Errors (400)
  VALIDATION: {
    'Dữ liệu đầu vào không hợp lệ': 'Dữ liệu nhập vào không đúng định dạng. Vui lòng kiểm tra lại.',
    'Missing required field': 'Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ các trường.',
    'Invalid email format': 'Định dạng email không hợp lệ.',
    'Invalid phone number': 'Số điện thoại không đúng định dạng.',
    'Password too weak': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
    'Invalid date format': 'Định dạng ngày tháng không hợp lệ.',
    'Invalid parameter type': 'Kiểu dữ liệu tham số không đúng.'
  },

  // Resource Not Found Errors (404)
  NOT_FOUND: {
    'User not found': 'Không tìm thấy người dùng.',
    'Doctor not found': 'Không tìm thấy bác sĩ.',
    'Clinic not found': 'Không tìm thấy phòng khám.',
    'Specialty not found': 'Không tìm thấy chuyên khoa.',
    'Appointment not found': 'Không tìm thấy lịch hẹn.',
    'Slot not found': 'Không tìm thấy khung giờ khám.',
    'WorkShift not found': 'Không tìm thấy ca làm việc.',
    'Patient not found': 'Không tìm thấy bệnh nhân.'
  },

  // Business Logic Errors
  BUSINESS: {
    // Doctor Management
    'already exists': 'Dữ liệu đã tồn tại trong hệ thống.',
    'Doctor already has profile': 'Bác sĩ này đã có hồ sơ trong hệ thống.',
    'Email already in use': 'Email này đã được sử dụng.',
    'Phone number already exists': 'Số điện thoại này đã được sử dụng.',
    'Specialty not assigned': 'Chuyên khoa chưa được gán cho bác sĩ.',
    'Doctor not available at clinic': 'Bác sĩ không có lịch khám tại phòng khám này.',
    'Doctor profile not found': 'Không tìm thấy hồ sơ bác sĩ.',
    
    // Appointment Management
    'Slot is not available': 'Khung giờ này không còn trống. Vui lòng chọn khung giờ khác.',
    'Appointment time conflict': 'Thời gian khám bị trung lặp. Vui lòng chọn thời gian khác.',
    'Cannot cancel confirmed appointment': 'Không thể hủy lịch hẹn đã được xác nhận.',
    'Appointment is in the past': 'Không thể đặt lịch hẹn trong quá khứ.',
    'Doctor not available': 'Bác sĩ không có lịch khám trong thời gian này.',
    'Patient contact info missing': 'Thiếu thông tin liên lạc của bệnh nhân. Vui lòng cập nhật số điện thoại.',
    'Appointment already exists': 'Đã có lịch hẹn trong khung giờ này.',
    'Invalid appointment status': 'Trạng thái lịch hẹn không hợp lệ.',
    'Cannot modify past appointment': 'Không thể sửa đổi lịch hẹn trong quá khứ.',
    
    // Clinic Management
    'Clinic has related data': 'Không thể xóa phòng khám có dữ liệu liên quan (bác sĩ, lịch hẹn).',
    'Work shift overlaps': 'Ca làm việc bị trùng lặp thời gian.',
    'Clinic is closed': 'Phòng khám hiện đang đóng cửa.',
    'Clinic capacity exceeded': 'Phòng khám đã đạt tối đa số lượng bác sĩ.',
    'Invalid working hours': 'Giờ làm việc không hợp lệ.',
    
    // Specialty Management
    'Specialty has doctors': 'Không thể xóa chuyên khoa đang có bác sĩ.',
    'Specialty has appointments': 'Không thể xóa chuyên khoa đang có lịch hẹn.',
    'Specialty not available at clinic': 'Chuyên khoa này không có tại phòng khám được chọn.',
    
    // Schedule Management
    'Schedule conflict': 'Lịch làm việc bị xung đột.',
    'Invalid time range': 'Khoảng thời gian không hợp lệ.',
    'Slot already booked': 'Khung giờ này đã được đặt.',
    'Cannot modify past slots': 'Không thể sửa đổi khung giờ trong quá khứ.',
    'Slot duration invalid': 'Thời lượng khung giờ không hợp lệ.',
    'Maximum slots per day exceeded': 'Đã vượt quá số khung giờ tối đa trong ngày.',
    
    // User Management
    'User is inactive': 'Tài khoản người dùng đã bị vô hiệu hóa.',
    'Password change required': 'Bạn cần thay đổi mật khẩu để tiếp tục.',
    'Account locked': 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần.',
    'Email not verified': 'Email chưa được xác thực.',
    
    // Payment & System
    'Payment failed': 'Thanh toán thất bại. Vui lòng thử lại.',
    'Payment method not available': 'Phương thức thanh toán không khả dụng.',
    'System maintenance': 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
    'Feature not available': 'Tính năng này hiện chưa khả dụng.',
    'Rate limit exceeded': 'Bạn đã thực hiện quá nhiều thao tác. Vui lòng chờ ít phút.',
    
    // File & Upload
    'File too large': 'File quá lớn. Kích thước tối đa cho phép là 5MB.',
    'Invalid file type': 'Loại file không được hỗ trợ.',
    'Upload failed': 'Tải file thất bại. Vui lòng thử lại.',
    
    // Data Integrity
    'Constraint violation': 'Vi phạm ràng buộc dữ liệu. Không thể thực hiện thao tác.',
    'Duplicate entry': 'Dữ liệu trùng lặp. Vui lòng kiểm tra lại.',
    'Foreign key constraint': 'Không thể xóa do có dữ liệu liên quan.',
    'Data inconsistency': 'Dữ liệu không nhất quán. Vui lòng tải lại trang.'
  },

  // Server Errors (500)
  SERVER: {
    'Internal Server Error': 'Lỗi server nội bộ. Vui lòng thử lại sau.',
    'Database error': 'Lỗi cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.',
    'OptimisticLocking': 'Dữ liệu đã được thay đổi bởi người khác. Vui lòng tải lại trang.',
    'Constraint violation': 'Vi phạm ràng buộc dữ liệu. Không thể thực hiện thao tác.',
    'Transaction failed': 'Giao dịch thất bại. Vui lòng thử lại.'
  }
};

// Function to get specific error message
const getSpecificErrorMessage = (error, operation = '') => {
  const errorMessage = error?.message || error || '';
  const errorCode = error?.status || error?.response?.status;
  
  // Check for specific error patterns
  for (const [category, messages] of Object.entries(ERROR_MESSAGES)) {
    for (const [pattern, message] of Object.entries(messages)) {
      if (errorMessage.includes(pattern) || errorCode === pattern) {
        return {
          message,
          title: getErrorTitle(category, operation),
          type: getErrorType(category)
        };
      }
    }
  }
  
  // Default messages based on HTTP status codes
  if (errorCode) {
    switch (errorCode) {
      case 400:
        return {
          message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
          title: 'Lỗi dữ liệu',
          type: 'warning'
        };
      case 401:
        return {
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          title: 'Lỗi xác thực',
          type: 'warning'
        };
      case 403:
        return {
          message: 'Bạn không có quyền thực hiện thao tác này.',
          title: 'Không có quyền',
          type: 'warning'
        };
      case 404:
        return {
          message: 'Không tìm thấy dữ liệu yêu cầu.',
          title: 'Không tìm thấy',
          type: 'warning'
        };
      case 409:
        return {
          message: 'Dữ liệu đã tồn tại hoặc xung đột.',
          title: 'Xung đột dữ liệu',
          type: 'warning'
        };
      case 500:
        return {
          message: 'Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.',
          title: 'Lỗi hệ thống',
          type: 'error'
        };
      default:
        return {
          message: `Có lỗi xảy ra (${errorCode}). Vui lòng thử lại.`,
          title: 'Lỗi không xác định',
          type: 'error'
        };
    }
  }
  
  // Fallback to original error message
  return {
    message: errorMessage || 'Có lỗi không xác định xảy ra.',
    title: operation ? `Lỗi ${operation}` : 'Có lỗi xảy ra',
    type: 'error'
  };
};

const getErrorTitle = (category, operation) => {
  const titles = {
    AUTH: 'Lỗi xác thực',
    NETWORK: 'Lỗi kết nối',
    VALIDATION: 'Lỗi dữ liệu',
    NOT_FOUND: 'Không tìm thấy',
    BUSINESS: operation ? `Lỗi ${operation}` : 'Lỗi nghiệp vụ',
    SERVER: 'Lỗi hệ thống'
  };
  return titles[category] || 'Có lỗi xảy ra';
};

const getErrorType = (category) => {
  const types = {
    AUTH: 'warning',
    NETWORK: 'error',
    VALIDATION: 'warning',
    NOT_FOUND: 'warning',
    BUSINESS: 'warning',
    SERVER: 'error'
  };
  return types[category] || 'error';
};

// Context cho hệ thống thông báo
const NotificationContext = createContext();

// Hook để sử dụng notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Component hiển thị một thông báo đơn lẻ với animation và progress bar
const ToastNotification = ({ notification, onRemove, index, onClearAll }) => {
  const { id, type, title, message, duration, actions } = notification;
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  // Animation entrance
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Progress timer
  useEffect(() => {
    if (duration > 0 && !isDragging) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            handleRemove();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [duration, isDragging]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(id), 300);
  };

  const getIcon = () => {
    const iconClass = "h-6 w-6";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-emerald-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />;
      case 'loading':
        return <div className={`${iconClass} animate-spin rounded-full border-2 border-blue-500 border-t-transparent`}></div>;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStyles = () => {
    const baseStyles = "shadow-2xl border backdrop-blur-xl";
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-emerald-50/95 to-green-50/95 border-emerald-200/50 text-emerald-900`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50/95 to-pink-50/95 border-red-200/50 text-red-900`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-amber-50/95 to-yellow-50/95 border-amber-200/50 text-amber-900`;
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-blue-50/95 to-cyan-50/95 border-blue-200/50 text-blue-900`;
      case 'loading':
        return `${baseStyles} bg-gradient-to-r from-purple-50/95 to-indigo-50/95 border-purple-200/50 text-purple-900`;
      default:
        return `${baseStyles} bg-gradient-to-r from-gray-50/95 to-slate-50/95 border-gray-200/50 text-gray-900`;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-blue-500';
      case 'loading': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Touch/mouse events for swipe to dismiss
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches?.[0] || e;
    setDragX(touch.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches?.[0] || e;
    const deltaX = touch.clientX - dragX;
    if (Math.abs(deltaX) > 100) {
      handleRemove();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <div 
      className={`
        max-w-sm w-full mb-4 rounded-2xl p-5 transform transition-all duration-500 ease-out cursor-pointer select-none
        ${getStyles()}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-90' : ''}
        ${isDragging ? 'scale-105 rotate-1' : ''}
        hover:scale-105 hover:shadow-3xl
        animate-slideInRight
      `}
      style={{
        animationDelay: `${index * 100}ms`,
        transform: isDragging ? `translateX(${dragX > 0 ? '10px' : '-10px'}) rotate(${dragX > 0 ? '2deg' : '-2deg'})` : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={onClearAll}
    >
      {/* Progress bar */}
      {duration > 0 && !isDragging && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/30 rounded-t-2xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
            style={{ 
              width: `${duration > 0 ? (timeLeft / duration) * 100 : 0}%`,
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon with pulse animation */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-current"></div>
          <div className="relative">
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-base font-bold mb-1 leading-tight">{title}</h4>
          )}
          <p className="text-sm leading-relaxed opacity-90">{message}</p>
          
          {/* Action buttons */}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-4">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    if (action.dismissOnClick !== false) handleRemove();
                  }}
                  className={`
                    px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 transform hover:scale-105
                    ${action.style === 'primary' 
                      ? 'bg-current text-white shadow-lg hover:shadow-xl' 
                      : 'bg-white/50 text-current border border-current/20 hover:bg-white/80'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 transform hover:scale-110 hover:rotate-90"
        >
          <X className="h-4 w-4 opacity-60 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

// Provider component với animation stacking
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type: 'info',
      duration: 5,
      ...notification,
    };

    setNotifications(prev => {
      // Find and remove existing notification with same content
      const filteredPrev = prev.filter(
        n => !(n.type === newNotification.type && n.title === newNotification.title && n.message === newNotification.message)
      );
      // Add the new notification to the top
      return [newNotification, ...filteredPrev].slice(0, 6);
    });

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Enhanced helper methods với customization options
  const showSuccess = useCallback((message, title = 'Thành công', options = {}) => {
    return addNotification({ 
      type: 'success', 
      title, 
      message, 
      duration: 4,
      ...options 
    });
  }, [addNotification]);

  const showError = useCallback((error, title = '', options = {}) => {
    // Use the specific error message system
    const errorInfo = getSpecificErrorMessage(error, title);
    
    return addNotification({ 
      type: errorInfo.type,
      title: errorInfo.title,
      message: errorInfo.message,
      duration: 6,
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Cảnh báo', options = {}) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      message, 
      duration: 5,
      ...options 
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Thông tin', options = {}) => {
    return addNotification({ 
      type: 'info', 
      title, 
      message, 
      duration: 4,
      ...options 
    });
  }, [addNotification]);

  const showLoading = useCallback((message, title = 'Đang xử lý', options = {}) => {
    return addNotification({ 
      type: 'loading', 
      title, 
      message, 
      duration: 0, // No auto dismiss for loading
      ...options 
    });
  }, [addNotification]);

  // Enhanced error reporting with operation context
  const showApiError = useCallback((error, operation = '', options = {}) => {
    const errorInfo = getSpecificErrorMessage(error, operation);
    
    // Add operation context to the notification
    const contextualMessage = operation 
      ? `${errorInfo.message}\n\nThao tác: ${operation}`
      : errorInfo.message;
    
    return addNotification({
      type: errorInfo.type,
      title: errorInfo.title,
      message: contextualMessage,
      duration: 8, // Longer duration for API errors
      actions: [
        {
          label: 'Chi tiết',
          style: 'secondary',
          onClick: () => {
            console.group('🔍 Chi tiết lỗi API');
            console.error('Operation:', operation);
            console.error('Original Error:', error);
            console.error('Error Info:', errorInfo);
            console.groupEnd();
          },
          dismissOnClick: false
        }
      ],
      ...options
    });
  }, [addNotification]);

  // Business logic specific error handlers
  const showValidationError = useCallback((validationErrors, title = 'Lỗi dữ liệu', options = {}) => {
    let message = '';
    
    if (Array.isArray(validationErrors)) {
      message = validationErrors.join('\n• ');
      message = '• ' + message;
    } else if (typeof validationErrors === 'object') {
      message = Object.entries(validationErrors)
        .map(([field, error]) => `• ${field}: ${error}`)
        .join('\n');
    } else {
      message = validationErrors;
    }
    
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 7,
      ...options
    });
  }, [addNotification]);

  const showNetworkError = useCallback((error, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Lỗi kết nối',
      message: 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại.',
      duration: 8,
      actions: [
        {
          label: 'Thử lại',
          style: 'primary',
          onClick: () => window.location.reload()
        }
      ],
      ...options
    });
  }, [addNotification]);

  const showAuthError = useCallback((error, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Lỗi xác thực',
      message: 'Phiên đăng nhập đã hết hạn. Bạn sẽ được chuyển về trang đăng nhập.',
      duration: 5,
      actions: [
        {
          label: 'Đăng nhập lại',
          style: 'primary',
          onClick: () => {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
      ],
      ...options
    });
  }, [addNotification]);

  // Modern confirm dialog với promise
  const showConfirm = useCallback((message, title = 'Xác nhận', options = {}) => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: 'warning',
        title,
        message,
        duration: 0,
        actions: [
          {
            label: options.cancelText || 'Hủy',
            style: 'secondary',
            onClick: () => {
              removeNotification(id);
              resolve(false);
            }
          },
          {
            label: options.confirmText || 'Xác nhận',
            style: 'primary',
            onClick: () => {
              removeNotification(id);
              resolve(true);
            }
          }
        ],
        ...options
      });
    });
  }, [addNotification, removeNotification]);

  // Progress notification for long operations
  const showProgress = useCallback((message, title = 'Đang xử lý', initialProgress = 0) => {
    const id = addNotification({
      type: 'loading',
      title,
      message,
      duration: 0,
      progress: initialProgress
    });

    const updateProgress = (progress, newMessage) => {
      setNotifications(prev => prev.map(notif => 
        notif.id === id 
          ? { ...notif, progress, message: newMessage || notif.message }
          : notif
      ));
    };

    const complete = (finalMessage, type = 'success') => {
      setNotifications(prev => prev.map(notif => 
        notif.id === id 
          ? { ...notif, type, message: finalMessage || notif.message, duration: 3 }
          : notif
      ));
    };

    return { updateProgress, complete, id };
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirm,
    showProgress,
    // Enhanced error handlers
    showApiError,
    showValidationError,
    showNetworkError,
    showAuthError,
    // Utility functions
    getSpecificErrorMessage
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Modern notification container with backdrop */}
      <div className="fixed top-4 right-4 z-[9999] space-y-0 pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map((notification, index) => (
            <ToastNotification
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
              index={index}
              onClearAll={clearAll}
            />
          ))}
        </div>
        
        {/* Clear all button when multiple notifications */}
        {notifications.length > 2 && (
          <div className="flex justify-end mt-2 pointer-events-auto">
            <button
              onClick={clearAll}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg hover:bg-white/90 hover:scale-105 transition-all duration-200"
            >
              Xóa tất cả ({notifications.length})
            </button>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
};

// Enhanced ConfirmDialog với modern design
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
  loading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-16 w-16 text-amber-500" />;
      case 'info':
        return <Info className="h-16 w-16 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-emerald-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white';
      case 'info':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white';
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
      <div className="relative mx-auto p-0 border-0 w-full max-w-md">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-modalSlideIn">
          {/* Background decoration */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
          
          <div className="relative p-8 text-center">
            {/* Icon with pulse animation */}
            <div className="mx-auto flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-current"></div>
              <div className="relative">
                {getIcon()}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed">{message}</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-2xl text-sm font-semibold text-gray-700 bg-white/80 hover:bg-white hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                disabled={loading}
                className={`px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonStyle()}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationProvider; 