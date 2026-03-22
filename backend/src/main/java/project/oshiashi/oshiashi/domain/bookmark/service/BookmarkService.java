package project.oshiashi.oshiashi.domain.bookmark.service;

import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;

import java.util.List;

public interface BookmarkService {

	// 1. 북마크 생성 (이름 커스텀 포함)
	BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request);

	// 2. 북마크 이름 수정 (고도화 핵심 기능!)
	// : 어떤 유저가(userId), 어떤 북마크를(bookmarkId), 어떤 이름으로(newName) 바꿀지 정의합니다.
	void updateBookmarkName(String userId, Long bookmarkId, String newName);

	// 3. 북마크 삭제
	void deleteBookmark(String userId, Long bookmarkId);

	// 4. 북마크 전체 조회 (목록을 봐야 이름을 바꿀지 말지 결정하겠죠?)
	List<BookmarkResponse> getAllMyBookmarks(String userId);
}