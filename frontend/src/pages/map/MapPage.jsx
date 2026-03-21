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
import MapRightPanel from '@/components/map/MapRightPanel';
import MapLegend from '@/components/map/MapLegend';
import MapSearchBar from '@/components/map/MapSearchBar';
import styles from '@/styles/MapLayout.module.css';
import { DUMMY_PILGRIMAGE_SITES, DEFAULT_LOCATION, DUMMY_SPOT_DETAILS } from '@/data/dummyData';

/* BACKEND 연동 시, 현재는 dummyData 객체에서 id로 찾지만, 
    나중에 API 호출 시에는 const [selectedPin, setSelectedPin] = useState(null) 상태를 쓰고
    useEffect에서 fetch 후 setSelectedPin(res.data)를 하면 됩니다.
  */
export default function MapPage() {
  const [pins] = useState(DUMMY_PILGRIMAGE_SITES);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [activeMediaType, setActiveMediaType] = useState(null); // 좌측 필터 연동용 상태

  const selectedPinDetail = selectedPinId ? DUMMY_SPOT_DETAILS[selectedPinId] : null;

  /** 핀 클릭 핸들러.
   * 핀 클릭 → 팝업 열기, 배경 클릭(null) → 팝업 닫기
   * 1. 선택된 핀 ID 업데이트 (우측 패널 오픈 트리거)
   * 2. 클릭된 핀의 좌표로 지도 중심 이동 (setCenter)
   */
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null); // 여기서 null로 처리해야 팝업과 우측 패널이 모두 닫힙니다.
      return;
    }
    // 핀을 클릭했을 때
    setSelectedPinId(pin.id);
    //핀의 좌표를 숫자로 확실히 변환하여 지도 중심 이동
    if (pin.position) {
      setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
    }
  }, []);

  // 새로운 검색창에서 결과(자동완성) 클릭 시 실행
  const handleSearchResultSelect = useCallback((selectedItem) => {
    if (!selectedItem) return;

    // 지도 이동
    if (selectedItem.position) {
      setCenter({ lat: Number(selectedItem.position.lat), lng: Number(selectedItem.position.lng) });
    }
    // 우측 디테일 패널 열기
    setSelectedPinId(selectedItem.id);
    // 좌측 필터 패널에 태그 자동 선택 연동 (ex: 'ANIME')
    if (selectedItem.mediaType) {
      setActiveMediaType(selectedItem.mediaType);
    }
  }, []);

  // 미리보기 핸들러
  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
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
            activeMediaType={activeMediaType} //필터 패널에 활성 상태 연동
            onFilterChange={(f) => {
              // TODO: GET /api/v1/spots/search?keyword=&mediaType= 연결 후 MapCore pins 교체
              console.log('필터링 작동:', f);
              if (f.mediaType) setActiveMediaType(f.mediaType); // 직접 클릭 시에도 상태 업데이트
            }}
            onLocationHover={handlePreview}
          />
        }
        mapComponent={
          <div className={styles.mapPageContainer}>
            <MapCore
              pins={pins}
              selectedPinId={selectedPinId}
              center={center} // 중심 좌표 연동
              onPinClick={handlePinClick} // 핀 클릭 이벤트
              disableMapClick={true} // 배경 클릭 차단 활성화
              searchBar={
                <MapSearchBar
                  data={pins} // 검색할 더미(또는 DB) 데이터 전달
                  onSelectResult={handleSearchResultSelect} // 결과 클릭 시 핸들러 연결
                  onPreview={handlePreview}
                  placeholder="작품명 검색..."
                  className={styles.searchOverlay}
                  center={center}
                />
              }
            />
            {/* 우측 디테일 패널 - 상단 80px 패딩 및 z-index 50 적용됨 */}
            <MapRightPanel pin={selectedPinDetail} onClose={() => setSelectedPinId(null)} />
            {/* 좌측 하단 범례 */}
            <MapLegend pinCount={pins?.length || 0} />
          </div>
        }
      />
    </APIProvider>
  );
}
