-- [V1.2__Add_Indexes_And_Constraints.sql]

-- 1. User 테이블: 이메일과 닉네임 중복 방지 (사양서 기반)
ALTER TABLE `User` ADD UNIQUE INDEX `UK_User_email` (`email`);
ALTER TABLE `User` ADD UNIQUE INDEX `UK_User_nickname` (`nickname`);

-- 2. Post 테이블: 작성자별 게시글 조회를 위한 인덱스
CREATE INDEX `IDX_Post_user_id` ON `Post` (`user_id`);

-- 3. Post_image 테이블: 게시글별 이미지 조회를 위한 인덱스
CREATE INDEX `IDX_Post_image_post_id` ON `Post_image` (`post_id`);

-- 4. Spot 테이블: 지도 검색 최적화 (위도, 경도)
-- 공간 데이터 조회가 많으므로 인덱스가 필수입니다.
CREATE INDEX `IDX_Spot_coordinates` ON `Spot` (`latitute`, `longitute`);

-- 5. Bookmark 테이블: 사용자별 북마크 조회 인덱스
CREATE INDEX `IDX_Bookmark_user_id` ON `Bookmark` (`user_id`);

-- 6. Comment 테이블: 게시글별 댓글 조회 인덱스
CREATE INDEX `IDX_Comment_post_id` ON `Comment` (`post_id`);