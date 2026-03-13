package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkTypeEntity;

import java.util.Optional;

public interface ArtworkTypeRepository extends JpaRepository<ArtworkTypeEntity, Long> {
    // 이름으로 찾기 메서드
    Optional<ArtworkTypeEntity> findByArtworkTypeName(String artworkTypeName);
}
