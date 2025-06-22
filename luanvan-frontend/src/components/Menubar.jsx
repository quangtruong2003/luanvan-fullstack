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
    return [
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
      {
        to: "/my-appointments",
        icon: Stethoscope,
        label: "Lịch hẹn của tôi",
        description: "Quản lý cuộc hẹn",
        color: "text-purple-600"
      }
    ]
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
            <SignInButton mode="modal">
              <button className="relative px-6 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group">
                <span className="relative z-10">Đăng nhập</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </SignInButton>
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

  // Enhanced mobile menu with modern animations
  const renderMobileMenu = () => {
    return (
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        
        {/* Mobile Menu Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Medical.Care
                  </span>
                  <div className="text-xs text-gray-500">Healthcare Platform</div>
                </div>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2 mb-8">
              {getMenuLinks().map((link, index) => {
                const Icon = link.icon
                const isActive = isActivePath(link.to)
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 shadow-md' 
                        : 'hover:bg-gray-50 hover:shadow-md'
                    }`}
                    onClick={() => setMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' 
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold transition-colors duration-300 ${
                        isActive ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {link.label}
                      </div>
                      <div className="text-xs text-gray-500">{link.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* User Section */}
            <div className="border-t border-gray-200/50 pt-6">
              {(isAdmin() || isDoctor()) ? (
                <div className="space-y-4">
                  {/* User Profile */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200/50">
                    <div className={`w-12 h-12 rounded-xl ${getRoleInfo().badge} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">
                        {currentUser?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{currentUser?.fullName}</div>
                      <div className="text-sm text-gray-500">{currentUser?.email}</div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getRoleInfo().badge} text-white mt-1`}>
                        {React.createElement(getRoleInfo().icon, { className: "w-3 h-3" })}
                        {getRoleInfo().label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={async () => { 
                      await logout(); 
                      setMenuOpen(false);
                      navigate('/'); 
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-600 hover:from-red-100 hover:to-pink-100 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors duration-300">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <SignInButton mode="modal">
                        <button 
                          className="w-full p-4 text-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => setMenuOpen(false)}
                        >
                          Đăng nhập
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button 
                          className="w-full p-4 text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-2xl transition-all duration-300"
                          onClick={() => setMenuOpen(false)}
                        >
                          Đăng ký tài khoản
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{user?.fullName || user?.firstName || 'Người dùng'}</div>
                        <div className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress || ''}</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <UserButton 
                        afterSignOutUrl="/" 
                        appearance={{
                          elements: {
                            avatarBox: "w-12 h-12 rounded-xl shadow-lg",
                            userButtonPopoverCard: "shadow-2xl border-0 rounded-2xl backdrop-blur-xl bg-white/95"
                          }
                        }}
                      />
                    </div>
                  </SignedIn>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
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
              onClick={() => setMenuOpen(true)}
              className="relative p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <Menu className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
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