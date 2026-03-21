-- [PostTag 테이블 ID 컬럼명 변경 프로시저]
-- 의도: id -> post_tag_id로 변경하여 엔티티 필드와 DB 컬럼명의 일관성을 맞춤
-- 로직: 컬럼이 존재할 때만 RENAME 수행 (중복 실행 방지)

DELIMITER $$

DROP PROCEDURE IF EXISTS RenamePostTagIdColumn $$

CREATE PROCEDURE RenamePostTagIdColumn()
BEGIN
    DECLARE column_exists INT;

    -- 1. post_tag 테이블에 'id'라는 이름의 컬럼이 있는지 확인
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'post_tag'
      AND column_name = 'id';

    -- 2. 컬럼이 존재하면 post_tag_id로 이름 변경
    -- MySQL 8.0 이상에서는 RENAME COLUMN 문법을 사용합니다.
    IF column_exists > 0 THEN
        ALTER TABLE post_tag RENAME COLUMN id TO post_tag_id;
        SELECT 'SUCCESS: Column id renamed to post_tag_id' AS Result;
    ELSE
        SELECT 'SKIP: Column id does not exist or is already renamed' AS Result;
    END IF;

END $$

DELIMITER ;

-- 프로시저 실행
CALL RenamePostTagIdColumn();

-- 사용 완료한 프로시저 삭제
DROP PROCEDURE RenamePostTagIdColumn;