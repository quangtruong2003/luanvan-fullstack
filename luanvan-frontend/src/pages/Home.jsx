import { Link } from "react-router-dom"
import { Calendar, Users, Clock, Shield, Heart, Stethoscope } from "lucide-react"

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Đặt lịch dễ dàng",
      description: "Đặt lịch hẹn với bác sĩ chỉ trong vài phút",
    },
    {
      icon: Users,
      title: "Đội ngũ chuyên nghiệp",
      description: "Bác sĩ giàu kinh nghiệm và tận tâm",
    },
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      description: "Không cần chờ đợi, đúng giờ hẹn",
    },
    {
      icon: Shield,
      title: "An toàn bảo mật",
      description: "Thông tin cá nhân được bảo vệ tuyệt đối",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full">
              <Heart className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Chăm sóc sức khỏe
            <span className="text-blue-600"> thông minh</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Đặt lịch hẹn với bác sĩ một cách nhanh chóng và tiện lợi. Hệ thống quản lý lịch hẹn hiện đại giúp bạn tiết
            kiệm thời gian và nhận được dịch vụ y tế tốt nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-appointment"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Đặt lịch hẹn ngay
            </Link>
            <Link
              to="/my-appointments"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-5 h-5" />
              Xem lịch hẹn
            </Link>
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

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Đặt lịch hẹn với bác sĩ ngay hôm nay và trải nghiệm dịch vụ y tế hiện đại
          </p>
          <Link
            to="/book-appointment"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Đặt lịch hẹn ngay
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
