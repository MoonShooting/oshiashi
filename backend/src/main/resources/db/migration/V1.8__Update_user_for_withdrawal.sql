-- 1. 기존 프로시저 삭제
DROP PROCEDURE IF EXISTS update_user_for_withdrawal;

-- 2. 프로시저 생성
DELIMITER //

CREATE PROCEDURE update_user_for_withdrawal()
BEGIN
    -- 'user' 테이블에 'deleted_at' 컬럼이 없는 경우에만 실행
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'user' 
        AND column_name = 'deleted_at'
    ) THEN
        
        -- ① 탈퇴 요청 일시 컬럼 추가 (30일 유예기간 계산용)
        ALTER TABLE `user` 
        ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '탈퇴 요청 일시';

        -- ② 기존 status 제약조건 삭제 후 'withdrawn'을 포함하여 다시 생성
        ALTER TABLE `user` DROP CHECK `check_status`;
        
        ALTER TABLE `user` ADD CONSTRAINT `check_status` 
        CHECK (`status` IN ('active', 'dormant', 'withdrawn'));
        
    END IF;
END //

DELIMITER ;

-- 3. 프로시저 실행 및 정리
CALL update_user_for_withdrawal();
DROP PROCEDURE IF EXISTS update_user_for_withdrawal;