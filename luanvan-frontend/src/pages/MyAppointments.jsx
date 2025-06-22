"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, MapPin, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { apiService } from "../services/api"

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Lấy dữ liệu lịch hẹn từ API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching user appointments...')
        const response = await apiService.getMyAppointments()
        console.log('✅ Raw appointments response:', response)
        
        // Debug: Check response structure
        console.log('📊 Response analysis:')
        console.log('  - Type:', typeof response)
        console.log('  - Is Array:', Array.isArray(response))
        console.log('  - Has content:', !!response?.content)
        console.log('  - Response keys:', response ? Object.keys(response) : 'null')
        
        // Determine the appointments array
        let appointmentsArray = []
        if (Array.isArray(response)) {
          appointmentsArray = response
          console.log('📋 Direct array response, length:', appointmentsArray.length)
        } else if (response?.content && Array.isArray(response.content)) {
          appointmentsArray = response.content
          console.log('📋 Paginated response, content length:', appointmentsArray.length)
        } else if (response?.data && Array.isArray(response.data)) {
          appointmentsArray = response.data
          console.log('📋 Data wrapper response, data length:', appointmentsArray.length)
        } else {
          console.warn('⚠️ Unexpected response format:', response)
          appointmentsArray = []
        }
        
        console.log('📋 Processing appointments array:', appointmentsArray)
        
        // Enhanced mapping with comprehensive fallbacks
        const formattedAppointments = appointmentsArray.map((apt, index) => {
          console.log(`🔍 Processing appointment ${index}:`, apt)
          
          // Get appointment ID with multiple fallbacks
          const appointmentId = apt.appointmentId || apt.appointment_id || apt.id || `temp_${index}`
          
          // Get doctor name with extensive fallbacks
          const doctorName = apt.doctor?.user?.full_name || 
                            apt.doctor?.user?.fullName || 
                            apt.doctor?.user?.name ||
                            apt.doctor?.fullName ||
                            apt.doctor?.full_name ||
                            apt.doctor?.name ||
                            apt.doctorName ||
                            apt.doctor_name ||
                            'N/A'
          
          // Get specialty with multiple sources
          const specialty = apt.specialty?.name || 
                           apt.specialty?.specialty_name ||
                           apt.specialtyName ||
                           apt.specialty_name ||
                           apt.doctor?.specialties?.[0]?.name ||
                           apt.doctor?.specialties?.[0]?.specialty_name ||
                           apt.doctor?.specialty?.name ||
                           'N/A'
          
          // Enhanced date/time parsing
          let appointmentDate = ''
          let appointmentTime = ''
          
          // Try different datetime field names
          const dateTimeValue = apt.appointmentDateTime || 
                               apt.appointment_date_time || 
                               apt.appointmentDate || 
                               apt.appointment_date ||
                               apt.dateTime ||
                               apt.date_time
          
          console.log(`  📅 DateTime value for apt ${index}:`, dateTimeValue)
          
          if (dateTimeValue) {
            try {
              // Handle different datetime formats
              let dateObj
              if (typeof dateTimeValue === 'string') {
                // Handle ISO string or date string
                dateObj = new Date(dateTimeValue)
              } else if (dateTimeValue instanceof Date) {
                dateObj = dateTimeValue
              } else if (typeof dateTimeValue === 'object' && dateTimeValue.toString) {
                // Handle timestamp or other date objects
                dateObj = new Date(dateTimeValue.toString())
              }
              
              if (dateObj && !isNaN(dateObj.getTime())) {
                // Format date as YYYY-MM-DD
                appointmentDate = dateObj.toISOString().split('T')[0]
                
                // Format time as HH:MM
                const timeStr = dateObj.toTimeString().split(' ')[0] // HH:MM:SS
                appointmentTime = timeStr.substring(0, 5) // HH:MM
                
                console.log(`  📅 Parsed date: ${appointmentDate}, time: ${appointmentTime}`)
              } else {
                console.warn(`  ⚠️ Invalid date for apt ${index}:`, dateTimeValue)
              }
            } catch (dateError) {
              console.error(`  ❌ Date parsing error for apt ${index}:`, dateError)
            }
          }
          
          // Fallback to separate date/time fields if datetime parsing failed
          if (!appointmentDate || !appointmentTime) {
            appointmentDate = apt.date || apt.appointment_date || appointmentDate || ''
            appointmentTime = apt.time || apt.appointment_time || 
                             apt.startTime || apt.start_time || appointmentTime || ''
          }
          
          // Get status with normalization
          const rawStatus = apt.status || apt.appointment_status || 'PENDING'
          const status = mapApiStatus(rawStatus)
          
          // Get reason with fallbacks
          const reason = apt.reasonForVisit || 
                        apt.reason_for_visit || 
                        apt.reason || 
                        apt.note || 
                        apt.notes ||
                        'Không có ghi chú'
          
          // Enhanced clinic info extraction
          const clinicName = apt.clinic?.name || 
                            apt.clinic?.clinic_name ||
                            apt.clinicName ||
                            apt.clinic_name ||
                            apt.doctor?.clinic?.name ||
                            apt.doctor?.clinic?.clinic_name ||
                            apt.doctor?.specialties?.[0]?.clinic?.name ||
                            apt.doctor?.specialties?.[0]?.clinic?.clinic_name ||
                            'N/A'
          
          const clinicAddress = apt.clinic?.address || 
                               apt.clinic?.clinic_address ||
                               apt.clinicAddress ||
                               apt.clinic_address ||
                               apt.doctor?.clinic?.address ||
                               apt.doctor?.clinic?.clinic_address ||
                               apt.doctor?.specialties?.[0]?.clinic?.address ||
                               apt.doctor?.specialties?.[0]?.clinic?.clinic_address ||
                               'N/A'
          
          const formattedApt = {
            id: appointmentId,
            doctorName,
            specialty,
            date: appointmentDate,
            time: appointmentTime,
            status,
            reason,
            location: clinicAddress,
            clinicName,
            rawData: apt // Keep for debugging
          }
          
          console.log(`  ✅ Formatted appointment ${index}:`, formattedApt)
          return formattedApt
        })
        
        setAppointments(formattedAppointments)
        console.log('✅ All formatted appointments:', formattedAppointments)
        
      } catch (err) {
        console.error('❌ Error fetching appointments:', err)
        setError(err.message || 'Không thể tải danh sách lịch hẹn')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Map API status sang UI status
  const mapApiStatus = (apiStatus) => {
    const statusMapping = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed', 
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled',
      'CANCELLED_BY_PATIENT': 'cancelled',
      'CANCELLED_BY_CLINIC': 'cancelled'
    }
    return statusMapping[apiStatus] || 'pending'
  }

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

  const handleCancelAppointment = async (id) => {
    try {
      const appointment = appointments.find(apt => apt.id === id)
      if (!appointment) return
      
      const confirmCancel = window.confirm(
        `Bạn có chắc chắn muốn hủy lịch hẹn với ${appointment.doctorName} vào ${appointment.date} lúc ${appointment.time}?`
      )
      
      if (!confirmCancel) return

      console.log('🔄 Cancelling appointment:', id)
      
      // TODO: Implement API call để hủy lịch hẹn
      // await apiService.cancelAppointmentByPatient(id, 'Hủy bởi bệnh nhân')
      
      // Update local state
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt)))
      
      console.log('✅ Appointment cancelled locally')
      alert('Đã hủy lịch hẹn! (Tạm thời chỉ cập nhật local, cần triển khai API)')
      
    } catch (err) {
      console.error('❌ Error cancelling appointment:', err)
      alert('Không thể hủy lịch hẹn. Vui lòng thử lại hoặc liên hệ hỗ trợ.')
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "confirmed" || apt.status === "pending")

  const pastAppointments = appointments.filter((apt) => apt.status === "completed" || apt.status === "cancelled")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch hẹn của tôi</h1>
            <p className="text-gray-600">Quản lý và theo dõi các lịch hẹn khám bệnh của bạn</p>
          </div>
          {!loading && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải lịch hẹn...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content - chỉ hiển thị khi không loading và không có lỗi */}
        {!loading && !error && (
          <>

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
                          {appointment.clinicName}
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
        </>
        )}
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
                <span className="font-medium text-gray-700">Phòng khám: </span>
                <span className="text-gray-600">{selectedAppointment.clinicName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Địa chỉ: </span>
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
