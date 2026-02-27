package project.oshiashi.oshiashi.domain.artwork.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

@Repository
public interface ArtworkRepository extends JpaRepository<ArtworkEntity, Long> {
}
