import Menubar from "./components/Menubar"
import Home from "./pages/Home"
import BookAppointment from "./pages/BookAppointment"
import MyAppointments from "./pages/MyAppointments"
import Dashboard from "./pages/Dashboard"
import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Menubar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App
