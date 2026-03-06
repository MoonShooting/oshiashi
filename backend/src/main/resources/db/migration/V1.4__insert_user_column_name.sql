-- ==============================================================================
-- [마법의 함수] User 테이블에 name 컬럼이 없을 때만 안전하게 추가합니다.
-- ==============================================================================
DROP PROCEDURE IF EXISTS AddNameColumnIfNotExists;

DELIMITER $$
CREATE PROCEDURE AddNameColumnIfNotExists()
BEGIN
    DECLARE col_exists INT;
    
    -- 현재 DB의 User 테이블에 'name' 컬럼이 이미 있는지 개수를 셉니다.
    SELECT COUNT(1) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'User'
      AND COLUMN_NAME = 'name';

    -- 컬럼이 없을 때(0일 때)만 추가 쿼리를 실행합니다! (있으면 스무스하게 패스)
    IF col_exists = 0 THEN
        ALTER TABLE `User` ADD COLUMN `name` VARCHAR(50) NOT NULL DEFAULT 'unknown';
    END IF;
END$$
DELIMITER ;

-- ==============================================================================
-- [실행 및 청소] 워크벤치에서 이미 만들었어도 절대 에러가 나지 않습니다!
-- ==============================================================================
CALL AddNameColumnIfNotExists();
DROP PROCEDURE AddNameColumnIfNotExists;