import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';

// ProtectedRoute component bảo vệ các trang cần quyền truy cập
// roles: mảng các vai trò được phép truy cập trang (ADMIN, DOCTOR, PATIENT)
// element: Component cần hiển thị nếu có quyền truy cập
const ProtectedRoute = ({ roles, element }) => {
  const { currentUser, loading } = useAuth();
  const { isSignedIn, user } = useUser();
  
  // Đang tải thông tin đăng nhập, hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Kiểm tra quyền truy cập
  const hasPermission = () => {
    // Nếu là tài khoản Clerk (bệnh nhân)
    if (roles.includes('PATIENT') && isSignedIn) {
      return true;
    }
    
    // Nếu là tài khoản thông thường (admin, bác sĩ)
    if (currentUser && roles.includes(currentUser.role)) {
      return true;
    }
    
    return false;
  };
  
  // Nếu có quyền truy cập, hiển thị component
  if (hasPermission()) {
    return element;
  }
  
  // Không có quyền truy cập, chuyển hướng về trang chủ
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute; 