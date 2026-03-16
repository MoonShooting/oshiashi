import React, { useState, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainLayout from '@/components/layout/MainLayout';
import MapCore from '@/components/map/MapCore';
import MapFilterPanel from '@/components/map/MapFilterPanel';
import MapLegend from '@/components/map/MapLegend';
import MapSearchBar from '@/components/map/MapSearchBar';
import styles from '@/styles/MapPage.module.css';
import { DUMMY_PILGRIMAGE_SITES, DEFAULT_LOCATION } from '@/data/dummyData';

export default function MapPage() {
  // 이미 만들어둔 더미 데이터로 초기화
  const [pins] = useState(DUMMY_PILGRIMAGE_SITES);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [center, setCenter] = useState(DEFAULT_LOCATION);

  // 리스트 hover 시 지도 중심 이동
  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
    setCenter({
      lat: Number(loc.lat),
      lng: Number(loc.lng),
    });
  }, []);

  // 핀 클릭 핸들러 (disableMapClick=true이므로 배경 클릭은 여기 도달하지 않음)
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.id);
    setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
  }, []);

  // 검색창에서 장소 선택 시 지도 중심 이동
  const handleSelectPlace = useCallback((loc) => {
    if (!loc) return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  return (
    // APIProvider 필수! 없으면 지도 안 뜸
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MainLayout
        isMapPage={true} // 높이 100% CSS를 위한 필수 옵션
        activeMenuKey="map"
        // 사이드바 영역
        leftSidebar={
          <MapFilterPanel
            onFilterChange={(f) => {
              //임시로 콘솔로그 찍어둠.
              // TODO: 작품명·태그 검색은 Google Places API 대신 자체 DB + TMDB 연동으로 구현 필요
              // → GET /api/v1/spots/search?keyword=&mediaType= 연결 후 MapCore pins 교체
              console.log('필터링 작동:', f);
            }}
            onLocationHover={handlePreview}
          />
        }
        // 지도 메인 영역
        mapComponent={
          <div className={styles.container} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapCore
              pins={pins}
              selectedPinId={selectedPinId}
              center={center}
              onPinClick={handlePinClick}
              // 핀 외 지도 배경 클릭 차단 (MapPage는 핀 조회 전용)
              disableMapClick={true}
              // MapSearchBar는 useMap() 훅 사용으로 반드시 <Map> 내부에 있어야 함
              searchBar={
                <MapSearchBar
                  onSelectPlace={handleSelectPlace}
                  onPreview={handlePreview}
                  placeholder="작품명 검색..."
                  className={styles.searchOverlay} // 지도 상단 중앙 고정
                  center={center}
                />
              }
            />
            <MapLegend />
          </div>
        }
      />
    </APIProvider>
  );
}
