package project.oshiashi.oshiashi.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {
	
	// 태그 이름으로  찾기 (중복 체크용)
	Optional<TagEntity> findByTagName(String tagName);
	
	// 태그 검색
	List<TagEntity> findByTagNameStartingWith(String tagName);
}
