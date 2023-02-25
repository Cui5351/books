-- phpMyAdmin SQL Dump
-- version 4.4.15.10
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2023-02-25 19:51:43
-- 服务器版本： 8.0.24
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mynameisczy_asia`
--
CREATE DATABASE IF NOT EXISTS `mynameisczy_asia` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mynameisczy_asia`;

DELIMITER $$
--
-- 存储过程
--
DROP PROCEDURE IF EXISTS `a`$$
CREATE DEFINER=`mynameisczy_asia`@`localhost` PROCEDURE `a`()
begin



end$$

DELIMITER ;

-- --------------------------------------------------------

--
-- 表的结构 `author_info`
--

DROP TABLE IF EXISTS `author_info`;
CREATE TABLE IF NOT EXISTS `author_info` (
  `id` int NOT NULL,
  `avatar` varchar(100) COLLATE utf8mb4_general_ci DEFAULT 'https://www.mynameisczy.asia/image/image_load_error.jpeg',
  `name` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(450) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `books_category`
--

DROP TABLE IF EXISTS `books_category`;
CREATE TABLE IF NOT EXISTS `books_category` (
  `id` int NOT NULL,
  `book_type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `book_count` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `books_content`
--

DROP TABLE IF EXISTS `books_content`;
CREATE TABLE IF NOT EXISTS `books_content` (
  `id` int NOT NULL,
  `passage_value` int DEFAULT NULL,
  `passage_name` varchar(90) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `book_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 触发器 `books_content`
--
DROP TRIGGER IF EXISTS `passage_decrement_count`;
DELIMITER $$
CREATE TRIGGER `passage_decrement_count` AFTER DELETE ON `books_content`
 FOR EACH ROW update books_info set books_info.passage_count=books_info.passage_count-1 where books_info.book_name=old.book_name
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `passage_increment_count`;
DELIMITER $$
CREATE TRIGGER `passage_increment_count` AFTER INSERT ON `books_content`
 FOR EACH ROW update books_info set books_info.passage_count=books_info.passage_count+1 where books_info.book_name=new.book_name
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 表的结构 `books_info`
--

DROP TABLE IF EXISTS `books_info`;
CREATE TABLE IF NOT EXISTS `books_info` (
  `id` int NOT NULL,
  `book_name` varchar(90) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `passage_count` int DEFAULT '0',
  `book_type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `score` float NOT NULL DEFAULT '9.9',
  `book_introduce` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `book_state` enum('完结','连载') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '完结'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 触发器 `books_info`
--
DROP TRIGGER IF EXISTS `book_decrement_count`;
DELIMITER $$
CREATE TRIGGER `book_decrement_count` AFTER DELETE ON `books_info`
 FOR EACH ROW update books_category set books_category.book_count=books_category.book_count-1 where books_category.book_type=old.book_type
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `book_increment_count`;
DELIMITER $$
CREATE TRIGGER `book_increment_count` AFTER INSERT ON `books_info`
 FOR EACH ROW update books_category set books_category.book_count=books_category.book_count+1 where new.book_type = books_category.book_type
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 表的结构 `small_program_state`
--

DROP TABLE IF EXISTS `small_program_state`;
CREATE TABLE IF NOT EXISTS `small_program_state` (
  `id` int NOT NULL,
  `small_program_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` enum('0','1','2') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `store`
--

DROP TABLE IF EXISTS `store`;
CREATE TABLE IF NOT EXISTS `store` (
  `id` int NOT NULL,
  `name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `picture` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1000',
  `count` int DEFAULT '0',
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `tools`
--

DROP TABLE IF EXISTS `tools`;
CREATE TABLE IF NOT EXISTS `tools` (
  `id` int NOT NULL,
  `tools_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tools_link` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tools_description` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '该工具暂时还没有对功能的描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `user_chat`
--

DROP TABLE IF EXISTS `user_chat`;
CREATE TABLE IF NOT EXISTS `user_chat` (
  `id` int NOT NULL,
  `openid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gender` enum('男','女','未知') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `chat_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- 表的结构 `user_feedback`
--

DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE IF NOT EXISTS `user_feedback` (
  `id` int NOT NULL,
  `nickName` varchar(75) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatarUrl` varchar(1200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('男','女','未知') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `feedback_to` enum('author','小说提供猿') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `openid` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `feedback_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `user_info`
--

DROP TABLE IF EXISTS `user_info`;
CREATE TABLE IF NOT EXISTS `user_info` (
  `id` int NOT NULL,
  `nickName` varchar(75) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatarUrl` varchar(600) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('男','女','未知') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '未知',
  `introduction` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '这家伙很懒,什么也没留下',
  `author_answer` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""',
  `openid` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `data_provide_answer` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '""',
  `user_privilege` enum('author','小说提供猿','normal') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'normal',
  `bookshelf` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `score` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0',
  `shops` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sign_in_day` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `chat_state` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `author_info`
--
ALTER TABLE `author_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `books_category`
--
ALTER TABLE `books_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `book_type` (`book_type`);

--
-- Indexes for table `books_content`
--
ALTER TABLE `books_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_name` (`book_name`);

--
-- Indexes for table `books_info`
--
ALTER TABLE `books_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `book_name` (`book_name`),
  ADD KEY `book_type` (`book_type`);

--
-- Indexes for table `small_program_state`
--
ALTER TABLE `small_program_state`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `small_program_name` (`small_program_name`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `tools`
--
ALTER TABLE `tools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tools_name` (`tools_name`);

--
-- Indexes for table `user_chat`
--
ALTER TABLE `user_chat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_feedback`
--
ALTER TABLE `user_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `openid` (`openid`);

--
-- Indexes for table `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `openid` (`openid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `author_info`
--
ALTER TABLE `author_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `books_category`
--
ALTER TABLE `books_category`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `books_content`
--
ALTER TABLE `books_content`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `books_info`
--
ALTER TABLE `books_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `small_program_state`
--
ALTER TABLE `small_program_state`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tools`
--
ALTER TABLE `tools`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_chat`
--
ALTER TABLE `user_chat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_feedback`
--
ALTER TABLE `user_feedback`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_info`
--
ALTER TABLE `user_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
--
-- 限制导出的表
--

--
-- 限制表 `books_content`
--
ALTER TABLE `books_content`
  ADD CONSTRAINT `books_content_ibfk_1` FOREIGN KEY (`book_name`) REFERENCES `books_info` (`book_name`);

--
-- 限制表 `books_info`
--
ALTER TABLE `books_info`
  ADD CONSTRAINT `book_ty` FOREIGN KEY (`book_type`) REFERENCES `books_category` (`book_type`);

--
-- 限制表 `user_feedback`
--
ALTER TABLE `user_feedback`
  ADD CONSTRAINT `user_feedback_ibfk_1` FOREIGN KEY (`openid`) REFERENCES `user_info` (`openid`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
