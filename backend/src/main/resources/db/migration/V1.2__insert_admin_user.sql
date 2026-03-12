DROP PROCEDURE IF EXISTS InsertAdminIfTableExists;

DELIMITER $$
CREATE PROCEDURE InsertAdminIfTableExists()
BEGIN
    -- 소문자 'user' 테이블이 있는지 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = 'user'
    ) THEN
        -- 소문자 `user` 테이블에 INSERT
        INSERT IGNORE INTO `user` (
            `user_id`, `user_name`, `email`, `password`, `nickname`, `role`, `status`
        ) VALUES (
            'admin', '관리자', 'admin@oshiashi.com', 'admin1234', '최고관리자', 'admin', 'active'
        );
    END IF;
END$$
DELIMITER ;

CALL InsertAdminIfTableExists();
DROP PROCEDURE InsertAdminIfTableExists;