"use client"

import { useState } from "react"
import { Calendar, Users, Clock, TrendingUp, User, Phone, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const stats = [
    {
      title: "Tổng lịch hẹn hôm nay",
      value: "24",
      icon: Calendar,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Bệnh nhân mới",
      value: "8",
      icon: Users,
      color: "bg-green-500",
      change: "+5%",
    },
    {
      title: "Lịch hẹn chờ xác nhận",
      value: "6",
      icon: Clock,
      color: "bg-yellow-500",
      change: "-2%",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: "94%",
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+3%",
    },
  ]

  const todayAppointments = [
    {
      id: 1,
      time: "08:00",
      patient: "Nguyễn Văn A",
      phone: "0901234567",
      reason: "Khám định kỳ",
      status: "confirmed",
    },
    {
      id: 2,
      time: "08:30",
      patient: "Trần Thị B",
      phone: "0907654321",
      reason: "Đau bụng",
      status: "pending",
    },
    {
      id: 3,
      time: "09:00",
      patient: "Lê Văn C",
      phone: "0912345678",
      reason: "Khám tổng quát",
      status: "completed",
    },
    {
      id: 4,
      time: "09:30",
      patient: "Phạm Thị D",
      phone: "0923456789",
      reason: "Tái khám",
      status: "confirmed",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "completed":
        return "Hoàn thành"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản lý</h1>
          <p className="text-gray-600">Tổng quan hệ thống đặt lịch hẹn - {new Date().toLocaleDateString("vi-VN")}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "appointments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Lịch hẹn hôm nay
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "patients"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Bệnh nhân
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                        {stat.change} so với tuần trước
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Tạo lịch hẹn mới</span>
                </button>
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Thêm bệnh nhân</span>
                </button>
                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Xem báo cáo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lịch hẹn hôm nay ({todayAppointments.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{appointment.time}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{appointment.patient}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{appointment.phone}</span>
                        </div>
                        <p className="text-gray-600">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(appointment.status)}
                      <span className="text-sm font-medium text-gray-700">{getStatusText(appointment.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý bệnh nhân</h3>
            <p className="text-gray-600">Tính năng quản lý bệnh nhân đang được phát triển...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
