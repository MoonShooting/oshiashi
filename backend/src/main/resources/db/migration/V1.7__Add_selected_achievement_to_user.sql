-- 1. 기존 프로시저 삭제
DROP PROCEDURE IF EXISTS add_selected_achievement_to_user;

-- 2. 프로시저 생성
DELIMITER //

CREATE PROCEDURE add_selected_achievement_to_user()
BEGIN
    -- 'user' 테이블에 'selected_achievement_id' 컬럼이 없는 경우에만 실행
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'user' 
        AND column_name = 'selected_achievement_id'
    ) THEN
        -- 대표 업적 ID 컬럼 추가 (achievement_id의 BIGINT 타입과 일치)
        ALTER TABLE `user` 
        ADD COLUMN `selected_achievement_id` BIGINT NULL COMMENT '유저가 선택한 대표 업적(칭호) ID';

        -- 외래 키(FK) 연결: achievement 테이블 참조
        ALTER TABLE `user`
        ADD CONSTRAINT `fk_user_selected_achievement` 
        FOREIGN KEY (`selected_achievement_id`) REFERENCES `achievement` (`achievement_id`)
        ON DELETE SET NULL; -- 업적이 삭제되어도 유저 정보는 유지
        
    END IF;
END //

DELIMITER ;

-- 3. 프로시저 실행 및 정리
CALL add_selected_achievement_to_user();
DROP PROCEDURE IF EXISTS add_selected_achievement_to_user;