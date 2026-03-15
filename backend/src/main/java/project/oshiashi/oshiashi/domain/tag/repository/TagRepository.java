package project.oshiashi.oshiashi.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {

	// 작품 기준으로 이미 연결된 태그가 있는지 확인
	Optional<TagEntity> findByArtwork_ArtworkId(Long artworkId);

	// 태그 이름으로  찾기 (중복 체크용)
	Optional<TagEntity> findByTagName(String tagName);
	
	// 태그 검색
	List<TagEntity> findByTagNameStartingWith(String tagName);
}
