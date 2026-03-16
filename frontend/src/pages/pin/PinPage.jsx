import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MapCore from '@/components/map/MapCore';
import MapFilterPanel from '@/components/map/MapFilterPanel';

export default function MapPage() {
  const [pins, setPins] = useState([]);
  const [filteredPins, setFilteredPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [center, setCenter] = useState({ lat: 35.6812, lng: 139.7671 });

  // 1. 드롭다운/리스트 hover 시 지도 중심 이동 (지우님의 방어 코드 적용)
  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
    // 숫자 형변환을 통해 API 데이터가 문자열이어도 안전하게 처리
    setCenter({
      lat: Number(loc.lat),
      lng: Number(loc.lng),
    });
  }, []);

  // 2. 핀 클릭 핸들러
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.id);
    setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
  }, []);

  return (
    <MainLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* 필터 패널에 handlePreview를 넘겨서 리스트 hover 시 작동하게 함 */}
        <MapFilterPanel
          onFilterChange={(f) => {
            /* 필터로직 */
          }}
          onLocationHover={handlePreview}
        />

        <MapCore pins={filteredPins} selectedPinId={selectedPinId} center={center} onPinClick={handlePinClick} />
      </div>
    </MainLayout>
  );
}
