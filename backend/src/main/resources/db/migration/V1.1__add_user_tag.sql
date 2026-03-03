-- V1.1__add_user_tag.sql
CREATE TABLE `User_tag` (
    `user_tag_id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` varchar(50) NOT NULL,
    `tag_id` bigint NOT NULL,
    `artwork_id` bigint NOT NULL, -- 명세서 11번에 포함된 컬럼
    `count` int NOT NULL DEFAULT 0,
    `last_used_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_tag_id`),
    CONSTRAINT `FK_UserTag_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserTag_Tag` FOREIGN KEY (`tag_id`) REFERENCES `Tag` (`tag_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserTag_Artwork` FOREIGN KEY (`artwork_id`) REFERENCES `Artwork` (`artwork_id`) ON DELETE CASCADE,
    UNIQUE KEY `UK_user_tag_artwork` (`user_id`, `tag_id`, `artwork_id`)
);