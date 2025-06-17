-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th6 17, 2025 lúc 04:18 PM
-- Phiên bản máy phục vụ: 8.2.0
-- Phiên bản PHP: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `luanvan_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `appointment_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date_time` datetime(6) DEFAULT NULL,
  `booking_timestamp` datetime(6) DEFAULT NULL,
  `cancellation_reason` text,
  `cancellation_timestamp` datetime(6) DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `is_deposit_non_refundable` bit(1) NOT NULL,
  `is_deposit_paid` bit(1) NOT NULL,
  `payment_status_momo` enum('CANCELLED','FAILED','PENDING','SUCCESS') DEFAULT NULL,
  `payment_timestamp` datetime(6) DEFAULT NULL,
  `payment_transaction_id` varchar(255) DEFAULT NULL,
  `reason_for_visit` text,
  `status` enum('CANCELLED_BY_CLINIC','CANCELLED_BY_PATIENT','COMPLETED','CONFIRMED','PAYMENT_FAILED','PENDING_PAYMENT') DEFAULT NULL,
  `clinic_id` bigint DEFAULT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `patient_id` bigint DEFAULT NULL,
  `slot_id` bigint DEFAULT NULL,
  `specialty_id` bigint DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `FKap2c2dv8qh6r32te6qbakix0b` (`clinic_id`),
  KEY `FK6u6s6egu60m2cbdjno44jbipa` (`doctor_id`),
  KEY `FKopb2h9yhin1rb4dqote8bws6w` (`patient_id`),
  KEY `FKpcc7t66we73o00qf2s8q634k7` (`slot_id`),
  KEY `FKhn2k6wtscqwekhug3uj3sljod` (`specialty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `articles`
--

DROP TABLE IF EXISTS `articles`;
CREATE TABLE IF NOT EXISTS `articles` (
  `article_id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `content` text,
  `imageurl` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `published_date` datetime(6) DEFAULT NULL,
  `status` enum('ARCHIVED','DRAFT','PUBLISHED') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `author_id` bigint DEFAULT NULL,
  PRIMARY KEY (`article_id`),
  KEY `FKe02fs2ut6qqoabfhj325wcjul` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `availability_slots`
--

DROP TABLE IF EXISTS `availability_slots`;
CREATE TABLE IF NOT EXISTS `availability_slots` (
  `slot_id` bigint NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `status` enum('AVAILABLE','BOOKED','CANCELLED_BY_CLINIC','ON_LEAVE') DEFAULT NULL,
  `clinic_id` bigint DEFAULT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `auto_generated` bit(1) DEFAULT NULL,
  `created_from_shift_id` bigint DEFAULT NULL,
  `notes` text,
  `slot_duration_minutes` int DEFAULT NULL,
  `specialty_id` bigint DEFAULT NULL,
  PRIMARY KEY (`slot_id`),
  KEY `FKqq5d3idovfnrhbdj7lakr1bpp` (`clinic_id`),
  KEY `FKbpaaliokab639tw3cqbc7nubm` (`doctor_id`),
  KEY `FKd7lylmjmtq0botuehhhnl0yjl` (`specialty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `availability_slots`
--

INSERT INTO `availability_slots` (`slot_id`, `date`, `end_time`, `start_time`, `status`, `clinic_id`, `doctor_id`, `auto_generated`, `created_from_shift_id`, `notes`, `slot_duration_minutes`, `specialty_id`) VALUES
(5, '2025-06-17', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(6, '2025-06-17', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(7, '2025-06-17', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(8, '2025-06-17', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(9, '2025-06-17', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(10, '2025-06-17', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(11, '2025-06-17', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(12, '2025-06-17', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(13, '2025-06-18', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(14, '2025-06-18', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(15, '2025-06-18', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(16, '2025-06-18', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(17, '2025-06-18', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(18, '2025-06-18', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(19, '2025-06-18', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(20, '2025-06-18', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 3, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 4 #3', 30, 10),
(21, '2025-06-19', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(22, '2025-06-19', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(23, '2025-06-19', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(24, '2025-06-19', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(25, '2025-06-19', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(26, '2025-06-19', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(27, '2025-06-19', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(28, '2025-06-19', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 4, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 5 #4', 30, 10),
(29, '2025-06-20', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(30, '2025-06-20', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(31, '2025-06-20', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(32, '2025-06-20', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(33, '2025-06-20', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(34, '2025-06-20', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(35, '2025-06-20', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(36, '2025-06-20', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 5, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 6 #5', 30, 10),
(37, '2025-06-23', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(38, '2025-06-23', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(39, '2025-06-23', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(40, '2025-06-23', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(41, '2025-06-23', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(42, '2025-06-23', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(43, '2025-06-23', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(44, '2025-06-23', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 1, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 2 #1', 30, 10),
(45, '2025-06-24', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(46, '2025-06-24', '08:30:00.000000', '08:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(47, '2025-06-24', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(48, '2025-06-24', '09:30:00.000000', '09:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(49, '2025-06-24', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(50, '2025-06-24', '10:30:00.000000', '10:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(51, '2025-06-24', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10),
(52, '2025-06-24', '11:30:00.000000', '11:00:00.000000', 'CANCELLED_BY_CLINIC', 2, 7, b'1', 2, 'Tự động tạo từ ca làm việc: Ca sáng Thứ 3 #2', 30, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `clinics`
--

DROP TABLE IF EXISTS `clinics`;
CREATE TABLE IF NOT EXISTS `clinics` (
  `clinic_id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `core_values` text,
  `description` text,
  `email` varchar(255) DEFAULT NULL,
  `equipment_description` text,
  `facilities_description` text,
  `history` text,
  `logourl` varchar(255) DEFAULT NULL,
  `mission` text,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `vision` text,
  PRIMARY KEY (`clinic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `clinics`
--

INSERT INTO `clinics` (`clinic_id`, `address`, `core_values`, `description`, `email`, `equipment_description`, `facilities_description`, `history`, `logourl`, `mission`, `name`, `phone_number`, `vision`) VALUES
(1, '123 Nguyễn Văn Linh, Q7, TP.HCM', NULL, 'Phòng khám đa khoa hiện đại', 'contact@abc.com', NULL, NULL, NULL, NULL, NULL, 'Phòng Khám Đa Khoa ABC', '0281234567', NULL),
(2, '456 Võ Văn Tần, Q3, TP.HCM', NULL, 'Chuyên khoa tim mạch', 'info@timmach.xyz', NULL, NULL, NULL, NULL, NULL, 'Bệnh Viện Tim Mạch XYZ', '0283456789', NULL),
(3, '789 Cộng Hòa, Tân Bình, TP.HCM', NULL, 'Chăm sóc sức khỏe trẻ em', 'support@nhik123.com', NULL, NULL, NULL, NULL, NULL, 'Phòng Khám Nhi Khoa 123', '0285678901', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctors`
--

DROP TABLE IF EXISTS `doctors`;
CREATE TABLE IF NOT EXISTS `doctors` (
  `user_id` bigint NOT NULL,
  `bio` text,
  `years_of_experience` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `doctors`
--

INSERT INTO `doctors` (`user_id`, `bio`, `years_of_experience`) VALUES
(2, 'Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm. Tốt nghiệp Đại học Y Hà Nội.', 15),
(3, 'Bác sĩ Nhi khoa với 12 năm kinh nghiệm. Chuyên điều trị các bệnh lý phức tạp ở trẻ em.', 12),
(4, 'Bác sĩ Tim mạch can thiệp với 10 năm kinh nghiệm. Chuyên gia về siêu âm tim và thông tim.', 10),
(5, 'Updated bio - Senior medical professional with extensive experience', 12),
(7, 'aaaaaa', 15),
(10, 'aaâ', 12);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctor_specialty`
--

DROP TABLE IF EXISTS `doctor_specialty`;
CREATE TABLE IF NOT EXISTS `doctor_specialty` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_primary` bit(1) NOT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `specialty_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2hk0t6mjxwnv8y85yd6sj5ktp` (`doctor_id`),
  KEY `FK4917gxpqbpgy2bl7167thi4xx` (`specialty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `doctor_specialty`
--

INSERT INTO `doctor_specialty` (`id`, `is_primary`, `doctor_id`, `specialty_id`) VALUES
(1, b'1', 2, 1),
(2, b'1', 3, 3),
(3, b'1', 4, 1),
(5, b'1', 10, 1),
(7, b'0', 10, 3),
(10, b'0', 5, 2),
(11, b'0', 5, 3),
(14, b'0', 7, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `callback_data` text,
  `cancel_url` varchar(500) DEFAULT NULL,
  `client_ip` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `deep_link` varchar(1000) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `device_type` varchar(255) DEFAULT NULL,
  `error_code` varchar(255) DEFAULT NULL,
  `error_message` varchar(255) DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `gateway_order_id` varchar(255) DEFAULT NULL,
  `gateway_response` text,
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` enum('MOMO_ATM','MOMO_CREDIT_CARD','MOMO_WALLET','VNPAY_ATM','VNPAY_BANK_TRANSFER','VNPAY_CREDIT_CARD','VNPAY_QR') DEFAULT NULL,
  `payment_url` varchar(1000) DEFAULT NULL,
  `provider` enum('MOMO','VNPAY') NOT NULL,
  `qr_code` varchar(1000) DEFAULT NULL,
  `retry_count` int NOT NULL,
  `return_url` varchar(500) DEFAULT NULL,
  `status` enum('CANCELLED','EXPIRED','FAILED','PENDING','PROCESSING','REFUNDED','SUCCESS') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_agent` varchar(1000) DEFAULT NULL,
  `appointment_id` bigint NOT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `UK8vo36cen604as7etdfwmyjsxt` (`order_id`),
  KEY `FK9a0odew03qao7nlbdsesrux5u` (`appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `UK716hgxp60ym1lifrdgp67xt5k` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'ADMIN'),
(2, 'DOCTOR'),
(3, 'PATIENT');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `specialties`
--

DROP TABLE IF EXISTS `specialties`;
CREATE TABLE IF NOT EXISTS `specialties` (
  `specialty_id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(255) DEFAULT NULL,
  `clinic_id` bigint DEFAULT NULL,
  PRIMARY KEY (`specialty_id`),
  KEY `FKm5qwyrqxwvcddbps9725ic0nj` (`clinic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `specialties`
--

INSERT INTO `specialties` (`specialty_id`, `description`, `name`, `clinic_id`) VALUES
(1, 'Chẩn đoán và điều trị bệnh lý tim mạch', 'Tim mạch', 1),
(2, 'Khám và điều trị bệnh nội khoa tổng quát', 'Nội khoa', 1),
(3, 'Chăm sóc sức khỏe trẻ em', 'Nhi khoa', 3),
(10, 'aaaa', 'Ngoại khoa', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `standard_work_shifts`
--

DROP TABLE IF EXISTS `standard_work_shifts`;
CREATE TABLE IF NOT EXISTS `standard_work_shifts` (
  `shift_id` bigint NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `is_default` bit(1) NOT NULL,
  `shift_name` varchar(255) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `clinic_id` bigint DEFAULT NULL,
  PRIMARY KEY (`shift_id`),
  KEY `FKiko19gkb2052gbjxaucn18sbf` (`clinic_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `standard_work_shifts`
--

INSERT INTO `standard_work_shifts` (`shift_id`, `day_of_week`, `end_time`, `is_default`, `shift_name`, `start_time`, `clinic_id`) VALUES
(1, 'MONDAY', '12:00:00.000000', b'0', 'Ca sáng Thứ 2 #1', '08:00:00.000000', 2),
(2, 'TUESDAY', '12:00:00.000000', b'0', 'Ca sáng Thứ 3 #2', '08:00:00.000000', 2),
(3, 'WEDNESDAY', '12:00:00.000000', b'0', 'Ca sáng Thứ 4 #3', '08:00:00.000000', 2),
(4, 'THURSDAY', '12:00:00.000000', b'0', 'Ca sáng Thứ 5 #4', '08:00:00.000000', 2),
(5, 'FRIDAY', '12:00:00.000000', b'0', 'Ca sáng Thứ 6 #5', '08:00:00.000000', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_configuration`
--

DROP TABLE IF EXISTS `system_configuration`;
CREATE TABLE IF NOT EXISTS `system_configuration` (
  `config_id` bigint NOT NULL AUTO_INCREMENT,
  `default_deposit_amount` decimal(10,2) DEFAULT NULL,
  `enable_deposit` bit(1) NOT NULL,
  `momo_access_key` varchar(255) DEFAULT NULL,
  `momo_api_endpoint` varchar(255) DEFAULT NULL,
  `momo_partner_code` varchar(255) DEFAULT NULL,
  `momo_secret_key` varchar(255) DEFAULT NULL,
  `non_refundable_deposit_policy_text` text,
  `patient_cancellation_time_limit_hours` int DEFAULT NULL,
  `payment_retry_timeout_minutes` int DEFAULT NULL,
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `clerk_user_id` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `registration_date` datetime(6) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email_notifications_enabled` bit(1) NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK57vrrk8f99m307cjtiyqcprhw` (`clerk_user_id`),
  UNIQUE KEY `UK9q63snka3mdh91as4io72espi` (`phone_number`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `address`, `clerk_user_id`, `date_of_birth`, `email`, `full_name`, `gender`, `image_url`, `is_active`, `password_hash`, `phone_number`, `registration_date`, `role_id`, `created_at`, `email_notifications_enabled`, `last_login_at`) VALUES
(1, NULL, NULL, NULL, 'admin@luanvan.com', 'System Administrator', NULL, NULL, b'1', '$2a$10$w5Vt19DIC2M2NvFI2SgTkuT7157n1bNgS03n8JmTM8obMtxxbFRfK', NULL, '2025-06-10 23:59:10.057462', 1, NULL, b'0', NULL),
(2, NULL, NULL, NULL, 'doctor001@luanvan.com', 'BS. Nguyễn Văn A', NULL, NULL, b'1', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', '0987654321', '2025-06-11 00:09:00.000000', 2, NULL, b'0', NULL),
(3, NULL, NULL, NULL, 'doctor1@luanvan.com', 'BS. Trần Văn B', NULL, NULL, b'1', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', '0987654322', '2025-06-11 00:09:00.000000', 2, NULL, b'0', NULL),
(4, NULL, NULL, NULL, 'bs_tim_mach@luanvan.com', 'BS. Lê Thị C', NULL, NULL, b'1', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', '0987654323', '2025-06-11 00:09:00.000000', 2, NULL, b'0', NULL),
(5, NULL, NULL, NULL, 'patient001@example.com', 'Lê Văn C', NULL, NULL, b'1', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', '0123456789', '2025-06-11 00:09:00.000000', 3, NULL, b'0', NULL),
(7, NULL, NULL, NULL, 'bstuan@luanvan.com', 'nguyen tuan', NULL, NULL, b'1', '$2a$10$9mZj86oq3A.LyOnnkQuNROn1.znNy4ol97sh8IRrkTdEUljZA30OK', '0776578118', '2025-06-11 09:07:46.931767', 2, NULL, b'0', NULL),
(8, NULL, 'user_2ySTbTHN0txIdgph4g0Velvej0a', NULL, 'nguyentruongk530042003@gmail.com', 'Trường Nguyễn', NULL, 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yeVNUYlR2ZEp0cFpRNjJHVmxEOW5oVWUxYTMifQ', b'1', NULL, NULL, '2025-06-13 15:04:09.328096', 3, '2025-06-13 15:04:09.339897', b'1', NULL),
(9, NULL, NULL, NULL, 'admin1112@luanvan.com', 'azaaaaa', NULL, NULL, b'1', '$2a$10$.eD/zybVZa79v/WaHbrwIeHr.VdioBS0BxPv3BVhxnBqsJrjMjI8K', '0124786222', '2025-06-15 17:33:04.061399', 2, '2025-06-15 17:33:04.062399', b'1', NULL),
(10, NULL, NULL, NULL, 'admin1212@luanvan.com', 'Nguyễn Trường', NULL, NULL, b'1', '$2a$10$D7051CXfhbxVYEXexD8Xee99S8h2vQgX3J.ZJy8BwTmZcUfY/hl16', '0978612532', '2025-06-15 18:35:54.594425', 2, '2025-06-15 18:35:54.595633', b'1', NULL);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `FK6u6s6egu60m2cbdjno44jbipa` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKap2c2dv8qh6r32te6qbakix0b` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`),
  ADD CONSTRAINT `FKhn2k6wtscqwekhug3uj3sljod` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`specialty_id`),
  ADD CONSTRAINT `FKopb2h9yhin1rb4dqote8bws6w` FOREIGN KEY (`patient_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKpcc7t66we73o00qf2s8q634k7` FOREIGN KEY (`slot_id`) REFERENCES `availability_slots` (`slot_id`);

--
-- Các ràng buộc cho bảng `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `FKe02fs2ut6qqoabfhj325wcjul` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `availability_slots`
--
ALTER TABLE `availability_slots`
  ADD CONSTRAINT `FKbpaaliokab639tw3cqbc7nubm` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`user_id`),
  ADD CONSTRAINT `FKd7lylmjmtq0botuehhhnl0yjl` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`specialty_id`),
  ADD CONSTRAINT `FKqq5d3idovfnrhbdj7lakr1bpp` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`);

--
-- Các ràng buộc cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `FKe9pf5qtxxkdyrwibaevo9frtk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `doctor_specialty`
--
ALTER TABLE `doctor_specialty`
  ADD CONSTRAINT `FK2hk0t6mjxwnv8y85yd6sj5ktp` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`user_id`),
  ADD CONSTRAINT `FK4917gxpqbpgy2bl7167thi4xx` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`specialty_id`);

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `FK9a0odew03qao7nlbdsesrux5u` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`);

--
-- Các ràng buộc cho bảng `specialties`
--
ALTER TABLE `specialties`
  ADD CONSTRAINT `FKm5qwyrqxwvcddbps9725ic0nj` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`);

--
-- Các ràng buộc cho bảng `standard_work_shifts`
--
ALTER TABLE `standard_work_shifts`
  ADD CONSTRAINT `FKiko19gkb2052gbjxaucn18sbf` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
