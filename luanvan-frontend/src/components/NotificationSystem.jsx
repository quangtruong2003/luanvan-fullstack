import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Clock, Zap, Heart, Star, AlertTriangle, Bell } from 'lucide-react';

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
const ToastNotification = ({ notification, onRemove, index }) => {
  const { id, type, title, message, duration, actions, progress } = notification;
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

    setNotifications(prev => [newNotification, ...prev].slice(0, 6)); // Limit to 6 notifications
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

  const showError = useCallback((message, title = 'Lỗi', options = {}) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
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
    showProgress
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