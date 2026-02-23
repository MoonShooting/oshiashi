CREATE TABLE `User` (
  `user_id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nickname` (`nickname`),
  CONSTRAINT `User_chk_1` CHECK ((`role` in ('user','admin'))),
  CONSTRAINT `User_chk_2` CHECK ((`status` in ('active','dormant')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Achievement` (
  `achievement_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Artwork_type` (
  `artwork_type_id` int NOT NULL AUTO_INCREMENT,
  `artwork_type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2단계: 1단계 테이블을 참조하는 테이블
CREATE TABLE `Artwork` (
  `artwork_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `artwork_type_id` int NOT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `spotify_album_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`artwork_id`),
  KEY `artwork_type_id` (`artwork_type_id`),
  CONSTRAINT `Artwork_ibfk_1` FOREIGN KEY (`artwork_type_id`) REFERENCES `Artwork_type` (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Route` (
  `route_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`route_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Route_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3단계: 2단계 테이블을 참조하는 테이블 (Spot, Tag, Post 등)
CREATE TABLE `Spot` (
  `spot_id` bigint NOT NULL AUTO_INCREMENT,
  `artwork_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `scene_image_url` varchar(300) NOT NULL,
  PRIMARY KEY (`spot_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `Spot_ibfk_1` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Tag` (
  `tag_id` bigint NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(100) DEFAULT NULL,
  `artwork_id` bigint NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`),
  KEY `fk_tag_artwork` (`artwork_id`),
  CONSTRAINT `fk_tag_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Post` (
  `post_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `route_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('public','private') NOT NULL,
  `view_count` int DEFAULT '0',
  `like_count` int DEFAULT '0',
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_post_route` (`route_id`),
  CONSTRAINT `fk_post_route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`),
  CONSTRAINT `Post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4단계: 가장 하위 자식 테이블들 (복합적인 참조)
CREATE TABLE `Route_spot` (
  `route_id` bigint NOT NULL,
  `spot_id` bigint NOT NULL,
  `visit_order` int NOT NULL,
  PRIMARY KEY (`route_id`,`spot_id`),
  KEY `spot_id` (`spot_id`),
  CONSTRAINT `Route_spot_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`),
  CONSTRAINT `Route_spot_ibfk_2` FOREIGN KEY (`spot_id`) REFERENCES `Spot` (`spot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Post_image` (
  `image_id` bigint NOT NULL AUTO_INCREMENT,
  `post_image_id` bigint NOT NULL,
  `image_url` varchar(5000) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sort_order` int DEFAULT '0',
  `exif_latitude` decimal(10,7) DEFAULT NULL,
  `exif_longitude` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  KEY `post_id` (`post_image_id`),
  CONSTRAINT `Post_image_ibfk_1` FOREIGN KEY (`post_image_id`) REFERENCES `Post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Bookmark` (
  `bookmark_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `post_id` bigint DEFAULT NULL,
  `route_id` bigint DEFAULT NULL,
  `post_image_id` bigint NOT NULL,
  `book_mark_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bookmark_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  KEY `route_id` (`route_id`),
  KEY `fk_bookmark_post_image` (`post_image_id`),
  CONSTRAINT `Bookmark_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `Bookmark_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`),
  CONSTRAINT `Bookmark_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`),
  CONSTRAINT `fk_bookmark_post_image` FOREIGN KEY (`post_image_id`) REFERENCES `Post_image` (`image_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `User_tag` (
  `user_tag_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `tag_id` bigint NOT NULL,
  `count` int NOT NULL DEFAULT '0',
  `artwork_id` bigint NOT NULL,
  PRIMARY KEY (`user_tag_id`),
  KEY `fk_user_tag_user` (`user_id`),
  KEY `fk_user_tag_tag` (`tag_id`),
  KEY `fk_user_tag_artwork` (`artwork_id`),
  CONSTRAINT `fk_user_tag_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`),
  CONSTRAINT `fk_user_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `Tag` (`tag_id`),
  CONSTRAINT `fk_user_tag_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Comment` (
  `comment_id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `content` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `fk_comment_user` (`user_id`),
  KEY `kf_comment_post_image` (`post_id`),
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `kf_comment_post_image` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `User_achievement` (
  `user_id` varchar(50) NOT NULL,
  `achievement_id` bigint NOT NULL,
  `achieved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `achievement_id`),
  CONSTRAINT `fk_user_achievement_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `fk_user_achievement_achiv` FOREIGN KEY (`achievement_id`) REFERENCES `Achievement` (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;