import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  CircleAlert,
  MapPinned,
  Route,
} from 'lucide-react';
import styles from '@/styles/PostCreatePage.module.css';

const RouteGroup = ({ label, routes, selectedRouteId, onSelect }) => {
  if (routes.length === 0) return null;

  return (
    <div className={styles.routeGroup}>
      <p className={styles.routeGroupLabel}>{label}</p>
      {routes.map((route) => {
        const isActive = selectedRouteId === route.id;

        return (
          <button
            key={route.id}
            type="button"
            className={isActive ? `${styles.routeOption} ${styles.routeOptionActive}` : styles.routeOption}
            onClick={() => onSelect(route.id)}>
            <div className={styles.routeOptionMain}>
              <span
                className={
                  route.sourceType === 'MY_ROUTE'
                    ? `${styles.sourceBadge} ${styles.sourceBadgeMy}`
                    : `${styles.sourceBadge} ${styles.sourceBadgeBookmark}`
                }>
                {route.sourceLabel}
              </span>
              <div>
                <strong className={styles.routeOptionTitle}>{route.title}</strong>
                <p className={styles.routeOptionMeta}>
                  {route.bookmarkedPostTitle
                    ? `${route.ownerDisplayName}의 게시물 북마크`
                    : route.ownerDisplayName}
                </p>
              </div>
            </div>
            <span className={styles.routeOptionSummary}>
              <MapPinned size={14} />
              {route.spots.length}개 장소
            </span>
          </button>
        );
      })}
    </div>
  );
};

const PostRoutePicker = ({
  routes = [],
  selectedRouteId = '',
  onSelectRoute,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const myRoutes = routes.filter((route) => route.sourceType === 'MY_ROUTE');
  const bookmarkedRoutes = routes.filter((route) => route.sourceType !== 'MY_ROUTE');
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? null;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSelect = (routeId) => {
    onSelectRoute(routeId);
    setOpen(false);
  };

  return (
    <section className={styles.routeSelectorCard}>
      <div className={styles.routeSelectorHeader}>
        <div className={styles.routeSelectorHeading}>
          <span className={styles.routeSelectorLabel}>루트 선택</span>
          <p className={styles.routeSelectorDescription}>
            내 루트와 북마크한 게시물의 루트를 불러와, 장소 수만큼 사진 기록 칸을 자동으로 생성합니다.
          </p>
        </div>

        {selectedRoute ? (
          <div className={styles.routeSelectorBadge}>
            <Route size={14} />
            총 {selectedRoute.spots.length}개 장소 포함
          </div>
        ) : (
          <div className={styles.routeSelectorWarning}>
            <CircleAlert size={14} />
            게시물은 루트를 먼저 선택해야 합니다
          </div>
        )}
      </div>

      <div className={styles.routeSelectorControls}>
        <div className={styles.routeDropdownWrap} ref={dropdownRef}>
          <button
            type="button"
            className={open ? `${styles.routeDropdownButton} ${styles.routeDropdownButtonOpen}` : styles.routeDropdownButton}
            onClick={() => setOpen((prev) => !prev)}
            disabled={loading}>
            <div className={styles.routeDropdownContent}>
              {selectedRoute ? (
                <>
                  <span className={styles.routeDropdownValue}>{selectedRoute.title}</span>
                  <span className={styles.routeDropdownMeta}>
                    {selectedRoute.sourceLabel}
                    {selectedRoute.bookmarkedPostTitle
                      ? ` · ${selectedRoute.bookmarkedPostTitle}`
                      : ''}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.routeDropdownPlaceholder}>
                    {loading ? '루트를 불러오는 중...' : '북마크한 루트를 선택하세요'}
                  </span>
                  <span className={styles.routeDropdownMeta}>
                    선택 즉시 루트 내 장소 수만큼 기록 카드가 생성됩니다
                  </span>
                </>
              )}
            </div>
            <ChevronDown className={styles.routeDropdownChevron} size={18} />
          </button>

          {open ? (
            <div className={styles.routeDropdownPanel}>
              <RouteGroup
                label="내 루트"
                routes={myRoutes}
                selectedRouteId={selectedRouteId}
                onSelect={handleSelect}
              />
              <RouteGroup
                label="북마크한 루트"
                routes={bookmarkedRoutes}
                selectedRouteId={selectedRouteId}
                onSelect={handleSelect}
              />
            </div>
          ) : null}
        </div>

        <div className={styles.routeSourceFooter}>
          <span className={styles.routeSourceChip}>
            <MapPinned size={14} />
            내 루트 {myRoutes.length}개
          </span>
          <span className={`${styles.routeSourceChip} ${styles.routeSourceChipMuted}`}>
            <Bookmark size={14} />
            북마크한 루트 {bookmarkedRoutes.length}개
          </span>
        </div>
      </div>
    </section>
  );
};

export default PostRoutePicker;
