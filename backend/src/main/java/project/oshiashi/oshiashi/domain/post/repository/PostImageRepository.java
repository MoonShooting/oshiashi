package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;

@Repository
public interface PostImageRepository extends JpaRepository<PostImageEntity, Long> {
}
