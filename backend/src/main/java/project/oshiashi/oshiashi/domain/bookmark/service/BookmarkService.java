package project.oshiashi.oshiashi.domain.bookmark.service;

import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;

import java.util.List;

public interface BookmarkService {
    
    
    BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request);
    
    void deleteBookmark(String userId, Long bookmarkId);
}