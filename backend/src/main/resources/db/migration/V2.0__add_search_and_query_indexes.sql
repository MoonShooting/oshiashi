-- ============================================================
-- V2.0 검색/조회 성능 최적화 인덱스 추가
-- ============================================================

-- [Post] route_id 단독 인덱스
CREATE INDEX idx_post_route_id ON post (route_id);

-- [Comment] 게시글별 댓글 수 집계 최적화
CREATE INDEX idx_comment_post_id ON comment (post_id);
