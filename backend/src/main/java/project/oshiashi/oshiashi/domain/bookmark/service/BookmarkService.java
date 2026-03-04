package project.oshiashi.oshiashi.domain.bookmark.service;

import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;

import java.util.List;

public interface BookmarkService {

    BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request);

    List<BookmarkResponse> getBookmarksByUser(String userId);

    void deleteBookmark(Long bookmarkId);
}