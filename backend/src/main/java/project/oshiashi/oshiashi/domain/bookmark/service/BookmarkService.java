package project.oshiashi.oshiashi.domain.bookmark.service;

import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;

import java.util.List;

public interface BookmarkService {

    BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request);

    List<BookmarkResponse> getBookmarksByUser(String userId);

    // ID를 받아와 본인거만 지울 수 있도록
    void deleteBookmark(String userId, Long bookmarkId);
    
    
    
    
    boolean toggleBookmark(Long postId);
    
    List<PostResponse> getMyBookmarks();
}