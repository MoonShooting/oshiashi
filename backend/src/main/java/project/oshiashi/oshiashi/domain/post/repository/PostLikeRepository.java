package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostLikeEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, Long> {
	// 특정 유저가 특정 게시글에 좋아요를 눌렀는지 확인
	Optional<PostLikeEntity> findByPostAndUser(PostEntity post, UserEntity user);
	
}
