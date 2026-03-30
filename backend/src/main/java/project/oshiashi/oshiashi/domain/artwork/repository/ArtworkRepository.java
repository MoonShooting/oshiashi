package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

import java.util.List;
import java.util.Optional;

/*
 * ArtworkEntity를 대상으로 DB 접근을 담당하는 Repository입니다.
 *
 * 기본 CRUD는 JpaRepository가 제공하고,
 * 아래 메서드들은 작품 조회/중복 검사에 필요한 조건 검색을 위해 추가했습니다.
 */
@Repository
public interface ArtworkRepository extends JpaRepository<ArtworkEntity, Long> {

    /*
     * 작품 타입별 작품 목록 조회
     *
     * 사용 예
     * - 영화만 조회
     * - 드라마만 조회
     * - 애니메이션만 조회
     *
     * artworkType 객체 안의 artworkTypeId 값을 기준으로 조회합니다.
     */
    List<ArtworkEntity> findByArtworkType_ArtworkTypeId(Long artworkTypeId);

    // 사용자가 작품명을 입력했을 때 내부 DB에서 먼저 후보를 찾기 위한 검색
    List<ArtworkEntity> findByTitleContainingIgnoreCase(String title);

    /*
     * title + artworkType 기준 중복 여부 확인
     *
     * 현재 DB에는 TMDB 고유 id 컬럼이 없기 때문에
     * 내부 기준인 제목 + 작품 타입 조합으로 중복을 검사합니다.
     *
     * 예시
     * - "너의 이름은" + 애니메이션  -> 이미 있으면 true
     * - "너의 이름은" + 영화        -> 다른 타입이면 별개로 볼 수 있음
     */
    boolean existsByTitleAndArtworkType_ArtworkTypeId(String title, Long artworkTypeId);

    /*
    중복 검사 로직을 exists 기준으로 단순하게 가져가면 findBy 계열은 현재 바로 필요하지 않습니다.
    다만 중복 시 기존 작품 반환이나 관리자 검색 기능 확장 가능성을 고려해 넣은 메서드들 이며, 지금 단계에서는 제거해도 무방합니다.

     * title + artworkType 기준 단건 조회
     *
     * 중복 여부만 확인하는 exists와 달리,
     * 실제 작품 엔티티가 필요할 때 사용할 수 있는 조회 메서드입니다.
     *
     * 예시
     * - 이미 DB에 있는 작품을 다시 저장하지 않고 재사용할 때
     * - 동일 제목/타입 작품의 상세 정보가 필요할 때
     */
    Optional<ArtworkEntity> findByTitleAndArtworkType_ArtworkTypeId(String title, Long artworkTypeId);

    /*
     * 제목만으로 작품 단건 조회
     *
     * 현재 import 중복 판정의 핵심 기준은 아니고,
     * 단순 제목 검색이 필요한 경우를 대비해 둔 메서드입니다.
     *
     * 주의
     * - 같은 제목의 작품이 여러 타입으로 존재할 수 있으므로
     *   중복 판정용으로는 title 단독보다 title + artworkType 기준이 더 안전합니다.
     */
    Optional<ArtworkEntity> findByTitle(String title);

    // 작품 제목 기준 자동완성 추천어 조회
    @Query("""
    select distinct a.title
    from ArtworkEntity a
    where lower(a.title) like lower(concat('%', :keyword, '%'))
    order by a.title asc
    """)
    List<String> findTop5TitlesByKeyword(String keyword);

    // ── 성능 최적화: ArtworkType JOIN FETCH로 N+1 방지 (자동완성용) ──
    @Query("""
        SELECT a FROM ArtworkEntity a
        JOIN FETCH a.artworkType
        WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY a.title ASC
    """)
    List<ArtworkEntity> findByTitleWithType(@Param("keyword") String keyword);
}
