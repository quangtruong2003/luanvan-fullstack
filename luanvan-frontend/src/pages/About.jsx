import React from 'react';
import { Heart, Users, Award, Clock } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Về Chúng Tôi
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Hệ thống đặt lịch khám bệnh trực tuyến hiện đại, mang đến dịch vụ chăm sóc sức khỏe 
          chuyên nghiệp và thuận tiện cho mọi người.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sứ Mệnh</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Chúng tôi cam kết cung cấp nền tảng kết nối bệnh nhân và bác sĩ một cách dễ dàng, 
            nhanh chóng và hiệu quả. Mục tiêu của chúng tôi là làm cho việc chăm sóc sức khỏe 
            trở nên dễ tiếp cận hơn với mọi người.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Đội Ngũ Chuyên Gia
          </h3>
          <p className="text-gray-600">
            Bác sĩ và chuyên gia y tế có trình độ cao, nhiều năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tiện Lợi 24/7
          </h3>
          <p className="text-gray-600">
            Đặt lịch khám bất cứ lúc nào, bất cứ nơi đâu. Hệ thống hoạt động 24/7 để phục vụ nhu cầu của bạn.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chất Lượng Đảm Bảo
          </h3>
          <p className="text-gray-600">
            Dịch vụ chất lượng cao với quy trình chuẩn y khoa, đảm bảo an toàn và hiệu quả cho bệnh nhân.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Thành Tích Đạt Được
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Bệnh nhân hài lòng</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Bác sĩ chuyên khoa</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
            <div className="text-gray-600">Chuyên khoa</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Giá Trị Cốt Lõi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              🏥 Chuyên Nghiệp
            </h3>
            <p className="text-gray-600">
              Đội ngũ y bác sĩ có trình độ chuyên môn cao, được đào tạo bài bản và có nhiều năm kinh nghiệm.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              🤝 Tận Tâm
            </h3>
            <p className="text-gray-600">
              Luôn đặt sức khỏe và sự hài lòng của bệnh nhân lên hàng đầu trong mọi hoạt động.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              🔒 Bảo Mật
            </h3>
            <p className="text-gray-600">
              Thông tin cá nhân và y tế của bệnh nhân được bảo mật tuyệt đối theo tiêu chuẩn quốc tế.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              💡 Đổi Mới
            </h3>
            <p className="text-gray-600">
              Ứng dụng công nghệ tiên tiến để mang đến trải nghiệm tốt nhất cho người dùng.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Liên Hệ Với Chúng Tôi
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp đỡ bạn.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📧 Email</h4>
            <p className="text-gray-600">support@luanvan.com</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📞 Hotline</h4>
            <p className="text-gray-600">1900 1234 56</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🕒 Giờ làm việc</h4>
            <p className="text-gray-600">Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 