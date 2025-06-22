import { createContext, useContext, useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { signOut } = useClerk();
  
  // Clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('backendUserId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setCurrentUser(null);
  };
  
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
        console.log('🆔 Stored backend user ID:', backendUserId);
        
        // Kiểm tra và xóa dữ liệu localStorage cũ có vấn đề
        if (!backendUserId) {
          console.log('🧹 Clearing invalid localStorage data - user ID is missing');
          clearAuthData();
          setLoading(false);
          return;
        }
        
        if (!token) {
          console.log('❌ No token found, setting user to null');
          clearAuthData();
          setLoading(false);
          return;
        }
        
        // Nếu có đủ thông tin trong localStorage và backendUserId hợp lệ, sử dụng trước
        if (userRole && backendUserId) {
          console.log('✅ Found valid user data in localStorage, setting currentUser');
          setCurrentUser({
            id: parseInt(backendUserId),
            fullName: userName || 'User',
            email: userEmail,
            role: userRole
          });
          setLoading(false);
          
          // Skip server verification for now to avoid problematic API calls
          // The localStorage data should be sufficient for most operations
          console.log('⏭️ Skipping server verification to avoid API conflicts');
          return;
        }
        
        // Nếu không có thông tin đầy đủ hoặc hợp lệ, verify với server
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
          clearAuthData();
        }
      } catch (err) {
        console.error("❌ Error checking auth status:", err);
        // Nếu có lỗi authentication, xóa dữ liệu cũ
        if (err.message.includes('404') || err.message.includes('not found') || 
            err.message.includes('401') || err.message.includes('unauthorized') ||
            err.message.includes('User not found with id')) {
          console.log('🧹 Clearing invalid authentication data due to error');
          clearAuthData();
        } else {
          setCurrentUser(null);
        }
        setError('Có lỗi xảy ra khi kiểm tra trạng thái đăng nhập. Vui lòng đăng nhập lại.');
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
    try {
      // Đăng xuất khỏi Clerk trước
      await signOut();
      console.log('✅ Signed out from Clerk successfully');

      // Sau đó, thực hiện logic đăng xuất của ứng dụng
      await authService.logout();
      setCurrentUser(null);
      console.log('✅ Cleared local auth data and context');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Ngay cả khi có lỗi, vẫn nên xóa dữ liệu local để đảm bảo an toàn
      await authService.logout(); 
      setCurrentUser(null);
    }
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