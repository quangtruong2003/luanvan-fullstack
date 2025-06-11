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
        console.log('🔍 Checking auth status...');
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const backendUserId = localStorage.getItem('backendUserId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        console.log('🔑 Token exists:', !!token);
        console.log('👤 Stored user role:', userRole);
        
        if (!token) {
          console.log('❌ No token found, setting user to null');
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Nếu có đủ thông tin trong localStorage, sử dụng trước
        if (userRole && backendUserId) {
          console.log('✅ Found user data in localStorage, setting currentUser');
          setCurrentUser({
            id: parseInt(backendUserId),
            fullName: userName || 'User',
            email: userEmail,
            role: userRole
          });
          setLoading(false);
          
          // Vẫn verify với server trong background
          authService.getCurrentUser().then(userData => {
            if (userData) {
              console.log('✅ Server verification successful');
              setCurrentUser({
                id: userData.user_id || userData.id,
                fullName: userData.full_name || userData.fullName,
                email: userData.email,
                phoneNumber: userData.phone_number || userData.phoneNumber,
                role: userData.role_name || userData.role
              });
            }
          }).catch(err => {
            console.log('❌ Server verification failed:', err.message);
            // Nếu server không verify được, vẫn giữ user từ localStorage
          });
          return;
        }
        
        // Nếu không có thông tin đầy đủ, verify với server
        console.log('🔍 Verifying with server...');
        const userData = await authService.getCurrentUser();
        if (userData) {
          console.log('✅ Server verification successful:', userData);
          setCurrentUser({
            id: userData.user_id || userData.id,
            fullName: userData.full_name || userData.fullName,
            email: userData.email,
            phoneNumber: userData.phone_number || userData.phoneNumber,
            role: userData.role_name || userData.role
          });
        } else {
          console.log('❌ Server returned null user data');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("❌ Error checking auth status:", err);
        setCurrentUser(null);
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