import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider } from './context/AuthContext'

// Import pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import About from "./pages/About"
import BookAppointment from "./pages/BookAppointment"
import BookAppointmentDetails from "./pages/BookAppointmentDetails"
import PaymentPage from "./pages/PaymentPage"
import BookingSuccess from "./pages/BookingSuccess"
import DoctorSchedule from './pages/DoctorSchedule'
import SpecialtyDoctors from './pages/SpecialtyDoctors'
import MyAppointments from './pages/MyAppointments'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboardNew.jsx'
import DoctorDashboard from './pages/doctor/DoctorDashboardNew.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "pr", element: <About /> },
      { path: "book-appointment", element: <BookAppointment /> },
      { path: "book-appointment-details", element: <BookAppointmentDetails /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "booking-success", element: <BookingSuccess /> },
      { path: "book-appointment/doctor/:doctorId", element: <DoctorSchedule /> },
      { path: "book-appointment/specialty/:specialtyId", element: <SpecialtyDoctors /> },
      { path: "my-appointments", element: <MyAppointments /> },
      { path: "dashboard", element: <Dashboard /> },
      {
        path: "admin/dashboard",
        element: <ProtectedRoute roles={['ADMIN']} element={<AdminDashboard />} />
      },
      {
        path: "doctor/dashboard",
        element: <ProtectedRoute roles={['DOCTOR']} element={<DoctorDashboard />} />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>,
)