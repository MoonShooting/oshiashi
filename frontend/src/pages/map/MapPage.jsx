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

  // 핀 클릭 핸들러
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.id);
    setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
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
              console.log('필터링 작동:', f);
            }}
            onLocationHover={handlePreview}
          />
        }
        // 지도 메인 영역
        mapComponent={
          <div className={styles.container} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapCore pins={pins} selectedPinId={selectedPinId} center={center} onPinClick={handlePinClick} />
            <MapLegend />
          </div>
        }
      />
    </APIProvider>
  );
}
