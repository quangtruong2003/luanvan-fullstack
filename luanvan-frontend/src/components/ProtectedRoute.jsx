import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';

// ProtectedRoute component bảo vệ các trang cần quyền truy cập
// roles: mảng các vai trò được phép truy cập trang (ADMIN, DOCTOR, PATIENT)
// element: Component cần hiển thị nếu có quyền truy cập
const ProtectedRoute = ({ roles, element }) => {
  const { currentUser, loading } = useAuth();
  const { isSignedIn, user } = useUser();
  
  console.log('🛡️ ProtectedRoute check:', {
    loading,
    currentUser: currentUser ? { role: currentUser.role, id: currentUser.id } : null,
    requiredRoles: roles,
    isSignedIn
  });
  
  // Đang tải thông tin đăng nhập, hiển thị loading
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang xác thực...</span>
      </div>
    );
  }
  
  // Kiểm tra quyền truy cập
  const hasPermission = () => {
    // Nếu là tài khoản Clerk (bệnh nhân)
    if (roles.includes('PATIENT') && isSignedIn) {
      console.log('✅ ProtectedRoute: Patient access granted via Clerk');
      return true;
    }
    
    // Nếu là tài khoản thông thường (admin, bác sĩ)
    if (currentUser && roles.includes(currentUser.role)) {
      console.log('✅ ProtectedRoute: Access granted for role:', currentUser.role);
      return true;
    }
    
    console.log('❌ ProtectedRoute: Access denied');
    return false;
  };
  
  // Nếu có quyền truy cập, hiển thị component
  if (hasPermission()) {
    return element;
  }
  
  // Kiểm tra nếu có token nhưng chưa load user (có thể đang verify với server)
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (token && userRole && roles.includes(userRole) && !currentUser) {
    console.log('⏳ ProtectedRoute: Has token and role, but user not loaded yet. Showing loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang xác thực người dùng...</span>
      </div>
    );
  }
  
  console.log('🚫 ProtectedRoute: Redirecting to login');
  // Không có quyền truy cập, chuyển hướng về trang đăng nhập
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute; 