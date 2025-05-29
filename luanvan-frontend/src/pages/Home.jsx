import { Link } from "react-router-dom"
import { Calendar, Users, Clock, Shield, Heart, Stethoscope, ChevronRight, Check, Star } from "lucide-react"
import { Facebook, Twitter, Instagram } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Đặt lịch dễ dàng",
      description: "Đặt lịch hẹn với bác sĩ chỉ trong vài phút, mọi lúc mọi nơi",
    },
    {
      icon: Users,
      title: "Đội ngũ chuyên nghiệp",
      description: "Hơn 100 bác sĩ chuyên khoa giàu kinh nghiệm và tận tâm",
    },
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      description: "Giảm 80% thời gian chờ đợi so với phương pháp truyền thống",
    },
    {
      icon: Shield,
      title: "An toàn bảo mật",
      description: "Hệ thống bảo mật đạt chuẩn quốc tế, mã hóa thông tin",
    },
  ]

  const doctors = [
    {
      name: "TS.BS Nguyễn Văn A",
      specialty: "Tim mạch",
      rating: 4.9,
      experience: "15 năm kinh nghiệm",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "ThS.BS Trần Thị B",
      specialty: "Nhi khoa",
      rating: 4.8,
      experience: "12 năm kinh nghiệm",
      image: "https://via.placeholder.com/150",
    },
  ]

  const stats = [
    { value: "50.000+", label: "Bệnh nhân hài lòng" },
    { value: "100+", label: "Bác sĩ chuyên khoa" },
    { value: "24/7", label: "Hỗ trợ khách hàng" },
    { value: "98%", label: "Hài lòng dịch vụ" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative z-10 lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Chăm sóc sức khỏe <span className="text-yellow-300">toàn diện</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Hệ thống đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/book-appointment"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Đặt lịch hẹn ngay
              </Link>
              <Link
                to="/my-appointments"
                className="bg-transparent hover:bg-blue-700 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-5 h-5" />
                Xem lịch hẹn
              </Link>
            </div>
          </div>
        </div>
        
        {/* Ảnh bác sĩ */}
       {/* Ảnh nền full-width */}
        <div className="absolute inset-0">
          {/* overlay đen để chữ nổi bật */}
          <div className="absolute inset-0 bg-black opacity-40"></div>

          <img
            src="https://dangtiendung.edu.vn/wp-content/uploads/2021/10/1-ky-nang-giao-tiep-giua-thay-thuoc-va-benh-nhan-quan-trong-the-nao.jpg"
            alt="Bác sĩ đang khám bệnh"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-xl p-8 -mt-16 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với sự tiện lợi tối đa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ <span className="text-blue-600">bác sĩ chuyên khoa</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Các chuyên gia đầu ngành với nhiều năm kinh nghiệm
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {doctors.map((doctor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img
                      className="h-48 w-full md:w-48 object-cover"
                      src={doctor.image}
                      alt={doctor.name}
                    />
                  </div>
                  <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
                      {doctor.specialty}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{doctor.name}</h3>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">{doctor.rating}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{doctor.experience}</p>
                    <div className="mt-4">
                      <Link
                        to="/book-appointment"
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        Đặt lịch ngay <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/doctors"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Xem tất cả bác sĩ
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Tại sao nên chọn <span className="text-blue-600">chúng tôi?</span>
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="flex-shrink-0 w-6 h-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Đội ngũ bác sĩ giỏi</h3>
                  <p className="text-gray-600">
                    Hơn 100 bác sĩ chuyên khoa đầu ngành với trình độ chuyên môn cao
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="flex-shrink-0 w-6 h-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Công nghệ hiện đại</h3>
                  <p className="text-gray-600">
                    Hệ thống đặt lịch thông minh, tiết kiệm thời gian và công sức
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Check className="flex-shrink-0 w-6 h-6 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dịch vụ toàn diện</h3>
                  <p className="text-gray-600">
                    Cung cấp đầy đủ các dịch vụ y tế từ khám chữa bệnh đến tư vấn sức khỏe
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 lg:pl-12">
            <img
              src="https://medpro.vn/_next/image?url=%2Fimages%2Fwhy-choose-us.png&w=1080&q=75"
              alt="Tại sao chọn chúng tôi"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* ============================= */}
{/*       CTA Section MỚI        */}
{/* ============================= */}
{/* CTA Section (tối giản, sáng sủa) */}
{/* <section className="bg-gray-50 py-16">
  <div className="max-w-3xl mx-auto px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      Đặt lịch khám nhanh chóng, an tâm chăm sóc
    </h2>
    <p className="text-lg text-gray-600 mb-6">
      Hãy để chúng tôi đồng hành cùng bạn. Chỉ với một cú click, lịch hẹn sẽ đến ngay trong tay.
    </p>
    <Link
      to="/book-appointment"
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-full transition-shadow shadow-sm hover:shadow-md"
    >
      <Calendar className="w-5 h-5" />
      Đặt lịch ngay
    </Link>
  </div>
</section> */}


{/* ============================= */}
{/*         Footer MỚI           */}
{/* ============================= */}
<footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
    {/* Logo & Mô tả */}
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Medical.Care</h3>
      <p className="text-sm opacity-80">
        Cung cấp dịch vụ y tế trực tuyến chuyên nghiệp, kết nối bạn với đội ngũ bác sĩ hàng đầu.
      </p>
      <div className="flex space-x-4">
        <a href="#" className="hover:text-white"><Facebook className="w-5 h-5"/></a>
        <a href="#" className="hover:text-white"><Twitter className="w-5 h-5"/></a>
        <a href="#" className="hover:text-white"><Instagram className="w-5 h-5"/></a>
      </div>
    </div>

    {/* Liên kết */}
    <div>
      <h4 className="font-semibold mb-4">Liên kết</h4>
      <ul className="space-y-2 text-sm">
        <li><Link to="/" className="hover:text-white">Trang chủ</Link></li>
        <li><Link to="/book-appointment" className="hover:text-white">Đặt lịch hẹn</Link></li>
        <li><Link to="/doctors" className="hover:text-white">Đội ngũ bác sĩ</Link></li>
        <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
      </ul>
    </div>

    {/* Liên hệ */}
    <div>
      <h4 className="font-semibold mb-4">Liên hệ</h4>
      <p className="text-sm opacity-80">123 Đường ABC, Quận 1, TP. HCM</p>
      <p className="text-sm opacity-80 mt-2">
        Hotline: <a href="tel:0123456789" className="hover:text-white">0123 456 789</a>
      </p>
      <p className="text-sm opacity-80">
        Email: <a href="mailto:info@healthcare.com" className="hover:text-white">info@healthcare.com</a>
      </p>
    </div>

    {/* Đăng ký nhận tin */}
    <div>
      <h4 className="font-semibold mb-4">Đăng ký nhận tin</h4>
      <p className="text-sm opacity-80 mb-4">
        Nhập email để nhận thông tin khuyến mãi và tin tức y tế mới nhất.
      </p>
      <form className="flex">
        <input
          type="email"
          placeholder="Email của bạn"
          className="flex-grow px-4 py-2 rounded-l-full bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 px-5 rounded-r-full text-white font-semibold transition"
        >
          Đăng ký
        </button>
      </form>
    </div>
  </div>
</footer>

    </div>
  )
}
export default Home