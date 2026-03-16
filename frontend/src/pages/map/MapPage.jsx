import React, { useCallback, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainLayout from '@/components/layout/MainLayout';
import LegacyMapDisplay from '@/components/map/legacy/LegacyMapDisplay';
import LegacyPlaceSearch from '@/components/map/legacy/LegacyPlaceSearch';
import {
  DEFAULT_LOCATION,
  DUMMY_PILGRIMAGE_SITES,
} from '@/data/map/pilgrimageMockData';
import styles from '@/styles/MapPage.module.css';

export default function MapPage() {
  // 실제 라우트 페이지는 진입 상태와 레이아웃 조립만 담당하고,
  // 검색/지도 렌더링 구현은 pages 밖의 components/map로 분리해 둡니다.
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const isDev = import.meta.env.DEV;

  const handleLocationChange = useCallback((newLocation) => {
    if (!newLocation) return;
    setLocation(newLocation);
  }, []);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <MainLayout
        isMapPage={true}
        mapComponent={<LegacyMapDisplay location={location} />}
        /* 지도 페이지일 때만 나타나는 좌측 장소 리스트 */
        leftSidebar={
          <div className={styles.placeList}>
            {DUMMY_PILGRIMAGE_SITES.map((site) => (
              <div
                key={site.id}
                onClick={() => handleLocationChange(site.position)}
              >
                {site.title}
              </div>
            ))}
          </div>
        }
        /* 지도 위에 뜰 검색창 */
        overlayUI={<LegacyPlaceSearch onSearchResult={handleLocationChange} />}
      >
        {/* MainLayout의 children: 개발도구 등 */}
        {isDev && <div className={styles.devBox}>Map Debug Mode</div>}
      </MainLayout>
    </APIProvider>
  );
}
