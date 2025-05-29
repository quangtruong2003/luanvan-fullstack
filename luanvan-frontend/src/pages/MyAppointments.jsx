"use client"

import { useState } from "react"
import { Calendar, Clock, User, MapPin, Edit, Trash2, Eye } from "lucide-react"

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorName: "BS. Nguyễn Văn An",
      specialty: "Tim mạch",
      date: "2024-01-15",
      time: "09:00",
      status: "confirmed",
      reason: "Khám định kỳ tim mạch",
      location: "Phòng 201, Tầng 2",
    },
    {
      id: 2,
      doctorName: "BS. Trần Thị Bình",
      specialty: "Nhi khoa",
      date: "2024-01-20",
      time: "14:30",
      status: "pending",
      reason: "Khám sức khỏe định kỳ cho trẻ",
      location: "Phòng 105, Tầng 1",
    },
    {
      id: 3,
      doctorName: "BS. Lê Minh Cường",
      specialty: "Thần kinh",
      date: "2024-01-10",
      time: "10:00",
      status: "completed",
      reason: "Đau đầu thường xuyên",
      location: "Phòng 301, Tầng 3",
    },
  ])

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "completed":
        return "Đã hoàn thành"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const handleCancelAppointment = (id) => {
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt)))
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "confirmed" || apt.status === "pending")

  const pastAppointments = appointments.filter((apt) => apt.status === "completed" || apt.status === "cancelled")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch hẹn của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi các lịch hẹn khám bệnh của bạn</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn sắp tới ({upcomingAppointments.length})</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Bạn chưa có lịch hẹn nào sắp tới</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{appointment.doctorName}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{appointment.specialty}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {appointment.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                      {appointment.status === "pending" && (
                        <>
                          <button className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử khám bệnh ({pastAppointments.length})</h2>
          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có lịch sử khám bệnh</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-700">{appointment.doctorName}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-2">{appointment.specialty}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for appointment details */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết lịch hẹn</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Bác sĩ: </span>
                <span className="text-gray-600">{selectedAppointment.doctorName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Chuyên khoa: </span>
                <span className="text-gray-600">{selectedAppointment.specialty}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày: </span>
                <span className="text-gray-600">{new Date(selectedAppointment.date).toLocaleDateString("vi-VN")}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Giờ: </span>
                <span className="text-gray-600">{selectedAppointment.time}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Địa điểm: </span>
                <span className="text-gray-600">{selectedAppointment.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Lý do khám: </span>
                <span className="text-gray-600">{selectedAppointment.reason}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Trạng thái: </span>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
