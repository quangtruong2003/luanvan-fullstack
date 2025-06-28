import { Link } from "react-router-dom"
import { ExternalLink, ChevronRight, Heart, Users, Clock, Shield } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative">
          {/* Newsletter Section */}
          <div className="border-b border-white/10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Đăng ký nhận tin mới nhất
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Cập nhật thông tin y tế, tips sức khỏe và ưu đãi đặc biệt từ chúng tôi
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="flex-1 px-6 py-4 rounded-l-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                  />
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-r-2xl font-semibold transition-all duration-300 hover:scale-105">
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                      Medical.Care
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Nền tảng y tế số 1 Việt Nam, kết nối bạn với đội ngũ bác sĩ chuyên khoa hàng đầu. 
                      Chăm sóc sức khỏe thông minh, hiện đại và đáng tin cậy.
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    {[
                      { icon: ExternalLink, href: "#", label: "Facebook" },
                      { icon: ExternalLink, href: "#", label: "Twitter" },
                      { icon: ExternalLink, href: "#", label: "Instagram" }
                    ].map((social, index) => (
                      <a 
                        key={`social-${index}`}
                        href={social.href} 
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-lg font-semibold mb-6 text-white">Dịch vụ</h4>
                  <ul className="space-y-3">
                    {[
                      { name: "Đặt lịch khám", href: "/book-appointment" },
                      { name: "Tư vấn trực tuyến", href: "/consultation" },
                      { name: "Khám tổng quát", href: "/general-checkup" },
                      { name: "Khám chuyên khoa", href: "/specialties" },
                      { name: "Xét nghiệm", href: "/lab-tests" }
                    ].map((item, index) => (
                      <li key={index}>
                        <Link 
                          to={item.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-lg font-semibold mb-6 text-white">Công ty</h4>
                  <ul className="space-y-3">
                    {[
                      { name: "Về chúng tôi", href: "/about" },
                      { name: "Đội ngũ bác sĩ", href: "/doctors" },
                      { name: "Tin tức", href: "/news" },
                      { name: "Careers", href: "/careers" },
                      { name: "Liên hệ", href: "/contact" }
                    ].map((item, index) => (
                      <li key={index}>
                        <Link 
                          to={item.href} 
                          className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-lg font-semibold mb-6 text-white">Liên hệ</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-300">123 Nguyễn Huệ, Quận 1</p>
                        <p className="text-gray-300">TP. Hồ Chí Minh, Việt Nam</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <a href="tel:1900123456" className="text-gray-300 hover:text-white transition-colors duration-300">
                        1900 123 456
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <a href="mailto:contact@medicalcare.vn" className="text-gray-300 hover:text-white transition-colors duration-300">
                        contact@medicalcare.vn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm">
                  © 2024 Medical.Care. Bảo lưu mọi quyền.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Chính sách bảo mật
                  </Link>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Điều khoản sử dụng
                  </Link>
                  <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer; 