import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCcw, LogOut, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const AuthErrorHandler = ({ error, onRetry, onLogout, onClearAuth }) => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);

  // Check if error is auth-related
  const isAuthError = error && (
    error.message.includes('Session expired') ||
    error.message.includes('Access denied') ||
    error.message.includes('401') ||
    error.message.includes('403')
  );

  // Check if error is network-related
  const isNetworkError = error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('ECONNREFUSED')
  );

  // Auto-retry for network errors
  useEffect(() => {
    if (isNetworkError && retryCount < 3 && autoRetryCountdown === 0) {
      setAutoRetryCountdown(5);
      const countdown = setInterval(() => {
        setAutoRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [isNetworkError, retryCount, autoRetryCountdown]);

  // Check backend connection
  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    // Tự động xóa dữ liệu authentication cũ khi component mount
    const clearOldAuthData = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('backendUserId');
      
      // Nếu có token nhưng userId là 776578118 (ID cũ không hợp lệ) hoặc userId quá dài
      if (token && userId && (userId === '776578118' || userId.length > 10)) {
        console.log('🧹 Clearing old authentication data for invalid user ID:', userId);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('backendUserId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        
        if (onClearAuth) {
          onClearAuth();
        }
        
        // Show notification to user
        alert('⚠️ Phát hiện dữ liệu đăng nhập cũ không hợp lệ.\n🔄 Đang làm mới trang để khắc phục...');
        
        // Reload page để làm mới hoàn toàn
        window.location.reload();
      }
    };

    clearOldAuthData();
  }, [onClearAuth]);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/health-check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      setConnectionStatus(response.ok ? 'online' : 'offline');
    } catch {
      setConnectionStatus('offline');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkConnection();
    if (onRetry) onRetry();
  };

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  const handleClearAndReload = () => {
    // Xóa tất cả dữ liệu localStorage
    localStorage.clear();
    
    // Reload page
    window.location.reload();
  };

  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {isAuthError ? (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            ) : isNetworkError ? (
              <WifiOff className="h-8 w-8 text-orange-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {isAuthError ? 'Lỗi xác thực' : isNetworkError ? 'Lỗi kết nối' : 'Có lỗi xảy ra'}
            </h3>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {isAuthError 
              ? 'Phiên đăng nhập của bạn đã hết hạn hoặc không có quyền truy cập.'
              : isNetworkError 
              ? 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại.'
              : error.message || 'Đã xảy ra lỗi không xác định.'
            }
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center text-xs">
            {connectionStatus === 'online' ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Backend: Đã kết nối
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Backend: Mất kết nối
              </div>
            )}
          </div>
        </div>

        {/* Auto-retry countdown */}
        {isNetworkError && autoRetryCountdown > 0 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center">
              <RefreshCcw className="h-4 w-4 text-orange-600 mr-2 animate-spin" />
              <span className="text-sm text-orange-700">
                Tự động thử lại sau {autoRetryCountdown} giây...
              </span>
            </div>
          </div>
        )}

        {/* Retry attempts */}
        {retryCount > 0 && (
          <div className="mb-4 text-xs text-gray-500">
            Đã thử {retryCount}/3 lần
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isAuthError ? (
            <>
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng nhập lại
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetry}
                disabled={autoRetryCountdown > 0}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${autoRetryCountdown > 0 ? 'animate-spin' : ''}`} />
                {autoRetryCountdown > 0 ? `Thử lại (${autoRetryCountdown})` : 'Thử lại'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </button>
            </>
          )}
        </div>

        {/* Additional Help */}
        {isNetworkError && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Hướng dẫn khắc phục:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Kiểm tra kết nối internet</li>
              <li>• Đảm bảo backend server đang chạy (port 9090)</li>
              <li>• Kiểm tra firewall và antivirus</li>
              <li>• Thử refresh trang web</li>
            </ul>
          </div>
        )}

        <button
          onClick={handleClearAndReload}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4"
        >
          <RefreshCcw className="w-5 h-5" />
          Làm mới ứng dụng
        </button>
      </div>
    </div>
  );
};

export default AuthErrorHandler; 