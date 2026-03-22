-- 1. 기존 프로시저 삭제
DROP PROCEDURE IF EXISTS create_post_like_if_not_exists;

-- 2. 프로시저 정의
DELIMITER //

CREATE PROCEDURE create_post_like_if_not_exists()
BEGIN
    -- 테이블 존재 여부 체크
    IF NOT EXISTS (
        SELECT * FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'post_like'
    ) THEN
        -- 원본 DDL 규격에 맞춘 테이블 생성
        CREATE TABLE post_like (
            post_like_id   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '좋아요 id',
            post_id        BIGINT        NOT NULL COMMENT '게시글 id',
            user_id        VARCHAR(50)   NOT NULL COMMENT '유저 id',
            created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
            
            PRIMARY KEY (post_like_id),
            
            -- 원본 테이블(post, user)과 동일한 타입 및 인코딩 상속
            CONSTRAINT fk_postlike_post FOREIGN KEY (post_id) 
                REFERENCES post (post_id) ON DELETE CASCADE,
            CONSTRAINT fk_postlike_user FOREIGN KEY (user_id) 
                REFERENCES user (user_id) ON DELETE CASCADE,
            
            -- 한 유저가 한 포스트에 좋아요는 한 번만 가능하도록 유니크 제약 추가
            UNIQUE KEY ux_post_like_user (post_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 좋아요 관리 테이블';
        
        -- 검색 성능을 위한 인덱스
        CREATE INDEX ix_post_like_user ON post_like (user_id);
    END IF;
END //

DELIMITER ;

-- 3. 실행 및 정리
CALL create_post_like_if_not_exists();
DROP PROCEDURE IF EXISTS create_post_like_if_not_exists;