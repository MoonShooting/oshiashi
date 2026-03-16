import { FetchClient } from '@/api/FetchClient';
import {
  MOCK_POST_CREATE_ROUTES,
  buildPostCreatePayload,
  normalizeRouteOption,
} from '@/data/post/postCreateMockData';

export const POST_CREATE_BACKEND_GAPS = [
  'BookmarkResponse는 routeId 또는 postId만 내려주기 때문에, 북마크한 게시물에서 연결된 루트를 바로 풀어낼 수 없습니다.',
  'RouteResponse는 routeSpots에 spotId와 visitOrder만 담고 있어 원본 장면 이미지, 장소명, 주소를 자동으로 채우기 어렵습니다.',
  'PostCreateRequest와 PostImageRequest에는 사진별 경험 텍스트, spotId 연결, 추가 장소 정보가 없습니다.',
  'PostController와 PostServiceImpl은 현재 PostResponse 중심으로 동작하며 route/user/images 저장이 완성되어 있지 않습니다.',
];

const dedupeRoutes = (routes) =>
  Array.from(new Map(routes.map((route) => [route.id, route])).values());

/**
 * 게시물 생성 페이지용 루트 목록을 로드합니다.
 *
 * 현재 프로젝트의 백엔드 계약이 완성되지 않아,
 * 실 API가 부족하거나 실패하면 data/post에 모아둔 목업 라우트로 자동 대체합니다.
 */
export const loadPostCreateRoutes = async (userId) => {
  const resolvedRoutes = [];
  const issues = [];

  try {
    const rawMyRoutes = await FetchClient('/api/v1/routes/my');
    if (Array.isArray(rawMyRoutes) && rawMyRoutes.length > 0) {
      resolvedRoutes.push(
        ...rawMyRoutes.map((route) =>
          normalizeRouteOption(route, {
            sourceType: 'MY_ROUTE',
            sourceLabel: '내 루트',
          }),
        ),
      );
    } else {
      issues.push('내 루트 조회 응답이 비어 있습니다.');
    }
  } catch (error) {
    issues.push('내 루트 조회 API가 아직 연결되지 않았습니다.');
  }

  if (userId) {
    try {
      const rawBookmarks = await FetchClient(
        `/api/v1/user/bookmarks?userId=${encodeURIComponent(userId)}`,
      );

      if (Array.isArray(rawBookmarks)) {
        const routeBookmarks = rawBookmarks.filter((bookmark) => bookmark.routeId != null);

        const bookmarkedRoutes = await Promise.all(
          routeBookmarks.map(async (bookmark) => {
            try {
              const rawRoute = await FetchClient(`/api/v1/routes/${bookmark.routeId}`);
              return normalizeRouteOption(rawRoute, {
                sourceType: 'BOOKMARKED_ROUTE',
                sourceLabel: '북마크한 루트',
                bookmarkName: bookmark.bookmarkName,
              });
            } catch (error) {
              issues.push(
                `북마크한 루트 ${bookmark.routeId}의 상세 정보를 가져오는 엔드포인트가 없습니다.`,
              );
              return null;
            }
          }),
        );

        resolvedRoutes.push(...bookmarkedRoutes.filter(Boolean));

        if (rawBookmarks.some((bookmark) => bookmark.postId != null)) {
          issues.push(
            '게시글 북마크는 routeId를 직접 제공하지 않아 게시물 작성용 루트로 자동 변환할 수 없습니다.',
          );
        }
      }
    } catch (error) {
      issues.push('북마크 조회 API가 아직 연결되지 않았습니다.');
    }
  }

  const routes = dedupeRoutes(resolvedRoutes);

  if (routes.length === 0) {
    return {
      mode: 'mock',
      routes: MOCK_POST_CREATE_ROUTES,
      issues: [...POST_CREATE_BACKEND_GAPS, ...issues],
    };
  }

  return {
    mode: 'api',
    routes,
    issues,
  };
};

/**
 * 현재 백엔드에는 사진별 경험 기록을 저장할 계약이 없어,
 * 게시물 생성은 우선 프런트 payload 미리보기 단계까지만 제공합니다.
 */
export const submitPostCreatePreview = async (draft) => ({
  ok: true,
  mode: 'preview',
  payload: buildPostCreatePayload(draft),
});
