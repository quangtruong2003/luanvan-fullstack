import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Kiểm tra xem người dùng đã đăng nhập chưa khi khởi động ứng dụng
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        const userData = await authService.getCurrentUser();
        if (userData) {
          setCurrentUser(userData);
        } else {
          // Nếu không lấy được thông tin người dùng, token không hợp lệ
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", err);
        setError("Không thể xác thực phiên đăng nhập");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Đăng nhập
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.loginWithCredentials(credentials);
      
      if (response.success) {
        // Lưu token và thông tin người dùng
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.userInfo.role);
        localStorage.setItem('backendUserId', response.userInfo.userId.toString());
        localStorage.setItem('userEmail', response.userInfo.email || '');
        localStorage.setItem('userName', response.userInfo.fullName || '');
        
        setCurrentUser({
          id: response.userInfo.userId,
          fullName: response.userInfo.fullName,
          email: response.userInfo.email,
          phoneNumber: response.userInfo.phoneNumber,
          role: response.userInfo.role
        });
        
        return { success: true };
      } else {
        setError(response.message || "Đăng nhập thất bại");
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
      return { success: false, message: err.message };
    }
  };
  
  // Đăng xuất
  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };
  
  // Kiểm tra vai trò người dùng
  const isAdmin = () => {
    return currentUser?.role === 'ADMIN';
  };
  
  const isDoctor = () => {
    return currentUser?.role === 'DOCTOR';
  };
  
  const isPatient = () => {
    return currentUser?.role === 'PATIENT';
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isDoctor,
    isPatient
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 