package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtworkRepository extends JpaRepository<ArtworkEntity, Long> {
    List<ArtworkEntity> findByArtworkType_ArtworkTypeId(Long artworkTypeId);

    // tmdb 에서 들고온 값이 이미 있는 값인지 확인하는 메서드
    // existsByTitleAndArtworkType_ArtworkTypeId(...)로도 갈 수 있는데, 현재 DB가 title 단독 unique라서 지금은 existsByTitle()
    boolean existsByTitle(String title);
    Optional<ArtworkEntity> findByTitle(String title);
}