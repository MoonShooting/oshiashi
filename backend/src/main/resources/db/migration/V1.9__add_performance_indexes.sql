-- ============================================================
-- V1.9 성능 최적화 인덱스 추가
-- Entity @Index에 선언되었으나 ddl-auto=none으로 미생성된 인덱스 보완
-- ============================================================

-- [Comment] 작성자별 조회 최적화 (FK 암묵적 인덱스 외 추가 필요)
CREATE INDEX idx_comment_user ON comment (user_id);

-- [Comment] 생성일 정렬 최적화
CREATE INDEX idx_comment_created_at ON comment (created_at);

-- [PostImage] 생성일 정렬 최적화
CREATE INDEX idx_post_image_created_at ON post_image (created_at);

-- [Spot] 좌표 범위 검색 최적화 (지도 기능 핵심 인덱스)
CREATE INDEX idx_spot_lat_lng ON spot (latitude, longitude);

-- [Spot] 작품별 장소 검색 + 이름 정렬 복합 인덱스
CREATE INDEX idx_spot_artwork_name ON spot (artwork_id, name);

-- [Post] 루트 게시글 목록 최적화 (최신순)
CREATE INDEX idx_post_route_created ON post (route_id, created_at DESC);

-- [Post] 루트 게시글 목록 최적화 (인기순)
CREATE INDEX idx_post_route_likes ON post (route_id, like_count DESC, created_at DESC);

-- [Post] 루트 게시글 목록 최적화 (조회순)
CREATE INDEX idx_post_route_views ON post (route_id, view_count DESC, created_at DESC);

-- [Artwork] 제목 검색 최적화 (자동완성 + TMDB 중복 체크)
CREATE INDEX idx_artwork_title ON artwork (title);

-- [Route] 사용자별 루트 목록 + 최신순 정렬 복합 인덱스
CREATE INDEX idx_route_user_created ON route (user_id, created_at DESC);
