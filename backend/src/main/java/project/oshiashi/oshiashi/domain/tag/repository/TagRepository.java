package project.oshiashi.oshiashi.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, Long> {
	
	// 특정 이름의 태그 찾기 ?
}
