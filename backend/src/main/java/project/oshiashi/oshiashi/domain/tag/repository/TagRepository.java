package project.oshiashi.oshiashi.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.List;
import java.util.Optional;

/**
 * [ 태그 리포지토리 ]
 * - 작품(Artwork)과 게시글(Post)에서 공통 또는 개별적으로 사용하는 태그 데이터를 관리합니다.
 */
@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {

	/**
	 * 1. 태그 이름으로 단건 조회
	 * @param tagName 찾고자 하는 태그 명칭 (예: "산책", "맛집")
	 * @return Optional<TagEntity>
	 * - 용도: 게시글 작성 시, 입력받은 태그가 이미 DB에 있는지 확인하고 가져올 때 사용합니다.
	 */
	Optional<TagEntity> findByTagName(String tagName);
	List<TagEntity> findAllByTagNameIn(List<String> tagNames);

	/**
	 * 2. 태그 이름 존재 여부 확인
	 * @param tagName 확인할 태그 명칭
	 * @return 존재하면 true, 없으면 false
	 */
	boolean existsByTagName(String tagName);

	// 아트워크 ID 기반
	Optional<TagEntity> findByArtwork_ArtworkId(Long artworkId);
	boolean existsByArtwork_ArtworkId(Long artworkId);

	// --- 기존 Artwork 관련 메서드 (이미지 내용 반영) ---

	/**
	 * 3. 특정 작품 내 중복 태그 체크
	 * @param artworkId 작품 ID
	 * @param tagName 태그 명칭
	 * @return 존재 여부
	 */
	boolean existsByArtwork_ArtworkIdAndTagName(Long artworkId, String tagName);

	/**
	 * 4. 특정 작품에 연결된 모든 태그 삭제
	 * @param artworkId 작품 ID
	 * - 용도: 작품 삭제 시 연쇄 삭제(Trigger 대용) 로직에서 사용합니다.
	 */
	void deleteByArtwork_ArtworkId(Long artworkId);

	// 존재하는 tag 목록을 조회하여 선택하도록 하기 위한 조회용
	List<TagEntity> findAllByOrderByTagNameAsc();

	@Query("""
    select pt.post.postId, t.tagName
    from PostTagEntity pt
    join pt.tag t
    where pt.post.postId in :postIds
    """)
	List<Object[]> findTagNamesByPostIds(List<Long> postIds);
}
