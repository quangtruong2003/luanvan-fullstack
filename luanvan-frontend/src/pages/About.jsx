import React from 'react';
import { Shield, Clock, Users, Heart, CheckCircle, Phone } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'An toàn & Bảo mật',
      description: 'Thông tin cá nhân và y tế của bạn được bảo vệ theo tiêu chuẩn cao nhất'
    },
    {
      icon: Clock,
      title: 'Tiết kiệm thời gian',
      description: 'Đặt lịch khám chỉ trong vài phút, không cần xếp hàng chờ đợi'
    },
    {
      icon: Users,
      title: 'Đội ngũ chuyên môn',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm từ các bệnh viện hàng đầu'
    }
  ];

  const stats = [
    { number: '50+', label: 'Bác sĩ chuyên khoa' },
    { number: '1000+', label: 'Bệnh nhân tin tưởng' },
    { number: '6', label: 'Chuyên khoa' },
    { number: '99%', label: 'Đánh giá hài lòng' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Chăm sóc sức khỏe thông minh
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Đặt lịch khám trực tuyến - Tiết kiệm thời gian, tối ưu hiệu quả
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/book-appointment"
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                Đặt lịch ngay
              </a>
              <a
                href="#contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Liên hệ
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform -skew-y-3 origin-bottom-right"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tại sao chọn Medical.Care?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm đặt lịch khám bệnh thuận tiện và hiệu quả nhất cho bạn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quy trình đặt lịch đơn giản
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chỉ với 3 bước đơn giản, bạn có thể đặt lịch khám với bác sĩ mong muốn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chọn chuyên khoa/bác sĩ</h3>
            <p className="text-gray-600">
              Lựa chọn chuyên khoa phù hợp hoặc bác sĩ mà bạn mong muốn
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chọn thời gian</h3>
            <p className="text-gray-600">
              Lựa chọn ngày giờ khám phù hợp với lịch trình của bạn
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Xác nhận thông tin</h3>
            <p className="text-gray-600">
              Điền thông tin cá nhân và xác nhận đặt lịch
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi. 
                Đội ngũ hỗ trợ của Medical.Care luôn sẵn sàng phục vụ bạn.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hotline</p>
                    <p className="text-blue-600">1900 1234</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Giờ làm việc</p>
                    <p className="text-gray-600">24/7</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tin nhắn
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 