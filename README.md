# 🏥 Hệ Thống Đặt Lịch Khám Bệnh Thông Minh - Medistar

Dự án này là một hệ thống quản lý và đặt lịch khám bệnh trực tuyến toàn diện, được xây dựng với mục tiêu hiện đại hóa quy trình chăm sóc sức khỏe. Hệ thống bao gồm một backend mạnh mẽ được xây dựng bằng Spring Boot và một frontend linh hoạt, thân thiện với người dùng được xây dựng bằng React (Vite).

---

<details open>
<summary><h2>🇬🇧 English Documentation</h2></summary>

### Project Overview

This project is a comprehensive online medical appointment booking and management system, built to modernize the healthcare process. It features a robust backend powered by Spring Boot and a dynamic, user-friendly frontend built with React (Vite).

### Features

- **For Patients**: Search for doctors/clinics, book appointments, manage personal appointments, receive notifications.
- **For Doctors**: Manage schedules, view appointment lists, update patient records.
- **For Admins**: Manage users, doctors, clinics, specialties, and system settings.
- **Technology**: AI integration for smart recommendations, secure payments, real-time notifications.

### Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security, JPA (Hibernate), Maven, MySQL.
- **Frontend**: React.js, Vite, Tailwind CSS, Axios.
- **Database**: MySQL.
- **Deployment**: Docker.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Java Development Kit (JDK)**: Version 17 or later.
- **Apache Maven**: Version 3.8 or later.
- **Node.js**: Version 18.x or later.
- **npm**: Version 9.x or later (usually comes with Node.js).
- **MySQL**: A running instance of MySQL database.
- **Git**: For cloning the repository.

### Setup & Installation

#### 1. Backend Setup (Spring Boot)

1.  **Navigate to the backend directory**:
    ```bash
    cd luanvan-backend
    ```

2.  **Add MySQL Dependency** (if not present):
    - Open the `pom.xml` file.
    - Ensure the following dependency for MySQL is included. If you have a `postgresql` dependency, replace it.
      ```xml
      <dependency>
          <groupId>com.mysql</groupId>
          <artifactId>mysql-connector-j</artifactId>
          <scope>runtime</scope>
      </dependency>
      ```

3.  **Configure the Database**:
    - Open the `src/main/resources/application.properties` file.
    - Update the following properties to match your MySQL configuration:
      ```properties
      spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      spring.datasource.username=your_mysql_username
      spring.datasource.password=your_mysql_password
      spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
      ```
    - Make sure you have created the database `your_database_name` in MySQL. The tables will be created automatically by Flyway migrations.

4.  **Install Dependencies**:
    If you modified `pom.xml`, update the dependencies. Otherwise, this step ensures everything is correct.
    ```bash
    mvn clean install
    ```

5.  **Run the Backend**:
    ```bash
    mvn spring-boot:run
    ```
    The backend server will start on port `8080` by default.

#### 2. Frontend Setup (React + Vite)

1.  **Navigate to the frontend directory**:
    ```bash
    cd luanvan-frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure API Endpoint**:
    - Open the `src/services/api.js` file.
    - Ensure the `baseURL` points to your running backend server. By default, it is configured for `http://localhost:8080`.
      ```javascript
      // src/services/api.js
      const apiService = axios.create({
        baseURL: 'http://localhost:8080', // Make sure this is correct
        // ... other configs
      });
      ```

4.  **Run the Frontend**:
    ```bash
    npm run dev
    ```
    The frontend development server will start, typically on port `5173`.

### Running the Application

After completing the setup for both backend and frontend:

1.  Ensure your **MySQL** database is running.
2.  Start the **Backend** server from the `luanvan-backend` directory.
3.  Start the **Frontend** server from the `luanvan-frontend` directory.
4.  Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

</details>

<details>
<summary><h2>🇻🇳 Tài Liệu Tiếng Việt</h2></summary>

### Tổng Quan Dự Án

Đây là một hệ thống quản lý và đặt lịch khám bệnh trực tuyến toàn diện, được xây dựng với mục tiêu hiện đại hóa quy trình chăm sóc sức khỏe. Hệ thống bao gồm một backend mạnh mẽ được xây dựng bằng Spring Boot và một frontend linh hoạt, thân thiện với người dùng được xây dựng bằng React (Vite).

### Tính Năng

- **Đối với Bệnh nhân**: Tìm kiếm bác sĩ/phòng khám, đặt lịch hẹn, quản lý lịch hẹn cá nhân, nhận thông báo.
- **Đối với Bác sĩ**: Quản lý lịch làm việc, xem danh sách lịch hẹn, cập nhật hồ sơ bệnh nhân.
- **Đối với Quản trị viên**: Quản lý người dùng, bác sĩ, phòng khám, chuyên khoa, và cài đặt hệ thống.
- **Công nghệ**: Tích hợp AI để đưa ra gợi ý thông minh, thanh toán an toàn, thông báo thời gian thực.

### Công Nghệ Sử Dụng

- **Backend**: Java 17, Spring Boot 3, Spring Security, JPA (Hibernate), Maven, MySQL.
- **Frontend**: React.js, Vite, Tailwind CSS, Axios.
- **Cơ sở dữ liệu**: MySQL.
- **Triển khai**: Docker.

### Yêu Cầu Cần Có

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau trên hệ thống của mình:
- **Java Development Kit (JDK)**: Phiên bản 17 trở lên.
- **Apache Maven**: Phiên bản 3.8 trở lên.
- **Node.js**: Phiên bản 18.x trở lên.
- **npm**: Phiên bản 9.x trở lên (thường đi kèm với Node.js).
- **MySQL**: Một instance MySQL đang hoạt động.
- **Git**: Để sao chép kho mã nguồn.

### Cài Đặt & Khởi Chạy

#### 1. Cài Đặt Backend (Spring Boot)

1.  **Di chuyển đến thư mục backend**:
    ```bash
    cd luanvan-backend
    ```

2.  **Thêm Dependency cho MySQL** (nếu chưa có):
    - Mở tệp `pom.xml`.
    - Đảm bảo dependency sau cho MySQL đã được thêm vào. Nếu bạn có dependency `postgresql`, hãy thay thế nó.
      ```xml
      <dependency>
          <groupId>com.mysql</groupId>
          <artifactId>mysql-connector-j</artifactId>
          <scope>runtime</scope>
      </dependency>
      ```

3.  **Cấu hình Cơ sở dữ liệu**:
    - Mở tệp `src/main/resources/application.properties`.
    - Cập nhật các thuộc tính sau để khớp với cấu hình MySQL của bạn:
      ```properties
      spring.datasource.url=jdbc:mysql://localhost:3306/ten_database_cua_ban?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      spring.datasource.username=ten_dang_nhap_mysql
      spring.datasource.password=mat_khau_mysql
      spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
      ```
    - Đảm bảo bạn đã tạo database `ten_database_cua_ban` trong MySQL. Các bảng sẽ được tự động tạo bởi Flyway migrations.

4.  **Cài đặt các gói phụ thuộc**:
    Nếu bạn đã sửa đổi `pom.xml`, hãy cập nhật các dependency. Nếu không, bước này đảm bảo mọi thứ đều chính xác.
    ```bash
    mvn clean install
    ```

5.  **Chạy Backend**:
    ```bash
    mvn spring-boot:run
    ```
    Máy chủ backend sẽ khởi động trên cổng `8080` theo mặc định.

#### 2. Cài Đặt Frontend (React + Vite)

1.  **Di chuyển đến thư mục frontend**:
    ```bash
    cd luanvan-frontend
    ```

2.  **Cài đặt các gói phụ thuộc**:
    ```bash
    npm install
    ```

3.  **Cấu hình API Endpoint**:
    - Mở tệp `src/services/api.js`.
    - Đảm bảo `baseURL` trỏ đến máy chủ backend đang chạy của bạn. Mặc định, nó được cấu hình là `http://localhost:8080`.
      ```javascript
      // src/services/api.js
      const apiService = axios.create({
        baseURL: 'http://localhost:8080', // Đảm bảo địa chỉ này chính xác
        // ... các cấu hình khác
      });
      ```

4.  **Chạy Frontend**:
    ```bash
    npm run dev
    ```
    Máy chủ phát triển frontend sẽ khởi động, thường là trên cổng `5173`.

### Khởi Chạy Ứng Dụng

Sau khi hoàn tất cài đặt cho cả backend và frontend:

1.  Đảm bảo cơ sở dữ liệu **MySQL** của bạn đang chạy.
2.  Khởi động máy chủ **Backend** từ thư mục `luanvan-backend`.
3.  Khởi động máy chủ **Frontend** từ thư mục `luanvan-frontend`.
4.  Mở trình duyệt và truy cập vào `http://localhost:5173` (hoặc cổng do Vite chỉ định).

</details> 