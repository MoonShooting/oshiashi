-- 1. user 테이블
CREATE TABLE `user` (
    `user_id` varchar(50) NOT NULL COMMENT '유저id',
    `user_name` varchar(50) NOT NULL COMMENT '유저이름',
    `email` varchar(255) NOT NULL COMMENT '이메일',
    `password` varchar(255) NOT NULL COMMENT '비밀번호',
    `nickname` varchar(255) DEFAULT NULL COMMENT '닉네임',
    `role` varchar(50) NOT NULL DEFAULT 'user' COMMENT '역할',
    `last_login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '마지막 로그인',
    `status` varchar(50) NOT NULL DEFAULT 'active' COMMENT '상태',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `ux_user_email` (`email`),
    UNIQUE KEY `ux_user_nickname` (`nickname`),
    CONSTRAINT `check_role` CHECK (`role` in ('user', 'admin')),
    CONSTRAINT `check_status` CHECK (`status` in ('active', 'dormant'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 정보 테이블';

-- 2. artwork_type 테이블
CREATE TABLE `artwork_type` (
    `artwork_type_id` bigint NOT NULL AUTO_INCREMENT COMMENT '작품타입 id',
    `artwork_type_name` varchar(50) NOT NULL COMMENT '작품타입 명',
    PRIMARY KEY (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품 매체 구분 테이블';

-- 3. artwork 테이블
CREATE TABLE `artwork` (
    `artwork_id` bigint NOT NULL AUTO_INCREMENT COMMENT '작품 id',
    `artwork_type_id` bigint NOT NULL COMMENT '작품타입 id',
    `title` varchar(255) NOT NULL COMMENT '작품 제목',
    `poster_url` varchar(255) NOT NULL COMMENT '포스터 url',
    `description` text DEFAULT NULL COMMENT '작품 설명',
    `spotify_album_id` varchar(100) DEFAULT NULL COMMENT '스포티파이 id',
    PRIMARY KEY (`artwork_id`),
    UNIQUE KEY `ux_artwork_title` (`title`),
    CONSTRAINT `fk_artwork_artworktype` FOREIGN KEY (`artwork_type_id`) REFERENCES `artwork_type` (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품 정보 테이블';

-- 4. route 테이블
CREATE TABLE `route` (
    `route_id` bigint NOT NULL AUTO_INCREMENT COMMENT '루트 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `title` varchar(255) NOT NULL COMMENT '루트 제목',
    `is_public` tinyint NOT NULL DEFAULT 0 COMMENT '공개여부 (0:비공개, 1:공개)',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`route_id`),
    CONSTRAINT `fk_route_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `check_is_public` CHECK (`is_public` in (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='여행 경로 테이블';

-- 5. post 테이블
CREATE TABLE `post` (
    `post_id` bigint NOT NULL AUTO_INCREMENT COMMENT '게시물 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `route_id` bigint DEFAULT NULL COMMENT '루트 id',
    `title` varchar(255) NOT NULL COMMENT '게시글 제목',
    `content` text COMMENT '게시글 내용',
    `status` enum('public', 'private') NOT NULL DEFAULT 'private' COMMENT '게시글 공개 여부',
    `view_count` int DEFAULT 0 COMMENT '게시글 조회 수',
    `like_count` int DEFAULT 0 COMMENT '게시글 좋아요 수',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    PRIMARY KEY (`post_id`),
    CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_post_route` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 게시글 테이블';

-- 6. post_image 테이블
CREATE TABLE `post_image` (
    `post_image_id` bigint NOT NULL AUTO_INCREMENT COMMENT '게시글 사진 id',
    `post_id` bigint NOT NULL COMMENT '게시글 id',
    `image_url` varchar(5000) NOT NULL COMMENT '이미지 url',
    `sort_order` int DEFAULT 0 COMMENT '노출순서',
    `exif_latitude` decimal(10,7) DEFAULT NULL COMMENT 'exif 위도',
    `exif_longitude` decimal(10,7) DEFAULT NULL COMMENT 'exif 경도',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`post_image_id`),
    CONSTRAINT `fk_postimage_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 이미지 정보 테이블';

-- 7. spot 테이블
CREATE TABLE `spot` (
    `spot_id` bigint NOT NULL AUTO_INCREMENT COMMENT '스팟 id',
    `artwork_id` bigint NOT NULL COMMENT '작품 id',
    `name` varchar(255) NOT NULL COMMENT '스팟 이름',
    `latitude` decimal(10,7) NOT NULL COMMENT '스팟 위도',
    `longitude` decimal(10,7) NOT NULL COMMENT '스팟 경도',
    `address` varchar(300) DEFAULT NULL COMMENT '주소',
    `scene_image_url` varchar(300) NOT NULL COMMENT '장면 이미지 url',
    PRIMARY KEY (`spot_id`),
    UNIQUE KEY `ux_spot_sceneimage` (`scene_image_url`),
    CONSTRAINT `fk_spot_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `artwork` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='지도 핀 정보 테이블';

-- 8. route_spot 테이블
CREATE TABLE `route_spot` (
    `route_spot_id` bigint NOT NULL AUTO_INCREMENT COMMENT '루트스팟 id',
    `route_id` bigint NOT NULL COMMENT '루트 id',
    `spot_id` bigint NOT NULL COMMENT '스팟 id',
    `visit_order` int NOT NULL DEFAULT 1 COMMENT '루트 방문 순서',
    PRIMARY KEY (`route_spot_id`),
    CONSTRAINT `fk_routespot_route` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_routespot_spot` FOREIGN KEY (`spot_id`) REFERENCES `spot` (`spot_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='경로 별 상세 장소 테이블';

-- 9. comment 테이블
CREATE TABLE `comment` (
    `comment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '댓글 id',
    `post_id` bigint NOT NULL COMMENT '게시글 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `content` varchar(255) NOT NULL COMMENT '내용',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`comment_id`),
    CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글 정보 테이블';

-- 10. tag 테이블
CREATE TABLE `tag` (
    `tag_id` bigint NOT NULL AUTO_INCREMENT COMMENT '태그 id',
    `artwork_id` bigint NOT NULL COMMENT '작품 id',
    `tag_name` varchar(100) NOT NULL COMMENT '태그 이름',
    PRIMARY KEY (`tag_id`),
    UNIQUE KEY `ux_tag_name` (`tag_name`),
    CONSTRAINT `fk_tag_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `artwork` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품별 분류 키워드 관리 테이블';

-- 11. achievement 테이블
CREATE TABLE `achievement` (
    `achievement_id` bigint NOT NULL AUTO_INCREMENT COMMENT '업적 id',
    `name` varchar(100) NOT NULL COMMENT '업적 이름',
    `description` varchar(255) DEFAULT NULL COMMENT '업적 내용',
    `icon_url` varchar(500) NOT NULL COMMENT '업적 아이콘 url',
    PRIMARY KEY (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='획득 가능한 업적 마스터 테이블';

-- 12. user_achievement 테이블
CREATE TABLE `user_achievement` (
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `achievement_id` bigint NOT NULL COMMENT '업적 id',
    `achieved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '획득 일',
    PRIMARY KEY (`user_id`, `achievement_id`),
    CONSTRAINT `fk_userachieve_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_userachieve_achieve` FOREIGN KEY (`achievement_id`) REFERENCES `achievement` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='유저가 획득한 업적 정보 관리 테이블';

-- 13. bookmark 테이블
CREATE TABLE `bookmark` (
    `book_mark_id` bigint NOT NULL AUTO_INCREMENT COMMENT '북마크 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `book_mark_name` varchar(100) NOT NULL COMMENT '북마크 이름',
    `post_id` bigint DEFAULT NULL COMMENT '게시글 id',
    `post_image_id` bigint DEFAULT NULL COMMENT '게시글 사진 id',
    `route_id` bigint DEFAULT NULL COMMENT '루트 id',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`book_mark_id`),
    CONSTRAINT `fk_bookmark_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookmark_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookmark_postimage` FOREIGN KEY (`post_image_id`) REFERENCES `post_image` (`post_image_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookmark_route` FOREIGN KEY (`route_id`) REFERENCES `route` (`route_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 및 루트 북마크 관리 테이블';

-- 14. user_tag 테이블
CREATE TABLE IF NOT EXISTS `user_tag` (
    `user_tag_id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` varchar(50) NOT NULL,
    `tag_id` bigint NOT NULL,
    `artwork_id` bigint NOT NULL,
    `count` int NOT NULL DEFAULT 0,
    `last_used_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_tag_id`),
    CONSTRAINT `fk_usertag_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usertag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usertag_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `artwork` (`artwork_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_tag_artwork` (`user_id`, `tag_id`, `artwork_id`)
) ENGINE=InnoDB COMMENT='유저별 태그 통계 테이블';