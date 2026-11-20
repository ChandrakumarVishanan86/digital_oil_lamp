SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `digital_oil_lamp` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `digital_oil_lamp`;
DROP TABLE IF EXISTS `lamps`;
CREATE TABLE `lamps` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(40) NOT NULL,
  `wish` VARCHAR(120) NULL,
  `lit_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `visitor` CHAR(16) NOT NULL,
  INDEX (`lit_at`)
) ENGINE=InnoDB;
INSERT INTO `lamps` (`name`,`wish`,`lit_at`,`visitor`) VALUES
('Chandra Kumar','Peace and prosperity for all', NOW() - INTERVAL 3 HOUR,'seed000000000001'),
('Priya','Good health for my family', NOW() - INTERVAL 5 HOUR,'seed000000000002'),
('Arun','Success in my exams', NOW() - INTERVAL 7 HOUR,'seed000000000003'),
('Amma','May you live well', NOW() - INTERVAL 9 HOUR,'seed000000000004'),
('Nimal','', NOW() - INTERVAL 11 HOUR,'seed000000000005'),
('Kavya','A new beginning', NOW() - INTERVAL 14 HOUR,'seed000000000006');
