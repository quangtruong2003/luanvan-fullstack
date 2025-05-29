"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react"
import { useAuth } from "../context/AuthContext"

const Menubar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useUser()
  const { currentUser, isAdmin, isDoctor, logout } = useAuth()

  // Hiển thị menu khác nhau tùy theo vai trò người dùng
  const renderMenuLinks = () => {
    if (currentUser) {
      // Nếu đã đăng nhập bằng tài khoản thông thường (admin hoặc bác sĩ)
      if (isAdmin()) {
        return (
          <>
            <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
              Dashboard
            </Link>
            <button 
              onClick={() => { logout(); window.location.href = '/login'; }} 
              className="text-gray-700 hover:text-red-500 font-medium transition-colors"
            >
              Đăng xuất
            </button>
          </>
        )
      } else if (isDoctor()) {
        return (
          <>
            <Link to="/doctor/dashboard" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
              Dashboard
            </Link>
            <button 
              onClick={() => { logout(); window.location.href = '/login'; }} 
              className="text-gray-700 hover:text-red-500 font-medium transition-colors"
            >
              Đăng xuất
            </button>
          </>
        )
      }
    }

    // Nếu chưa đăng nhập hoặc đăng nhập bằng Clerk (bệnh nhân)
    return (
      <>
        <Link to="/" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
          Trang chủ
        </Link>
        <Link to="/book-appointment" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
          Đặt lịch hẹn
        </Link>
        <Link to="/my-appointments" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
          Lịch hẹn của tôi
        </Link>
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-500 font-medium transition-colors">
          Dashboard
        </Link>
      </>
    )
  }

  // Hiển thị nút đăng nhập tùy theo loại người dùng
  const renderAuthButtons = () => {
    // Nếu đã đăng nhập bằng tài khoản thông thường
    if (currentUser) {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <p className="text-gray-600">
            Xin chào, {currentUser.fullName}
          </p>
        </div>
      )
    }

    // Người dùng chưa đăng nhập hoặc đăng nhập bằng Clerk
    return (
      <>
        <SignedOut>
          <div className="flex items-center space-x-2">
            <SignInButton mode="modal">
              <button className="text-gray-700 hover:text-blue-500 font-medium">
                Đăng nhập
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full transition-all">
                Đăng ký
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 bg-blue-100 px-4 sm:px-5 py-1.5 sm:py-2.5 rounded-full hover:scale-105 transition-all duration-500 cursor-pointer">
              <img src="/placeholder.svg?height=24&width=24" alt="credit" height={24} width={24} />
              <p className="text-xs sm:text-sm font-medium text-gray-600">Credits: 0</p>
            </button>
            <p className="text-gray-600 max-sm:hidden">
              Xin chào, {user?.firstName || user?.fullName || 'Người dùng'}
            </p>
            <UserButton />
          </div>
        </SignedIn>
      </>
    )
  }

  // Mobile menu items
  const renderMobileMenuLinks = () => {
    if (currentUser) {
      // Nếu đã đăng nhập bằng tài khoản thông thường (admin hoặc bác sĩ)
      if (isAdmin()) {
        return (
          <>
            <Link
              to="/admin/dashboard"
              className="text-gray-700 hover:text-blue-500 font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="text-red-600 hover:text-red-800 font-medium py-2 text-left w-full"
            >
              Đăng xuất
            </button>
          </>
        )
      } else if (isDoctor()) {
        return (
          <>
            <Link
              to="/doctor/dashboard"
              className="text-gray-700 hover:text-blue-500 font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="text-red-600 hover:text-red-800 font-medium py-2 text-left w-full"
            >
              Đăng xuất
            </button>
          </>
        )
      }
    }

    // Bệnh nhân hoặc chưa đăng nhập
    return (
      <>
        <Link
          to="/"
          className="text-gray-700 hover:text-blue-500 font-medium py-2"
          onClick={() => setMenuOpen(false)}
        >
          Trang chủ
        </Link>
        <Link
          to="/book-appointment"
          className="text-gray-700 hover:text-blue-500 font-medium py-2"
          onClick={() => setMenuOpen(false)}
        >
          Đặt lịch hẹn
        </Link>
        <Link
          to="/my-appointments"
          className="text-gray-700 hover:text-blue-500 font-medium py-2"
          onClick={() => setMenuOpen(false)}
        >
          Lịch hẹn của tôi
        </Link>
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-blue-500 font-medium py-2"
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
      </>
    )
  }

  const renderMobileAuthButtons = () => {
    // Nếu đã đăng nhập bằng tài khoản thông thường
    if (currentUser) {
      return (
        <>
          <hr className="my-2" />
          <p className="text-gray-600 text-sm py-1">
            Xin chào, {currentUser.fullName}
          </p>
        </>
      )
    }

    // Chưa đăng nhập hoặc đăng nhập bằng Clerk
    return (
      <>
        <SignedOut>
          <hr className="my-2" />
          <div className="flex flex-col gap-2">
            <SignInButton mode="modal">
              <button className="text-gray-700 hover:text-blue-500 font-medium py-2 text-left w-full">
                Đăng nhập
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full text-center">
                Đăng ký
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <hr className="my-2" />
          <div className="flex items-center gap-2 py-2">
            <button className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full">
              <img src="/placeholder.svg?height=20&width=20" alt="credit" height={20} width={20} />
              <p className="text-xs font-medium text-gray-600">Credits: 0</p>
            </button>
          </div>
          <p className="text-gray-600 text-sm py-1">
            Xin chào, {user?.firstName || user?.fullName || 'Người dùng'}
          </p>
          <UserButton />
        </SignedIn>
      </>
    )
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link to="/">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Logo"
                  className="h-8 w-8 object-contain cursor-pointer"
                />
              </Link>
              <Link to="/" className="ml-2">
                <span className="text-2xl font-semibold text-blue-700 cursor-pointer">
                  Medical.<span className="text-gray-400 cursor-pointer">Care</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {renderMenuLinks()}
            {renderAuthButtons()}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${menuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${menuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-16 right-8 bg-white shadow-lg rounded-md flex flex-col space-y-2 p-4 w-48 z-50">
          {renderMobileMenuLinks()}
          {renderMobileAuthButtons()}
        </div>
      )}
    </nav>
  )
}

export default Menubar
