"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react"
import { useAuth } from "../context/AuthContext"
import { Calendar, User, Stethoscope, Home, LayoutDashboard, LogOut } from "lucide-react"

const Menubar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useUser()
  const { currentUser, isAdmin, isDoctor, logout } = useAuth()

  // Hiển thị menu khác nhau tùy theo vai trò người dùng
  const renderMenuLinks = () => {
    if (currentUser) {
      if (isAdmin()) {
        return (
          <>
            <Link to="/admin/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <button 
              onClick={() => { logout(); window.location.href = '/login'; }} 
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </>
        )
      } else if (isDoctor()) {
        return (
          <>
            <Link to="/doctor/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <button 
              onClick={() => { logout(); window.location.href = '/login'; }} 
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </>
        )
      }
    }

    // Menu cho bệnh nhân hoặc chưa đăng nhập
    return (
      <>
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
          <Home className="w-5 h-5" />
          Trang chủ
        </Link>
        <Link to="/book-appointment" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
          <Calendar className="w-5 h-5" />
          Đặt lịch hẹn
        </Link>
        <Link to="/my-appointments" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
          <Stethoscope className="w-5 h-5" />
          Lịch hẹn của tôi
        </Link>
      </>
    )
  }

  // Hiển thị nút đăng nhập/đăng ký
  const renderAuthButtons = () => {
    if (currentUser) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {currentUser.fullName.charAt(0)}
            </div>
            <p className="text-gray-700 font-medium">
              Xin chào, <span className="text-blue-600">{currentUser.fullName.split(' ').pop()}</span>
            </p>
          </div>
          <button 
            onClick={() => { logout(); window.location.href = '/login'; }} 
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )
    }

    return (
      <>
        <SignedOut>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 transition-colors">
                Đăng nhập
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg">
                Đăng ký
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <p className="text-gray-700 font-medium">
                Xin chào, <span className="text-blue-600">{user?.firstName || 'Người dùng'}</span>
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </>
    )
  }

  // Mobile menu
  const renderMobileMenu = () => {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="h-8 w-8"
                />
                <span className="ml-2 text-xl font-bold text-blue-700">Medical.Care</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {currentUser ? (
                isAdmin() ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                  </>
                ) : isDoctor() ? (
                  <>
                    <Link
                      to="/doctor/dashboard"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                  </>
                ) : null
              ) : (
                <>
                  <Link
                    to="/"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    Trang chủ
                  </Link>
                  <Link
                    to="/book-appointment"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    Đặt lịch hẹn
                  </Link>
                  <Link
                    to="/my-appointments"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Stethoscope className="w-5 h-5" />
                    Lịch hẹn của tôi
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{currentUser.fullName}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="flex items-center gap-3 w-full text-red-600 hover:text-red-700 font-medium py-3 px-4 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <SignInButton mode="modal">
                        <button 
                          className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Đăng nhập
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button 
                          className="w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2.5 rounded-lg transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Đăng ký
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.fullName || user?.firstName || 'Người dùng'}</p>
                        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress || ''}</p>
                      </div>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-blue-700">Medical.Care</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {renderMenuLinks()}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center">
            {renderAuthButtons()}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {renderMobileMenu()}
    </header>
  )
}

export default Menubar