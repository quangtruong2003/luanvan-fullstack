"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"

const Menubar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = { fullName: "User Name" } // Replace with actual user data

  const openLogin = () => {
    // Implement login modal logic
    console.log("Open Login Modal")
  }

  const openRegister = () => {
    // Implement register modal logic
    console.log("Open Register Modal")
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
            <SignedOut>
              <button className="text-gray-700 hover:text-blue-500 font-medium" onClick={openLogin}>
                Đăng nhập
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full transition-all"
                onClick={openRegister}
              >
                Đăng ký
              </button>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="flex items-center gap-2 bg-blue-100 px-4 sm:px-5 py-1.5 sm:py-2.5 rounded-full hover:scale-105 transition-all duration-500 cursor-pointer">
                  <img src="/placeholder.svg?height=24&width=24" alt="credit" height={24} width={24} />
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Credits: 0</p>
                </button>
                <p className="text-gray-600 max-sm:hidden">Xin chào, {user?.fullName}</p>
              </div>
              <UserButton />
            </SignedIn>
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
          <SignedOut>
            <hr className="my-2" />
            <button className="text-gray-700 hover:text-blue-500 font-medium py-2 text-left" onClick={openLogin}>
              Đăng nhập
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full text-center"
              onClick={openRegister}
            >
              Đăng ký
            </button>
          </SignedOut>
          <SignedIn>
            <hr className="my-2" />
            <div className="flex items-center gap-2 py-2">
              <button className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full">
                <img src="/placeholder.svg?height=20&width=20" alt="credit" height={20} width={20} />
                <p className="text-xs font-medium text-gray-600">Credits: 0</p>
              </button>
            </div>
            <p className="text-gray-600 text-sm py-1">Xin chào, {user?.fullName}</p>
            <UserButton />
          </SignedIn>
        </div>
      )}
    </nav>
  )
}

export default Menubar
