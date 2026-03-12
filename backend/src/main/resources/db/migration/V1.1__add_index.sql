DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;
DELIMITER $$
CREATE PROCEDURE CreateIndexIfNotExists(IN t_name VARCHAR(128), IN i_name VARCHAR(128), IN create_sql TEXT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = DATABASE() AND table_name = t_name AND index_name = i_name) THEN
        SET @s = create_sql; PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL CreateIndexIfNotExists('user', 'idx_user_status', 'CREATE INDEX `idx_user_status` ON `user` (`status`)');
CALL CreateIndexIfNotExists('post', 'idx_post_created_at', 'CREATE INDEX `idx_post_created_at` ON `post` (`created_at`)');
CALL CreateIndexIfNotExists('route_spot', 'idx_routespot_list_order', 'CREATE INDEX `idx_routespot_list_order` ON `route_spot` (`route_id`, `visit_order`)');
CALL CreateIndexIfNotExists('user_tag', 'idx_usertag_stats', 'CREATE INDEX `idx_usertag_stats` ON `user_tag` (`artwork_id`, `count` DESC)');

DROP PROCEDURE CreateIndexIfNotExists;