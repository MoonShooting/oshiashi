-- 1번 User 테이블 (회원 정보)
CREATE TABLE `User` (
    `user_id` varchar(50) NOT NULL COMMENT '유저id',
    `email` varchar(255) NOT NULL COMMENT '이메일',
    `password` varchar(255) NOT NULL COMMENT '비밀번호',
    `nickname` varchar(255) DEFAULT NULL COMMENT '닉네임',
    `role` varchar(50) NOT NULL DEFAULT 'user' COMMENT '역할',
    `last_login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '마지막 로그인',
    `status` varchar(50) NOT NULL DEFAULT 'active' COMMENT '상태',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `UX_User_Email` (`email`),
    UNIQUE KEY `UX_User_Nickname` (`nickname`),
    CONSTRAINT `check_role` CHECK (`role` in ('user', 'admin')),
    CONSTRAINT `check_status` CHECK (`status` in ('active', 'dormant'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 정보 테이블';

-- 3번 Route 테이블 (여행 경로)
CREATE TABLE `Route` (
    `route_id` bigint NOT NULL AUTO_INCREMENT COMMENT '루트 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `title` varchar(255) NOT NULL COMMENT '루트 제목',
    `is_public` tinyint NOT NULL DEFAULT 0 COMMENT '공개여부 (0:비공개, 1:공개)',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`route_id`),
    CONSTRAINT `FK_Route_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `check_is_public` CHECK (`is_public` in (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='여행 경로 테이블';

-- 2번 Post 테이블 (회원 게시글 테이블)
CREATE TABLE `Post` (
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
    CONSTRAINT `FK_Post_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Post_Route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 게시글 테이블';

-- 3번 Post_image 테이블 (게시글 이미지 정보)
CREATE TABLE `Post_image` (
    `post_image_id` bigint NOT NULL AUTO_INCREMENT COMMENT '게시글 사진 id',
    `post_id` bigint NOT NULL COMMENT '게시글 id',
    `image_url` varchar(5000) NOT NULL COMMENT '이미지 url',
    `sort_order` int DEFAULT 0 COMMENT '노출순서',
    `exif_latitude` decimal(10,7) DEFAULT NULL COMMENT 'exif 위도',
    `exif_longitude` decimal(10,7) DEFAULT NULL COMMENT 'exif 경도',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`post_image_id`),
    CONSTRAINT `FK_Postimage_Post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 이미지 정보 테이블';

-- 5번 Artwork_type 테이블 (작품 매체 구분)
CREATE TABLE `Artwork_type` (
    `artwork_type_id` bigint NOT NULL AUTO_INCREMENT COMMENT '작품타입 id',
    `artwork_type_name` varchar(50) NOT NULL COMMENT '작품타입 명 (예: 애니메이션, 영화 등)',
    PRIMARY KEY (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품 매체 구분 테이블';

-- 4번 Artwork 테이블 (작품 정보)
CREATE TABLE `Artwork` (
    `artwork_id` bigint NOT NULL AUTO_INCREMENT COMMENT '작품 id',
    `artwork_type_id` bigint NOT NULL COMMENT '작품타입 id',
    `title` varchar(255) NOT NULL COMMENT '작품 제목',
    `poster_url` varchar(255) NOT NULL COMMENT '포스터 url',
    `description` text DEFAULT NULL COMMENT '작품 설명',
    `spotify_album_id` varchar(100) DEFAULT NULL COMMENT '스포티파이 id',
    PRIMARY KEY (`artwork_id`),
    UNIQUE KEY `UX_Artwork_Title` (`title`),
    CONSTRAINT `FK_Artwork_ArtworkType` FOREIGN KEY (`artwork_type_id`) REFERENCES `Artwork_type` (`artwork_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품 정보 테이블';

-- 6번 Spot 테이블 (지도 핀 정보)
CREATE TABLE `Spot` (
    `spot_id` bigint NOT NULL AUTO_INCREMENT COMMENT '스팟 id',
    `artwork_id` bigint NOT NULL COMMENT '작품 id',
    `name` varchar(255) NOT NULL COMMENT '스팟 이름',
    `latitude` decimal(10,7) NOT NULL COMMENT '스팟 위도',
    `longitude` decimal(10,7) NOT NULL COMMENT '스팟 경도',
    `address` varchar(300) DEFAULT NULL COMMENT '주소',
    `scene_image_url` varchar(300) NOT NULL COMMENT '장면 이미지 url',
    PRIMARY KEY (`spot_id`),
    UNIQUE KEY `UX_Spot_SceneImage` (`scene_image_url`),
    CONSTRAINT `FK_Spot_Artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='지도 핀 정보 테이블';

-- 8번 Route_spot 테이블 (경로 별 상세 장소)
CREATE TABLE `Route_spot` (
    `route_spot_id` bigint NOT NULL AUTO_INCREMENT COMMENT '루트스팟 id',
    `route_id` bigint NOT NULL COMMENT '루트 id',
    `spot_id` bigint NOT NULL COMMENT '스팟 id',
    `visit_order` int NOT NULL DEFAULT 1 COMMENT '루트 방문 순서',
    PRIMARY KEY (`route_spot_id`),
    CONSTRAINT `FK_Routespot_Route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Routespot_Spot` FOREIGN KEY (`spot_id`) REFERENCES `Spot` (`spot_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='경로 별 상세 장소 테이블 (Route와 Spot 연결)';

-- 9번 Comment 테이블 (댓글 정보)
CREATE TABLE `Comment` (
    `comment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '댓글 id',
    `post_id` bigint NOT NULL COMMENT '게시글 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `content` varchar(255) NOT NULL COMMENT '내용',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`comment_id`),
    CONSTRAINT `FK_Comment_Post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Comment_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글 정보 테이블';

-- 10번 Tag 테이블 (태그 정보)
CREATE TABLE `Tag` (
    `tag_id` bigint NOT NULL AUTO_INCREMENT COMMENT '태그 id',
    `artwork_id` bigint NOT NULL COMMENT '작품 id',
    `tag_name` varchar(100) NOT NULL COMMENT '태그 이름',
    PRIMARY KEY (`tag_id`),
    UNIQUE KEY `UX_Tag_Name` (`tag_name`),
    CONSTRAINT `FK_Tag_Artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='작품별 분류 키워드 관리 테이블';

-- 12번 Achievement 테이블 (업적 정보)
CREATE TABLE `Achievement` (
    `achievement_id` bigint NOT NULL AUTO_INCREMENT COMMENT '업적 id',
    `name` varchar(100) NOT NULL COMMENT '업적 이름',
    `description` varchar(255) DEFAULT NULL COMMENT '업적 내용',
    `icon_url` varchar(500) NOT NULL COMMENT '업적 아이콘 url',
    PRIMARY KEY (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='획득 가능한 업적 마스터 테이블';

-- 13번 User_achievement 테이블 (유저 획득 업적)
CREATE TABLE `User_achievement` (
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `achievement_id` bigint NOT NULL COMMENT '업적 id',
    `achieved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '획득 일',
    PRIMARY KEY (`user_id`, `achievement_id`),
    CONSTRAINT `FK_UserAchieve_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserAchieve_Achieve` FOREIGN KEY (`achievement_id`) REFERENCES `Achievement` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='유저가 획득한 업적 정보 관리 테이블';

-- 14번 Bookmark 테이블 (루트 및 게시글 북마크)
CREATE TABLE `Bookmark` (
    `book_mark_id` bigint NOT NULL AUTO_INCREMENT COMMENT '북마크 id',
    `user_id` varchar(50) NOT NULL COMMENT '유저 id',
    `book_mark_name` varchar(100) NOT NULL COMMENT '북마크 이름',
    `post_id` bigint DEFAULT NULL COMMENT '게시글 id',
    `post_image_id` bigint DEFAULT NULL COMMENT '게시글 사진 id',
    `route_id` bigint DEFAULT NULL COMMENT '루트 id',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (`book_mark_id`),
    CONSTRAINT `FK_Bookmark_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Bookmark_Post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Bookmark_PostImage` FOREIGN KEY (`post_image_id`) REFERENCES `Post_image` (`post_image_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Bookmark_Route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 및 루트 북마크 관리 테이블';