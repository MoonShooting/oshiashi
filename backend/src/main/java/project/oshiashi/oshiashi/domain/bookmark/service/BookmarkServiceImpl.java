package project.oshiashi.oshiashi.domain.bookmark.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.bookmark.repository.BookmarkRepository;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService{
	private final BookmarkRepository bookmarkRepository;
}
