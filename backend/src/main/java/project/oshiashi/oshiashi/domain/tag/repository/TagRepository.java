package project.oshiashi.oshiashi.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {
	
	// 중복 체크를 위한 메서드 (트리거 2번 관련)
	boolean existsByArtwork_ArtworkIdAndTagName(Long artworkId, String tagName);
	
	// 작품 삭제 시 연쇄 삭제를 위한 메서드 (트리거 3번 관련)
	void deleteByArtwork_ArtworkId(Long artworkId);
}
