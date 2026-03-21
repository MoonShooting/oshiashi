/**
 * @file MapPage.jsx
 * @description 성지 탐색 지도 페이지 (/map)
 * 좌측: MapFilterPanel (작품·태그 필터)
 * 중앙: MapCore (핀 표시, 핀 클릭 → PinOverlay 팝업 + 거리뷰 조회)
 * 우측 상단 오버레이: MapSearchBar (장소 검색)
 */
import React, { useState, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import MapFilterPanel from '@/components/map/MapFilterPanel';
import MapLegend from '@/components/map/MapLegend';
import MapSearchBar from '@/components/map/MapSearchBar';
import styles from '@/styles/MapLayout.module.css';
import { DUMMY_PILGRIMAGE_SITES, DEFAULT_LOCATION } from '@/data/dummyData';

export default function MapPage() {
  const [pins] = useState(DUMMY_PILGRIMAGE_SITES);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [center, setCenter] = useState(DEFAULT_LOCATION);

  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  // 핀 클릭 → 팝업 열기, 배경 클릭(null) → 팝업 닫기
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.id);
    setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
  }, []);

  const handleSelectPlace = useCallback((loc) => {
    if (!loc) return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MapLayout
        isMapPage={true}
        lockScroll={true}
        activeMenuKey="map"
        leftSidebar={
          <MapFilterPanel
            onFilterChange={(f) => {
              // TODO: GET /api/v1/spots/search?keyword=&mediaType= 연결 후 MapCore pins 교체
              console.log('필터링 작동:', f);
            }}
            onLocationHover={handlePreview}
          />
        }
        mapComponent={
          <div className={styles.mapPageContainer}>
            <MapCore
              pins={pins}
              selectedPinId={selectedPinId}
              center={center}
              onPinClick={handlePinClick}
              disableMapClick={false}
              searchBar={
                <MapSearchBar
                  onSelectPlace={handleSelectPlace}
                  onPreview={handlePreview}
                  placeholder="작품명 검색..."
                  className={styles.searchOverlay}
                  center={center}
                />
              }
            />
            <MapLegend pinCount={pins?.length || 0} />
          </div>
        }
      />
    </APIProvider>
  );
}
