-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th6 17, 2025 lúc 04:43 PM
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

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `availability_slots`
--
ALTER TABLE `availability_slots`
  ADD CONSTRAINT `FKbpaaliokab639tw3cqbc7nubm` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`user_id`),
  ADD CONSTRAINT `FKd7lylmjmtq0botuehhhnl0yjl` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`specialty_id`),
  ADD CONSTRAINT `FKqq5d3idovfnrhbdj7lakr1bpp` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
