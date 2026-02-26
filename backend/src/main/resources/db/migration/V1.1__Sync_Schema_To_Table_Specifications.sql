-- [0. 제약 조건 비활성화]
SET FOREIGN_KEY_CHECKS = 0;

-- [1. 유틸리티 프로시저 정의]

-- 외래키 삭제 프로시저 (중복 생성 에러 방지용)
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;
DELIMITER //
CREATE PROCEDURE DropForeignKeyIfExists(IN param_table_name VARCHAR(255), IN param_constraint_name VARCHAR(255))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = param_table_name 
        AND CONSTRAINT_NAME = param_constraint_name 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) THEN
        SET @query = CONCAT('ALTER TABLE `', param_table_name, '` DROP FOREIGN KEY `', param_constraint_name, '`');
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- 컬럼 이름 변경 프로시저
DROP PROCEDURE IF EXISTS RenameColumnIfExists;
DELIMITER //
CREATE PROCEDURE RenameColumnIfExists(IN p_table VARCHAR(255), IN p_old_col VARCHAR(255), IN p_new_col VARCHAR(255), IN p_definition VARCHAR(255))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_old_col
    ) THEN
        SET @sql_text = CONCAT('ALTER TABLE `', p_table, '` CHANGE COLUMN `', p_old_col, '` `', p_new_col, '` ', p_definition);
        PREPARE stmt FROM @sql_text;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- [2. 기존 외래키 정리]
-- 에러가 발생했던 명칭들을 포함하여 모두 사전에 삭제 시도
CALL DropForeignKeyIfExists('Post_image', 'Post_image_ibfk_1');
CALL DropForeignKeyIfExists('Post_image', 'fk_post_image_post_id');
CALL DropForeignKeyIfExists('Spot', 'Spot_ibfk_1');
CALL DropForeignKeyIfExists('Spot', 'fk_spot_artwork');
CALL DropForeignKeyIfExists('Route_spot', 'Route_spot_ibfk_1');
CALL DropForeignKeyIfExists('Route_spot', 'Route_spot_ibfk_2');
CALL DropForeignKeyIfExists('Route_spot', 'fk_route_spot_route');
CALL DropForeignKeyIfExists('Route_spot', 'fk_route_spot_spot');
CALL DropForeignKeyIfExists('Comment', 'Comment_ibfk_1');
CALL DropForeignKeyIfExists('Comment', 'fk_comment_user');
CALL DropForeignKeyIfExists('Comment', 'fk_comment_post');
CALL DropForeignKeyIfExists('Bookmark', 'fk_bookmark_post_image');
CALL DropForeignKeyIfExists('Bookmark', 'fk_bookmark_user');
CALL DropForeignKeyIfExists('Bookmark', 'fk_bookmark_route');

-- [3. 테이블 구조 및 컬럼명 변경]

-- User 테이블 속성 강화
ALTER TABLE `User` 
    MODIFY COLUMN `email` varchar(255) NOT NULL,
    MODIFY COLUMN `nickname` varchar(255) NOT NULL,
    MODIFY COLUMN `password` varchar(255) NOT NULL;

-- Post 테이블 상태값 및 카운트 설정
ALTER TABLE `Post` 
    MODIFY COLUMN `status` enum('public','private') NOT NULL DEFAULT 'private',
    MODIFY COLUMN `view_count` int DEFAULT 0,
    MODIFY COLUMN `like_count` int DEFAULT 0;

-- Post_image 컬럼명 동기화
CALL RenameColumnIfExists('Post_image', 'image_id', 'post_image_id', 'bigint NOT NULL AUTO_INCREMENT');
ALTER TABLE `Post_image` MODIFY COLUMN `image_url` varchar(5000) NOT NULL;

-- Spot 오타 수정 및 타입 변경
CALL RenameColumnIfExists('Spot', 'latitude', 'latitute', 'decimal(10,7) NOT NULL');
CALL RenameColumnIfExists('Spot', 'longitude', 'longitute', 'decimal(10,7) NOT NULL');
CALL RenameColumnIfExists('Spot', 'address', 'adress', 'varchar(300) DEFAULT NULL');

-- Bookmark ID 명칭 변경
CALL RenameColumnIfExists('Bookmark', 'bookmark_id', 'book_mark_id', 'int NOT NULL AUTO_INCREMENT');

-- [4. 신규 외래키 설정 (사양서 기반)]

ALTER TABLE `Post_image` ADD CONSTRAINT `fk_post_image_post_id` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE;
ALTER TABLE `Spot` ADD CONSTRAINT `fk_spot_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`) ON DELETE RESTRICT;
ALTER TABLE `Route_spot` ADD CONSTRAINT `fk_route_spot_route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`) ON DELETE CASCADE;
ALTER TABLE `Route_spot` ADD CONSTRAINT `fk_route_spot_spot` FOREIGN KEY (`spot_id`) REFERENCES `Spot` (`spot_id`) ON DELETE CASCADE;
ALTER TABLE `Comment` ADD CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE;
ALTER TABLE `Comment` ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;
ALTER TABLE `Bookmark` ADD CONSTRAINT `fk_bookmark_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;
ALTER TABLE `Bookmark` ADD CONSTRAINT `fk_bookmark_post_image` FOREIGN KEY (`post_image_id`) REFERENCES `Post_image` (`post_image_id`) ON DELETE CASCADE;
ALTER TABLE `Bookmark` ADD CONSTRAINT `fk_bookmark_route` FOREIGN KEY (`route_id`) REFERENCES `Route` (`route_id`) ON DELETE CASCADE;

-- [5. 마무리 및 프로시저 삭제]
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;
DROP PROCEDURE IF EXISTS RenameColumnIfExists;
SET FOREIGN_KEY_CHECKS = 1;