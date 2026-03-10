package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<ArtworkEntity, Long> {
    List<ArtworkEntity> findByArtworkType_ArtworkTypeId(Long artworkTypeId);
}