package project.oshiashi.oshiashi.domain.bookmark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Integer> {
}
