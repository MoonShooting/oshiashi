const STORAGE_KEY = 'oshiashi.mock.post-bookmarks.v1';

const readBookmarks = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (bookmarks) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
};

export const getStoredPostBookmarks = () => readBookmarks();

export const getStoredPostBookmark = (postId) =>
  readBookmarks().find((bookmark) => String(bookmark.postId) === String(postId)) ?? null;

export const savePostBookmark = (post) => {
  const bookmarks = readBookmarks();
  const existing = bookmarks.find((bookmark) => String(bookmark.postId) === String(post.id));

  if (existing) {
    return existing;
  }

  const created = {
    bookmarkId: `mock-bookmark-${post.id}`,
    bookmarkName: `${post.title} 북마크`,
    postId: post.id,
    routeTitle: post.routeTitle,
    postTitle: post.title,
    authorName: post.author?.name ?? '',
    createdAt: new Date().toISOString(),
  };

  writeBookmarks([created, ...bookmarks]);
  return created;
};

export const removePostBookmark = (postId) => {
  const next = readBookmarks().filter((bookmark) => String(bookmark.postId) !== String(postId));
  writeBookmarks(next);
};
