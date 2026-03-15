package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtworkRepository extends JpaRepository<ArtworkEntity, Long> {

    List<ArtworkEntity> findByArtworkType_ArtworkTypeId(Long artworkTypeId);

    // TMDB import 중복 체크
    boolean existsByTmdbId(Long tmdbId);

    // 작품 검색용
    Optional<ArtworkEntity> findByTitle(String title);
}