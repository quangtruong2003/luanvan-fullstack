"use client"

import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react"
import { useAuth } from "../context/AuthContext"
import { 
  Calendar, User, Stethoscope, Home, LayoutDashboard, LogOut, BookOpen,
  Menu, X, ChevronDown, Bell, Settings, Activity, Heart, 
  Shield, Crown, UserCheck, Sparkles, Zap, ArrowRight
} from "lucide-react"

const Menubar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)

  const { isSignedIn, user } = useUser()
  const { currentUser, isAdmin, isDoctor, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  // Close login dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginDropdownOpen && !event.target.closest('.login-dropdown')) {
        setLoginDropdownOpen(false)
      }
      // Close mobile menu when clicking outside
      if (menuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [loginDropdownOpen, menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getRoleInfo = () => {
    if (isAdmin()) {
      return {
        label: 'Admin',
        icon: Crown,
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        badge: 'bg-gradient-to-r from-red-500 to-pink-500'
      }
    } else if (isDoctor()) {
      return {
        label: 'Bác sĩ',
        icon: Stethoscope,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        badge: 'bg-gradient-to-r from-blue-500 to-cyan-500'
      }
    } else {
      return {
        label: 'Bệnh nhân',
        icon: UserCheck,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        badge: 'bg-gradient-to-r from-green-500 to-emerald-500'
      }
    }
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  // Enhanced menu links with role-based access
  const getMenuLinks = () => {
    if (currentUser && isSignedIn) {
      if (isAdmin()) {
        return [
          {
            to: "/admin/dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            description: "Quản lý hệ thống",
            color: "text-purple-600"
          }
        ]
      } else if (isDoctor()) {
        return [
          {
            to: "/doctor/dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            description: "Quản lý lịch khám",
            color: "text-blue-600"
          }
        ]
      }
    }

    // Default menu for patients and guests
    const links = [
      {
        to: "/",
        icon: Home,
        label: "Trang chủ",
        description: "Về trang chính",
        color: "text-gray-600"
      },
      {
        to: "/book-appointment",
        icon: Calendar,
        label: "Đặt lịch hẹn",
        description: "Đặt lịch khám bệnh",
        color: "text-blue-600",
        highlight: true
      },
      {
        to: "/pr",
        icon: BookOpen,
        label: "Giới thiệu",
        description: "Về chúng tôi",
        color: "text-green-600"
      },
    ];

    if (isSignedIn) {
      links.push({
        to: "/my-appointments",
        icon: Stethoscope,
        label: "Lịch hẹn của tôi",
        description: "Quản lý cuộc hẹn",
        color: "text-purple-600"
      });
    }

    return links;
  }

  // Enhanced auth buttons with role indicators
  const renderAuthButtons = () => {
    const roleInfo = getRoleInfo()

    // Custom UI for Admin and Doctor
    if (isAdmin() || isDoctor()) {
      const RoleIcon = roleInfo.icon
      
      return (
        <div className="flex items-center gap-4">
          {/* User Profile Card */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${roleInfo.bgColor} border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            {/* Role Badge */}
            <div className={`w-10 h-10 rounded-xl ${roleInfo.badge} flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            
            {/* User Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {currentUser?.fullName?.split(' ').pop() || 'User'}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${roleInfo.badge} text-white shadow-sm`}>
                  {roleInfo.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {currentUser?.email?.split('@')[0] || 'user'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="group p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl hover:bg-red-50 transition-all duration-300 transform hover:scale-105"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
          </button>
        </div>
      )
    }

    // Clerk UI for Patients and Guests
    return (
      <>
        <SignedOut>
          <div className="flex items-center gap-3">
            {/* Login Dropdown */}
            <div className="relative login-dropdown">
              <button 
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="relative px-6 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group flex items-center gap-2"
              >
                <span className="relative z-10">Đăng nhập</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Dropdown Menu */}
              {loginDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-xs font-medium text-gray-500">Chọn loại tài khoản</p>
                  </div>
                  
                  <div className="p-1">
                    {/* Patient Login */}
                    <SignInButton mode="modal">
                      <button 
                        className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-green-50 transition-colors duration-200"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                          <Heart className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                            Bệnh nhân
                          </div>
                          <div className="text-xs text-gray-500">
                            Đặt lịch khám bệnh
                          </div>
                        </div>
                      </button>
                    </SignInButton>

                    {/* Doctor/Admin Login */}
                    <button 
                      onClick={() => {
                        setLoginDropdownOpen(false)
                        navigate('/login')
                      }}
                      className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          Bác sĩ / Admin
                        </div>
                        <div className="text-xs text-gray-500">
                          Quản lý hệ thống
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <SignUpButton mode="modal">
              <button className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Đăng ký
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-4">
            {/* Patient Welcome Card */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-white/20 backdrop-blur-sm shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {user?.firstName || 'Bệnh nhân'}
                </span>
                <span className="text-xs text-gray-500">Chào mừng trở lại</span>
              </div>
            </div>
            <div className="relative group">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110",
                    userButtonPopoverCard: "shadow-2xl border-0 rounded-2xl backdrop-blur-xl bg-white/95",
                    userButtonPopoverActions: "rounded-xl"
                  }
                }}
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
            </div>
          </div>
        </SignedIn>
      </>
    )
  }

  // Simple mobile menu
  const renderMobileMenu = () => {
    if (!menuOpen) return null;
    
    return (
      <div className="mobile-menu lg:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {getMenuLinks().map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3 text-gray-400" />
                {link.label}
              </Link>
            );
          })}

          {/* Mobile Auth Section */}
          <div className="pt-4 border-t border-gray-200">
            <SignedOut>
              <div className="space-y-2">
                <p className="px-3 text-sm font-medium text-gray-500">Đăng nhập</p>
                
                {/* Patient Login */}
                <SignInButton mode="modal">
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-green-50 rounded-md"
                  >
                    <Heart className="w-5 h-5 mr-3 text-green-600" />
                    <span className="text-green-700 font-medium">Bệnh nhân</span>
                  </button>
                </SignInButton>

                {/* Doctor/Admin Login */}
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-blue-50 rounded-md"
                >
                  <Stethoscope className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-blue-700 font-medium">Bác sĩ / Admin</span>
                </button>

                {/* Sign Up */}
                <SignUpButton mode="modal">
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md"
                  >
                    <span className="text-gray-700 font-medium">Đăng ký</span>
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="px-3 py-2">
                <p className="text-sm text-gray-700 mb-2">Xin chào, {user?.firstName || 'Người dùng'}</p>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            {(isAdmin() || isDoctor()) && currentUser && (
              <div className="px-3 py-2 space-y-2">
                <p className="text-sm text-gray-700">Xin chào, {currentUser.fullName}</p>
                <p className="text-xs text-gray-500">{getRoleInfo().label}</p>
                <button
                  onClick={async () => {
                    await logout();
                    setMenuOpen(false);
                    navigate('/');
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <header 
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
          : 'bg-white/95 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Heart className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-300 -z-10"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Medical.Care
                </span>
                <span className="text-xs text-gray-500 -mt-1">Healthcare Platform</span>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {getMenuLinks().map((link) => {
              const Icon = link.icon
              const isActive = isActivePath(link.to)
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  } ${link.highlight && !isActive ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse"></div>
                  )}
                  {link.highlight && !isActive && (
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center">
            {renderAuthButtons()}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-button relative p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              {menuOpen ? (
                <X className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
              )}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
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