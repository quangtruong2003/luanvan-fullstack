import ClerkAuthHandler from "./components/ClerkAuthHandler"
import Home from "./pages/Home"
import BookAppointment from "./pages/BookAppointment"
import MyAppointments from "./pages/MyAppointments"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import AdminDashboard from "./pages/admin/AdminDashboardNew"
import DoctorDashboard from "./pages/doctor/DoctorDashboardNew"
import ProtectedRoute from "./components/ProtectedRoute"
import { NotificationProvider } from "./components/NotificationSystem"
import { Route, Routes, useLocation } from "react-router-dom"
import DoctorSchedule from './pages/DoctorSchedule'
import SpecialtyDoctors from './pages/SpecialtyDoctors'
import About from './pages/About'
  
function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <ClerkAuthHandler />
        {/* Tạm thời bỏ Menubar vì file không tồn tại */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pr" element={<About />} />
          
          {/* Patient routes (với Clerk authentication) */}
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/book-appointment/doctor/:doctorId" element={<DoctorSchedule />} />
          <Route path="/book-appointment/specialty/:specialtyId" element={<SpecialtyDoctors />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" 
            element={<ProtectedRoute roles={['ADMIN']} element={<AdminDashboard />} />} 
          />
          
          {/* Doctor routes */}
          <Route path="/doctor/dashboard" 
            element={<ProtectedRoute roles={['DOCTOR']} element={<DoctorDashboard />} />} 
          />
        </Routes>
      </div>
    </NotificationProvider>
  )
}

export default App
