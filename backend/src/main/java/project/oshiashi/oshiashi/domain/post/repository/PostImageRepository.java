package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImageEntity, Long> {
    @Query("""
    select i.post.postId, i.imageUrl, i.sortOrder
    from PostImageEntity i
    where i.post.postId in :postIds
""")
    List<Object[]> findImagesByPostIds(List<Long> postIds);
}
