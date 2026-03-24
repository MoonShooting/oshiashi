import React, { useEffect, useState } from 'react';
import { Bookmark, FileText, MapPinned, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FetchJson } from '@/api/FetchClient';
import { getMyRoutesAPI } from '@/api/user';
import { fetchBookmarksWithFallback, formatDateLabel, normalizeTagNames } from '@/api/postApiShared';
import MyPageContentSection from '@/components/mypage/MyPageContentSection';
import MyPageHeroCard from '@/components/mypage/MyPageHeroCard';
import MyPageTabList from '@/components/mypage/MyPageTabList';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/modal/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/MyPage.module.css';

const TAB_ITEMS = [
  { key: 'spots', label: '내 루트', icon: MapPinned },
  { key: 'posts', label: '내 게시글', icon: FileText },
  { key: 'bookmarks', label: '북마크', icon: Bookmark },
  { key: 'achievements', label: '업적', icon: Trophy },
  { key: 'create-route', label: '루트 생성' },
];

const CONTENT_COPY = {
  spots: {
    title: '내가 만든 루트',
    description: '직접 생성한 루트 목록을 최신순으로 보여줍니다.',
    emptyTitle: '아직 만든 루트가 없습니다.',
    emptyDescription: '지도 화면에서 장소를 고른 뒤 첫 루트를 만들어보세요.',
  },
  posts: {
    title: '내가 작성한 게시물',
    description: '루트 게시글과 커뮤니티 글을 함께 불러옵니다.',
    emptyTitle: '아직 작성한 게시물이 없습니다.',
    emptyDescription: '첫 게시물을 작성하면 이 영역에 바로 표시됩니다.',
  },
  bookmarks: {
    title: '북마크한 루트',
    description: '북마크한 루트만 모아 확인할 수 있습니다.',
    emptyTitle: '아직 북마크한 루트가 없습니다.',
    emptyDescription: '마음에 드는 루트를 북마크하면 여기에서 다시 볼 수 있습니다.',
  },
};

const EMPTY_PAGE_DATA = {
  myRoutes: [],
  myPosts: [],
  bookmarkedRoutes: [],
  issues: [],
};

const toProfile = (user) => ({
  displayName: user?.nickname || user?.userId || '사용자',
  userId: user?.userId || '-',
  email: user?.email || '-',
  joinedAt: user?.createdAt ? String(user.createdAt).slice(0, 10) : '-',
});

const toRoutePreview = (route, bookmarkName = '') => {
  const spotNames = (route?.spots ?? route?.routeSpots ?? [])
    .map((spot, index) => spot?.title ?? spot?.spotName ?? spot?.name ?? `장소 ${index + 1}`)
    .filter(Boolean);

  return {
    id: String(route?.id ?? route?.routeId ?? ''),
    title: route?.title ?? route?.routeTitle ?? '제목 없는 루트',
    publishedAt: formatDateLabel(route?.createdAt),
    visibilityLabel: route?.isPublic ? '공개 루트' : '비공개 루트',
    ownerId: route?.userId ?? '',
    spotCount: spotNames.length,
    spotNames,
    bookmarkName,
  };
};

const toPostPreview = (post, displayName) => {
  const postId = String(post?.postId ?? post?.id ?? '');
  const routeId = post?.routeId ?? null;

  return {
    id: postId,
    title: post?.title ?? '제목 없는 게시글',
    excerpt: post?.content ?? '',
    author: displayName || post?.userId || '나',
    publishedAt: formatDateLabel(post?.createdAt),
    tagNames: normalizeTagNames(post?.tagNames),
    viewCount: Number(post?.viewCount ?? 0),
    likeCount: Number(post?.likeCount ?? 0),
    imageUrl: Array.isArray(post?.imageUrl) ? (post.imageUrl[0] ?? '') : '',
    category: routeId != null ? '루트 게시글' : '커뮤니티',
    path: routeId != null ? `/posts/${postId}` : `/community/${postId}`,
  };
};

const loadMyPageData = async (userId, displayName) => {
  const issues = [];

  const [routesResult, postsResult] = await Promise.allSettled([getMyRoutes(), FetchJson('/api/v1/user/posts')]);

  const myRoutes = routesResult.status === 'fulfilled' ? routesResult.value.map((route) => toRoutePreview(route)) : [];
  if (routesResult.status === 'rejected') {
    issues.push('내가 만든 루트 목록을 가져오지 못했습니다.');
  }

  const myPosts = postsResult.status === 'fulfilled' ? postsResult.value.map((post) => toPostPreview(post, displayName)) : [];
  if (postsResult.status === 'rejected') {
    issues.push('내가 작성한 게시물 목록을 가져오지 못했습니다.');
  }

  let bookmarkedRoutes = [];

  try {
    const bookmarks = await fetchBookmarksWithFallback({
      fetchJson: FetchJson,
      userId,
    });

    const routeBookmarks = bookmarks.filter((bookmark) => bookmark?.routeId != null);
    const routes = await Promise.all(
      routeBookmarks.map(async (bookmark) => {
        try {
          const route = await FetchJson(`/api/v1/routes/${bookmark.routeId}`);
          return toRoutePreview(route, bookmark?.bookmarkName ?? '');
        } catch {
          issues.push(`북마크한 루트 ${bookmark.routeId} 상세 조회에 실패했습니다.`);
          return null;
        }
      }),
    );

    bookmarkedRoutes = routes.filter(Boolean);
  } catch {
    issues.push('북마크한 루트 목록을 가져오지 못했습니다.');
  }

  return {
    myRoutes,
    myPosts,
    bookmarkedRoutes,
    issues,
  };
};

const MyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const profile = toProfile(user);

  const [activeTab, setActiveTab] = useState('spots');
  const [pageData, setPageData] = useState(EMPTY_PAGE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextData = await loadMyPageData(user?.userId, profile.displayName);
        if (active) {
          setPageData(nextData);
        }
      } catch (error) {
        if (active) {
          setPageData(EMPTY_PAGE_DATA);
          setLoadError(error?.message || '마이페이지 정보를 가져오지 못했습니다.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [profile.displayName, user?.userId]);

  const summaryItems = [
    { key: 'spots', label: '내 루트', icon: MapPinned, value: pageData.myRoutes.length },
    { key: 'posts', label: '내 게시글', icon: FileText, value: pageData.myPosts.length },
    { key: 'bookmarks', label: '북마크', icon: Bookmark, value: pageData.bookmarkedRoutes.length },
    { key: 'achievements', label: '업적', icon: Trophy, value: 0 },
  ];

  const copy = CONTENT_COPY[activeTab];
  const activeItems = activeTab === 'spots' ? pageData.myRoutes : activeTab === 'posts' ? pageData.myPosts : pageData.bookmarkedRoutes;

  return (
    <MainLayout isMapPage={false} activeMenuKey="mypage">
      <div className={styles.page}>
        <MyPageHeroCard profile={profile} summaryItems={summaryItems} onShowAchievements={() => setActiveTab('achievements')} />

        <MyPageTabList
          tabs={TAB_ITEMS}
          activeTab={activeTab}
          onTabClick={(tabKey) => {
            if (tabKey === 'create-route') {
              navigate('/map');
              return;
            }
            setActiveTab(tabKey);
          }}
        />

        <MyPageContentSection
          activeTab={activeTab}
          copy={copy}
          isLoading={isLoading}
          loadError={loadError}
          issues={pageData.issues}
          activeItems={activeItems}
          myPosts={pageData.myPosts}
          onNavigateToPost={(path) => navigate(path)}
          onNavigateToAchievements={() => navigate('/achievements')}
        />

        <div className={styles.footerActionRow}>
          <Button type="button" variant="textMuted" size="xsText" onClick={() => navigate('/mypage/withdraw')}>
            회원탈퇴
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPage;
