-- 1. User 테이블 (V1에 없는 인덱스만 추가)
-- email, nickname은 이미 UNIQUE KEY로 인덱스가 자동 생성되어 있으므로 제외함.
CREATE INDEX `IDX_User_Status` ON `User` (`status`);
CREATE INDEX `IDX_User_CreatedAt` ON `User` (`created_at`);

-- 2. Post 테이블
-- V1에 FK(FX_Post_User)가 이미 인덱스로 존재할 수 있으므로, 
-- 설계서상 명시된 날짜 정렬용 인덱스만 추가함.
CREATE INDEX `IDX_Post_CreatedAt` ON `Post` (`created_at`);

-- 3. Route 테이블
-- V1에 user_id FK가 있지만, 공개 여부(is_public)와 함께 조회되는 경우가 많으므로 복합 인덱스 권장
CREATE INDEX `IDX_Route_Public_Search` ON `Route` (`is_public`, `created_at`);

-- 4. Route_spot 테이블 (가장 중요한 인덱스)
-- 특정 경로의 스팟들을 '순서대로' 가져오는 쿼리 최적화
CREATE INDEX `IDX_RouteSpot_ListOrder` ON `Route_spot` (`route_id`, `visit_order`);

-- 5. Bookmark 테이블
-- 특정 유저가 어떤 게시글이나 루트를 북마크했는지 빠르게 필터링
CREATE INDEX `IDX_Bookmark_User_Content` ON `Bookmark` (`user_id`, `created_at`);

-- 6. User_tag 테이블 (V1.1에서 생성된 테이블)
-- 특정 작품(Artwork)별로 어떤 태그들이 많이 쓰였는지 통계 쿼리 최적화
CREATE INDEX `IDX_UserTag_Stats` ON `User_tag` (`artwork_id`, `count` DESC);