-- 1. tag 및 user_tag 테이블의 artwork_id NULL 허용 변경
ALTER TABLE tag MODIFY COLUMN artwork_id BIGINT NULL;
ALTER TABLE user_tag MODIFY COLUMN artwork_id BIGINT NULL;

-- 2. comment 테이블 대댓글 구조 형성을 위한 프로시저
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

CREATE PROCEDURE add_column_if_not_exists()
BEGIN
    DECLARE col_count INT;
    DECLARE fk_count INT;

    -- parent_id 컬럼 존재 여부 체크
    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'comment' 
    AND COLUMN_NAME = 'parent_id';

    -- 외래키(FK_comment_parent) 존재 여부 체크
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'comment' 
    AND CONSTRAINT_NAME = 'FK_comment_parent';

    -- 컬럼이 없으면 추가 (CommentEntity의 @JoinColumn과 매칭)
    IF col_count = 0 THEN
        ALTER TABLE comment ADD COLUMN parent_id BIGINT DEFAULT NULL;
    END IF;

    -- 외래키가 없으면 추가 (CommentEntity의 @ForeignKey와 매칭)
    IF fk_count = 0 THEN
        ALTER TABLE comment ADD CONSTRAINT FK_comment_parent 
        FOREIGN KEY (parent_id) REFERENCES comment (comment_id) ON DELETE CASCADE;
    END IF;
END;

-- 프로시저 실행 후 삭제
CALL add_column_if_not_exists();
DROP PROCEDURE add_column_if_not_exists;

-- 3. artwork_type 기초 데이터 삽입 (중복 방지)
INSERT IGNORE INTO artwork_type (artwork_type_name) VALUES ('영화');
INSERT IGNORE INTO artwork_type (artwork_type_name) VALUES ('드라마');
INSERT IGNORE INTO artwork_type (artwork_type_name) VALUES ('애니메이션');