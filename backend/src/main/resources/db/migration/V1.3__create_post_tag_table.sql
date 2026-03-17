-- V1.3__create_post_tag_table.sql
CREATE TABLE IF NOT EXISTS post_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,  -- 모든 PK가 bigint이므로 여기도 bigint로 통일!
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_post_tag (post_id, tag_id),
    
    -- 참조 대상 컬럼명과 타입을 정확히 일치시켰습니다.
    CONSTRAINT fk_post_tag_post FOREIGN KEY (post_id) REFERENCES post (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tag_tag FOREIGN KEY (tag_id) REFERENCES tag (tag_id) ON DELETE CASCADE
) ENGINE=InnoDB;