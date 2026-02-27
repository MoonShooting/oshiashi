package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkTypeEntity;

public interface ArtworkTypeRepository extends JpaRepository<ArtworkTypeEntity, Integer> {
}
