package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostTagRepository extends JpaRepository<PostTagEntity, Long> {

	/**
	 * 특정 게시글(Post)에 연결된 모든 태그 매핑 정보를 조회
	 * @param post 게시글 엔티티
	 * @return 해당 게시글의 태그 매핑 리스트
	 */
	List<PostTagEntity> findByPost(PostEntity post);

	/**
	 * 특정 태그(Tag)가 포함된 모든 게시글 매핑 정보를 조회
	 * @param tag 태그 엔티티
	 * @return 해당 태그를 가진 게시글 매핑 리스트
	 */
	List<PostTagEntity> findByTag(TagEntity tag);

	/**
	 * 게시글 ID를 통해 해당 게시글의 모든 태그 매핑을 삭제
	 * - 주로 게시글 수정 시 기존 태그를 초기화하고 새로 등록할 때 사용
	 */
	void deleteByPost(PostEntity post);

	/**
	 * 특정 게시글에 특정 태그가 이미 등록되어 있는지 확인(중복 방지용)
	 */
	boolean existsByPostAndTag(PostEntity post, TagEntity tag);


	/**
	 * [정밀 삭제 1] 특정 게시글에서 특정 태그 하나만 삭제
	 * @param post 대상 게시글
	 * @param tag 삭제할 태그
	 */
	void deleteByPostAndTag(PostEntity post, TagEntity tag);

	/**
	 * [정밀 삭제 2] 특정 게시글에서 여러 개의 특정 태그들을 한꺼번에 삭제
	 * @param post 대상 게시글
	 * @param tags 삭제할 태그 리스트
	 */
	void deleteByPostAndTagIn(PostEntity post, List<TagEntity> tags);

	/**
	 * 특정 게시글과 특정 태그 조합으로 매핑 정보를 단건 조회
	 */
	Optional<PostTagEntity> findByPostAndTag(PostEntity post, TagEntity tag);
}