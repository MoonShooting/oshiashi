-- ==============================================================================
-- [마법의 함수 생성] 인덱스가 존재하는지 확인하고, 없을 때만 생성하는 프로시저
-- ==============================================================================
DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;

DELIMITER $$
CREATE PROCEDURE CreateIndexIfNotExists(
    IN t_name VARCHAR(128),
    IN i_name VARCHAR(128),
    IN create_sql TEXT
)
BEGIN
    DECLARE index_exists INT;
    
    -- 현재 DB의 해당 테이블에, 만들려는 인덱스 이름이 이미 있는지 개수를 셉니다.
    SELECT COUNT(1) INTO index_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = t_name
      AND index_name = i_name;

    -- 인덱스가 없다면(0이라면) 전달받은 쿼리를 실행해서 인덱스를 만듭니다. (있으면 그냥 무시!)
    IF index_exists = 0 THEN
        SET @s = create_sql;
        PREPARE stmt FROM @s;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- ==============================================================================
-- [인덱스 생성부] 워크벤치에 이미 만들어져 있어도 절대 에러가 나지 않습니다!
-- ==============================================================================

-- 1. User 테이블 (V1에 없는 인덱스만 추가)
-- email, nickname은 이미 UNIQUE KEY로 인덱스가 자동 생성되어 있으므로 제외함.
CALL CreateIndexIfNotExists('User', 'IDX_User_Status', 'CREATE INDEX `IDX_User_Status` ON `User` (`status`)');
CALL CreateIndexIfNotExists('User', 'IDX_User_CreatedAt', 'CREATE INDEX `IDX_User_CreatedAt` ON `User` (`created_at`)');

-- 2. Post 테이블
-- V1에 FK(FX_Post_User)가 이미 인덱스로 존재할 수 있으므로, 
-- 설계서상 명시된 날짜 정렬용 인덱스만 추가함.
CALL CreateIndexIfNotExists('Post', 'IDX_Post_CreatedAt', 'CREATE INDEX `IDX_Post_CreatedAt` ON `Post` (`created_at`)');

-- 3. Route 테이블
-- V1에 user_id FK가 있지만, 공개 여부(is_public)와 함께 조회되는 경우가 많으므로 복합 인덱스 권장
CALL CreateIndexIfNotExists('Route', 'IDX_Route_Public_Search', 'CREATE INDEX `IDX_Route_Public_Search` ON `Route` (`is_public`, `created_at`)');

-- 4. Route_spot 테이블 (가장 중요한 인덱스)
-- 특정 경로의 스팟들을 '순서대로' 가져오는 쿼리 최적화
CALL CreateIndexIfNotExists('Route_spot', 'IDX_RouteSpot_ListOrder', 'CREATE INDEX `IDX_RouteSpot_ListOrder` ON `Route_spot` (`route_id`, `visit_order`)');

-- 5. Bookmark 테이블
-- 특정 유저가 어떤 게시글이나 루트를 북마크했는지 빠르게 필터링
CALL CreateIndexIfNotExists('Bookmark', 'IDX_Bookmark_User_Content', 'CREATE INDEX `IDX_Bookmark_User_Content` ON `Bookmark` (`user_id`, `created_at`)');

-- 6. User_tag 테이블 (V1.1에서 생성된 테이블)
-- 특정 작품(Artwork)별로 어떤 태그들이 많이 쓰였는지 통계 쿼리 최적화
CALL CreateIndexIfNotExists('User_tag', 'IDX_UserTag_Stats', 'CREATE INDEX `IDX_UserTag_Stats` ON `User_tag` (`artwork_id`, `count` DESC)');


-- ==============================================================================
-- [마무리] 다 썼으니 마법의 함수는 깔끔하게 삭제합니다.
-- ==============================================================================
DROP PROCEDURE CreateIndexIfNotExists;