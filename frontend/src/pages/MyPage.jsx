import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, FileText, MapPinned, Pencil, Settings, Trophy, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { getMyRoutes } from '@/api/mapApi';
import { MOCK_POST_CREATE_ROUTES, normalizeRouteOption } from '@/data/post/postCreateMockData';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/MyPage.module.css';

const TAB_ITEMS = [
  { key: 'spots', label: '내 루트' },
  { key: 'posts', label: '내 게시글' },
  { key: 'bookmarks', label: '북마크' },
  { key: 'achievements', label: '업적' },
  { key: 'create-route', label: '루트 생성' },
];

const SUMMARY_ITEMS = [
  { key: 'spots', label: '내 루트', icon: MapPinned },
  { key: 'posts', label: '내 게시글', icon: FileText },
  { key: 'bookmarks', label: '북마크', icon: Bookmark },
  { key: 'achievements', label: '업적', icon: Trophy },
];

const FALLBACK_MY_ROUTES = MOCK_POST_CREATE_ROUTES.filter((route) => route.sourceType === 'MY_ROUTE');

const formatRouteDate = (value) => {
  if (!value) return '날짜 정보 없음';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜 정보 없음';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getRouteSummary = (route) => route.summary?.trim() || `${route.spots.length}개의 장소를 순서대로 둘러볼 수 있도록 저장한 루트입니다.`;

const getSpotMeta = (spot) => {
  const values = [spot.artworkTitle ?? null, spot.address ?? null, spot.spotId ? `Spot ID ${spot.spotId}` : null].filter(Boolean);

  return values.join(' · ');
};

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInitialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('spots');
  const [myRoutes, setMyRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [routeLoadState, setRouteLoadState] = useState('idle');
  const [routeLoadMessage, setRouteLoadMessage] = useState('');

  const profile = useMemo(
    () => ({
      displayName: user?.nickname || user?.userId || '사용자',
      userId: user?.userId || '-',
      email: user?.email || '-',
      joinedAt: user?.createdAt ? String(user.createdAt).slice(0, 10) : '-',
    }),
    [user],
  );

  useEffect(() => {
    if (!isInitialized) return undefined;

    // 마이페이지는 인증 사용자 전용 맥락이 강하므로,
    // 비로그인 상태에서는 루트 목록을 비우고 별도 상세 콘텐츠를 만들지 않습니다.
    if (!isLoggedIn) {
      setMyRoutes([]);
      setSelectedRouteId('');
      setRouteLoadState('guest');
      setRouteLoadMessage('');
      return undefined;
    }

    let cancelled = false;

    const loadMyRoutes = async () => {
      setRouteLoadState('loading');

      try {
        const routes = await getMyRoutes();

        if (cancelled) return;

        // 실제 API 데이터가 있으면 우선 사용하고,
        // 카드/상세 패널 UI는 공통 route shape로 맞춰 렌더링합니다.
        if (Array.isArray(routes) && routes.length > 0) {
          const normalizedRoutes = routes.map((route) =>
            normalizeRouteOption(route, {
              sourceType: 'MY_ROUTE',
              sourceLabel: '내 루트',
              ownerDisplayName: user?.userId || '나의 저장 루트',
            }),
          );

          setMyRoutes(normalizedRoutes);
          setRouteLoadState('api');
          setRouteLoadMessage('저장한 내 루트를 선택하면 오른쪽에서 상세 경로를 바로 확인할 수 있습니다.');
          return;
        }

        // 저장 루트가 아직 없는 상황에서도 상세보기 구조를 검토할 수 있도록
        // 프로젝트 내 목업 "내 루트"만 골라 fallback으로 사용합니다.
        setMyRoutes(FALLBACK_MY_ROUTES);
        setRouteLoadState('mock');
        setRouteLoadMessage('저장된 루트가 아직 없어 예시 루트로 상세보기 흐름을 먼저 보여드리고 있습니다.');
      } catch (error) {
        if (cancelled) return;

        // API 연결 전/실패 상황에서도 화면이 비어 보이지 않도록
        // 같은 상세보기 UI를 목업 루트로 유지합니다.
        setMyRoutes(FALLBACK_MY_ROUTES);
        setRouteLoadState('mock');
        setRouteLoadMessage('내 루트 API가 아직 연결되지 않아 예시 루트로 상세보기를 제공하고 있습니다.');
      }
    };

    loadMyRoutes();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, isLoggedIn, user?.userId]);

  useEffect(() => {
    if (myRoutes.length === 0) {
      setSelectedRouteId('');
      return;
    }

    // 현재 선택값이 사라졌다면 첫 번째 루트를 기본 상세 대상으로 잡아
    // "내 루트 상세보기"가 항상 즉시 보이도록 유지합니다.
    setSelectedRouteId((prev) => (myRoutes.some((route) => route.id === prev) ? prev : myRoutes[0].id));
  }, [myRoutes]);

  const selectedRoute = myRoutes.find((route) => route.id === selectedRouteId) ?? myRoutes[0] ?? null;

  const summaryItems = useMemo(
    () =>
      SUMMARY_ITEMS.map((item) => ({
        ...item,
        value: item.key === 'spots' ? myRoutes.length : 0,
      })),
    [myRoutes.length],
  );

  const handleTabClick = (tabKey) => {
    // 루트 생성은 마이페이지 탭 콘텐츠가 아니라 맵 기반 작성 흐름으로 이어집니다.
    if (tabKey === 'create-route') {
      navigate('/spot');
      return;
    }

    setActiveTab(tabKey);
  };

  const currentTabLabel = TAB_ITEMS.find((tab) => tab.key === activeTab)?.label ?? '내 루트';

  const currentTabDescription = useMemo(() => {
    if (activeTab === 'spots') {
      return routeLoadMessage || '내 루트를 선택하면 저장된 장소 흐름을 자세히 볼 수 있습니다.';
    }

    if (activeTab === 'achievements') {
      return '현재는 업적 미리보기만 제공하며, 전체 목록은 전용 업적 페이지에서 이어서 확인할 수 있습니다.';
    }

    return '현재는 mock 없이 연결되어 있어 실제 데이터가 들어오면 이 영역에 바로 반영됩니다.';
  }, [activeTab, routeLoadMessage]);

  const renderRouteContent = () => {
    if (!isInitialized || routeLoadState === 'loading') {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <MapPinned className={styles.emptyIcon} strokeWidth={2} />
          </div>
          <strong>내 루트를 불러오는 중입니다.</strong>
          <p>저장된 루트 목록과 상세 경로를 준비하고 있습니다.</p>
        </div>
      );
    }

    if (myRoutes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <MapPinned className={styles.emptyIcon} strokeWidth={2} />
          </div>
          <strong>아직 저장된 내 루트가 없습니다.</strong>
          <p>루트 생성 페이지에서 장소를 담고 저장하면 이곳에서 상세보기를 할 수 있습니다.</p>
          <button type="button" className={styles.previewActionButton} onClick={() => navigate('/spot')}>
            루트 생성 페이지로 이동
          </button>
        </div>
      );
    }

    return (
      <div className={styles.routeExplorer}>
        <div className={styles.routeListColumn}>
          {routeLoadState === 'mock' ? <div className={styles.routeDataNotice}>{routeLoadMessage}</div> : null}

          {myRoutes.map((route) => {
            const isActive = selectedRoute?.id === route.id;

            return (
              <article key={route.id} className={isActive ? `${styles.routeCard} ${styles.routeCardActive}` : styles.routeCard}>
                <div className={styles.routeCardHeader}>
                  <span className={styles.routeSourceBadge}>{route.sourceLabel}</span>
                  <span className={styles.routeCountBadge}>{route.spots.length}개 장소</span>
                </div>

                <strong className={styles.routeCardTitle}>{route.title}</strong>
                <p className={styles.routeCardSummary}>{getRouteSummary(route)}</p>

                <div className={styles.routeMetaRow}>
                  <span>{route.isPublic ? '공개 루트' : '비공개 루트'}</span>
                  <span>{formatRouteDate(route.createdAt)}</span>
                </div>

                <button type="button" className={styles.routeDetailButton} onClick={() => setSelectedRouteId(route.id)}>
                  {/* 왼쪽에서는 "어떤 루트를 볼지" 고르고,
                      오른쪽 패널이 그 선택값을 즉시 상세로 풀어주는 2열 구조입니다. */}
                  {isActive ? '선택된 루트 보기' : '루트 상세보기'}
                </button>
              </article>
            );
          })}
        </div>

        {selectedRoute ? (
          <section className={styles.routeDetailPanel}>
            <div className={styles.routeDetailHeader}>
              <div className={styles.routeDetailHeading}>
                <span className={styles.routeDetailEyebrow}>Route Detail</span>
                <h4>{selectedRoute.title}</h4>
                <p>{getRouteSummary(selectedRoute)}</p>
              </div>

              <div className={styles.routeDetailStats}>
                <div>
                  <span>장소 수</span>
                  <strong>{selectedRoute.spots.length}곳</strong>
                </div>
                <div>
                  <span>공개 여부</span>
                  <strong>{selectedRoute.isPublic ? '공개' : '비공개'}</strong>
                </div>
              </div>
            </div>

            <div className={styles.routeSpotList}>
              {selectedRoute.spots.map((spot, index) => (
                <article key={`${selectedRoute.id}-${spot.spotId ?? index}`} className={styles.routeSpotCard}>
                  {/* 루트 저장 순서를 그대로 보여줘야 사용자가 작성한 동선과 상세 패널이 일치합니다. */}
                  <div className={styles.routeSpotOrder}>{index + 1}</div>

                  {spot.sceneImageUrl ? (
                    <img className={styles.routeSpotImage} src={spot.sceneImageUrl} alt={spot.name} />
                  ) : (
                    <div className={styles.routeSpotPlaceholder}>이미지 준비 중</div>
                  )}

                  <div className={styles.routeSpotInfo}>
                    <strong>{spot.name}</strong>
                    <p>{getSpotMeta(spot)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="mypage">
      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroGlowStart} />
          <div className={styles.heroGlowEnd} />

          <div className={styles.profileSection}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarCircle}>
                <UserRound className={styles.avatarIcon} strokeWidth={1.9} />
              </div>
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileHeader}>
                <h2 className={styles.profileName}>{profile.displayName}</h2>
              </div>

              <div className={styles.profileMeta}>
                <p>ID: {profile.userId}</p>
                <p>Email: {profile.email}</p>
                <p>가입일: {profile.joinedAt}</p>
              </div>

              <div className={styles.profileActions}>
                <button type="button" className={styles.primaryActionButton}>
                  <Pencil className={styles.actionIcon} strokeWidth={2} />
                  <span>프로필 편집</span>
                </button>

                <button type="button" className={styles.secondaryActionButton}>
                  <Settings className={styles.actionIcon} strokeWidth={2} />
                  <span>설정</span>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            {summaryItems.map((item) => {
              const Icon = item.icon;
              const isAchievementsCard = item.key === 'achievements';

              return (
                <article
                  key={item.key}
                  className={isAchievementsCard ? `${styles.summaryCard} ${styles.summaryCardLink}` : styles.summaryCard}
                  role={isAchievementsCard ? 'button' : undefined}
                  tabIndex={isAchievementsCard ? 0 : undefined}
                  onClick={isAchievementsCard ? () => setActiveTab('achievements') : undefined}
                  onKeyDown={
                    isAchievementsCard
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveTab('achievements');
                          }
                        }
                      : undefined
                  }>
                  <div className={styles.summaryHeader}>
                    <span>{item.label}</span>
                    <Icon className={styles.summaryIcon} strokeWidth={2} />
                  </div>
                  <strong className={styles.summaryValue}>{item.value}</strong>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.tabCard}>
          <div className={styles.tabList} role="tablist" aria-label="마이페이지 섹션">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={activeTab === tab.key ? styles.tabButtonActive : styles.tabButton}
                onClick={() => handleTabClick(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.contentCard}>
          <div className={styles.contentHeaderRow}>
            <div className={styles.contentHeader}>
              <h3>{currentTabLabel}</h3>
              <p>{currentTabDescription}</p>
            </div>

            {activeTab === 'achievements' ? (
              <button type="button" className={styles.previewActionButton} onClick={() => navigate('/achievements')}>
                업적 전체보기
              </button>
            ) : null}
          </div>

          {activeTab === 'spots' ? (
            renderRouteContent()
          ) : activeTab === 'achievements' ? (
            <div className={styles.achievementPreview}>
              <div className={styles.emptyIconWrap}>
                <Trophy className={styles.emptyIcon} strokeWidth={2} />
              </div>

              <div className={styles.achievementPreviewText}>
                <strong>나의 업적 미리보기</strong>
                <p>업적 요약은 이 영역에서 먼저 확인하고, 상세 업적 목록은 `업적 전체보기` 버튼으로 전용 페이지에서 이어서 확인합니다.</p>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                {activeTab === 'posts' ? (
                  <FileText className={styles.emptyIcon} strokeWidth={2} />
                ) : activeTab === 'bookmarks' ? (
                  <Bookmark className={styles.emptyIcon} strokeWidth={2} />
                ) : (
                  <Trophy className={styles.emptyIcon} strokeWidth={2} />
                )}
              </div>

              <strong>{currentTabLabel} 데이터가 아직 없습니다.</strong>
              <p>API가 연결되면 별도의 mock 교체 없이 이 화면 구조에 그대로 출력되도록 만들었습니다.</p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default MyPage;
