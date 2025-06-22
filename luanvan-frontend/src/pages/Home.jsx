import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Calendar, Users, Clock, Shield, Heart, Stethoscope, ChevronRight, Check, Star, ChevronLeft, ArrowRight, Play, Award, TrendingUp, Zap, ExternalLink } from "lucide-react"
import { apiService } from "../services/api";

const Home = () => {
  // Clinic slideshow state
  const [clinics, setClinics] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Doctor state
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const [isVisible, setIsVisible] = useState(false);

  // Number of clinics to show per slide
  const clinicsPerSlide = 4;
  const totalSlides = Math.max(1, Math.ceil(clinics.length / clinicsPerSlide));

  // Fetch data
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await apiService.getClinics();
        setClinics(Array.isArray(response?.content) ? response.content : []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await apiService.getDoctors({ page: 0, size: 3 });
        if (response && response.content) {
          const formattedDoctors = response.content.map(doc => ({
            id: doc.doctor_id,
            name: doc.user.full_name,
            specialty: doc.specialties?.map(s => s.name).join(' & ') || 'Chuyên khoa chung',
            rating: (Math.random() * (5.0 - 4.7) + 4.7).toFixed(1),
            experience: `${doc.years_of_experience || 5} năm kinh nghiệm`,
            patients: `${(doc.years_of_experience || 5) * 250 + Math.floor(Math.random() * 500)}+ bệnh nhân`,
            image: doc.user.image_url || `https://source.unsplash.com/400x400/?doctor,person,${doc.doctor_id}`,
            achievements: ['Chuyên gia hàng đầu', 'Bằng cấp quốc tế'].slice(0, Math.floor(Math.random() * 2) + 1)
          }));
          setDoctors(formattedDoctors);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchClinics();
    fetchDoctors();
    setIsVisible(true);
  }, []);

  // Slideshow navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-play slideshow
  useEffect(() => {
    if (totalSlides > 1 && !loading && clinics.length > 0) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [totalSlides, loading, clinics.length]);

  const features = [
    {
      icon: Zap,
      title: "Đặt lịch nhanh chóng",
      description: "Chỉ 30 giây để đặt lịch hẹn với bác sĩ chuyên khoa. Giao diện thông minh, tối ưu trải nghiệm.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Đội ngũ y tế hàng đầu",
      description: "200+ bác sĩ chuyên khoa với bằng cấp quốc tế, kinh nghiệm trung bình 15+ năm.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      title: "Hiệu quả vượt trội",
      description: "Tiết kiệm 85% thời gian chờ đợi. Quy trình tối ưu, chính xác cao.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description: "Mã hóa AES-256, tuân thủ HIPAA. Thông tin y tế được bảo vệ tối đa.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    },
  ]

  const stats = [
    { value: "150K+", label: "Bệnh nhân tin tưởng", icon: Users },
    { value: "200+", label: "Bác sĩ chuyên khoa", icon: Stethoscope },
    { value: "24/7", label: "Hỗ trợ không ngừng", icon: Clock },
    { value: "99.5%", label: "Mức độ hài lòng", icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Hero Section with Glass Morphism */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-ping"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
          
          {/* Geometric Patterns */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Hero Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white/90 text-sm font-medium mb-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Award className="w-4 h-4 text-yellow-300" />
              Hệ thống y tế đáng tin cậy #1 Việt Nam
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* Main Heading */}
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Chăm sóc sức khỏe
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                thế hệ mới
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Đặt lịch khám bệnh thông minh với AI, kết nối trực tiếp với 200+ bác sĩ chuyên khoa hàng đầu
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link
                to="/book-appointment"
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 hover:rotate-1 flex items-center gap-3"
              >
                <Calendar className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                Đặt lịch hẹn ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <button className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                Xem demo 2 phút
              </button>
            </div>

            {/* Trust Indicators */}
            <div className={`mt-16 flex flex-wrap justify-center items-center gap-8 text-blue-200/80 transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Bảo mật chuẩn quốc tế</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Được cấp phép hoạt động</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium">Giải thưởng uy tín 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Modern Stats Section */}
      <div className="relative py-20 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Clinic Partners Section */}
      <div className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Đối tác tin cậy
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Mạng lưới phòng khám hàng đầu
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kết nối với hệ thống y tế uy tín, đảm bảo chất lượng dịch vụ tốt nhất
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : clinics.length > 0 ? (
            <div className="relative">
              {/* Slideshow container */}
              <div className="overflow-hidden rounded-3xl">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }, (_, slideIndex) => {
                    const slideStart = slideIndex * clinicsPerSlide;
                    const slideEnd = slideStart + clinicsPerSlide;
                    const slideClinics = clinics.slice(slideStart, slideEnd);
                    
                    return (
                      <div key={slideIndex} className="w-full flex-shrink-0 px-8 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                          {slideClinics.map((clinic) => (
                            <div key={clinic.clinic_id} className="group relative h-full">
                              <div className="h-full min-h-[400px] flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                                {/* Logo */}
                                <div className="relative mb-6">
                                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-0.5 group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                                      {clinic.logo_url ? (
                                        <img 
                                          src={clinic.logo_url} 
                                          alt={clinic.name}
                                          className="w-16 h-16 rounded-xl object-cover"
                                        />
                                      ) : (
                                        <Heart className="w-8 h-8 text-blue-600" />
                                      )}
                                    </div>
                                  </div>
                                  {/* Trust badge */}
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                
                                {/* Clinic name - Fixed height */}
                                <div className="h-16 flex items-center justify-center mb-4">
                                  <h3 className="text-lg font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight"
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}>
                                    {clinic.name}
                                  </h3>
                                </div>
                                
                                {/* Clinic info - Fixed height */}
                                <div className="h-20 flex items-start justify-center mb-6">
                                  <p className="text-sm text-gray-600 text-center leading-relaxed"
                                     style={{
                                       display: '-webkit-box',
                                       WebkitLineClamp: 3,
                                       WebkitBoxOrient: 'vertical',
                                       overflow: 'hidden'
                                     }}>
                                    {clinic.address}
                                  </p>
                                </div>
                                
                                {/* Specialties - Flexible at bottom */}
                                <div className="mt-auto">
                                  <div className="flex flex-wrap justify-center gap-2 min-h-[2.5rem] items-center">
                                    {clinic.specialties?.slice(0, 2).map((specialty) => (
                                      <span 
                                        key={`clinic-${clinic.clinic_id}-specialty-${specialty.specialty_id}`}
                                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 whitespace-nowrap"
                                      >
                                        {specialty.name}
                                      </span>
                                    ))}
                                    {clinic.specialties?.length > 2 && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200 whitespace-nowrap">
                                        +{clinic.specialties.length - 2} khoa
                                      </span>
                                    )}
                                    {(!clinic.specialties || clinic.specialties.length === 0) && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
                                        Đa chuyên khoa
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Fill empty slots if needed */}
                          {slideClinics.length < clinicsPerSlide && 
                            Array.from({ length: clinicsPerSlide - slideClinics.length }, (_, emptyIndex) => (
                              <div key={`empty-${emptyIndex}`} className="opacity-0">
                                <div className="h-full min-h-[400px]"></div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Navigation arrows */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20 flex items-center justify-center group"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20 flex items-center justify-center group"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
                  </button>
                </>
              )}
              
              {/* Dots indicator */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-12 space-x-3">
                  {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSlide 
                          ? 'w-8 h-3 bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Đang cập nhật danh sách đối tác...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Features Section */}
      <div className="py-32 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              Ưu điểm vượt trội
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Tại sao chọn chúng tôi?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi kết hợp công nghệ tiên tiến với chăm sóc y tế chuyên nghiệp, 
              mang đến trải nghiệm đặt lịch khám bệnh hoàn toàn mới
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`h-full bg-gradient-to-br from-white to-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 ${feature.bgColor} hover:scale-105`}>
                  {/* Icon */}
                  <div className="relative mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl`}></div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Background gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Doctors Section */}
      {doctorsLoading ? (
        <div className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex justify-center items-center">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-blue-400/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-8 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : doctors.length > 0 && (
        <div className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold mb-6">
                <Stethoscope className="w-4 h-4" />
                Đội ngũ y tế hàng đầu
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Gặp gỡ các 
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent"> chuyên gia</span> hàng đầu
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Đội ngũ bác sĩ với kinh nghiệm quốc tế, bằng cấp uy tín và sự tận tâm cao nhất
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="group">
                  <div className="h-full flex flex-col bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-4">
                    {/* Doctor Image */}
                    <div className="relative overflow-hidden">
                      <img
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                        src={doctor.image}
                        alt={doctor.name}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                      </div>
                      
                      {/* Achievement Badges */}
                      <div className="absolute top-4 left-4 space-y-2">
                        {doctor.achievements?.map((achievement, idx) => (
                          <div key={`doctor-${doctor.id}-achievement-${idx}`} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold rounded-full">
                            {doctor.specialty}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-blue-200 font-medium">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span>{doctor.experience}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white my-4 h-16 flex items-center group-hover:text-yellow-300 transition-colors duration-300">
                          {doctor.name}
                        </h3>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/10">
                        <Link
                          to={`/book-appointment/doctor/${doctor.id}`}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-2 group"
                        >
                          <Calendar className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                          <span>Đặt lịch ngay</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Tìm kiếm bác sĩ phù hợp?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Khám phá đội ngũ 200+ bác sĩ chuyên khoa với nhiều lĩnh vực khác nhau
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/doctors"
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-md inline-flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Xem tất cả bác sĩ
                </Link>
                <Link
                  to="/specialties"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-5 h-5" />
                  Tìm theo chuyên khoa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Why Choose Us Section */}
      <div className="py-32 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content Side */}
            <div className="mb-16 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold mb-8">
                <Award className="w-4 h-4" />
                Vì sao chọn chúng tôi
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Sự lựa chọn
                </span>
                <br />
                <span className="text-blue-600">thông minh nhất</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Chúng tôi không chỉ kết nối bạn với bác sĩ, mà còn mang đến một hệ sinh thái chăm sóc sức khỏe hoàn chỉnh
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Users,
                    title: "200+ Bác sĩ chuyên môn cao",
                    description: "Đội ngũ y tế hàng đầu với bằng cấp quốc tế, kinh nghiệm điều trị đa dạng và tỷ lệ thành công cao",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: Zap,
                    title: "Công nghệ AI thông minh",
                    description: "Hệ thống gợi ý bác sĩ phù hợp, tự động sắp xếp lịch hẹn và nhắc nhở thông minh",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: Shield,
                    title: "Bảo mật & Tin cậy tuyệt đối",
                    description: "Mã hóa end-to-end, tuân thủ tiêu chuẩn HIPAA, đảm bảo thông tin y tế được bảo vệ tối đa",
                    color: "from-green-500 to-emerald-500"
                  }
                ].map((item, index) => (
                  <div key={index} className="group flex items-start gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Image Side */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&crop=center"
                  alt="Modern Healthcare Technology"
                  className="rounded-3xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">99.5%</div>
                    <div className="text-xs text-white/80">Hài lòng</div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
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
    </div>
  )
}
export default Home