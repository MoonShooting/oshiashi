/**
 * @file MapPage.jsx
 * @description 성지 탐색 지도 페이지 (/map)
 *
 * [수정 내용] 초기 더미 로딩 및 자동 근처 검색 제거
 * 1. 마운트 시 핀 데이터 호출 안 함 (깨끗한 지도 유지)
 * 2. 지도 이동(idle) 시 자동 호출 제거
 * 3. 오직 좌측 패널(MapFilterPanel)에서 작품 검색 시에만 searchPlaces 호출
 * 4. 미디어 타입 칩: 검색된 결과 내에서 클라이언트 사이드 필터링 수행
 * 5. 서버로부터 미디어 타입 목록을 받아 MapFilterPanel에 전달
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import MapFilterPanel from '@/components/map/MapFilterPanel';
import MapRightPanel from '@/components/map/MapRightPanel';
import MapLegend from '@/components/map/MapLegend';
import styles from '@/styles/MapLayout.module.css';
import { searchPlaces, getPlaceDetail } from '@/api/mapApi';
import { DEFAULT_CENTER } from '@/constants/mapConstants';
import { useMapStore } from '@/stores/useMapStore';

const toArray = (data) => (Array.isArray(data) ? data : []);

export default function MapPage() {
  // 상태 관리
  const [pins, setPins] = useState([]); // 검색으로 가져온 원본 핀 데이터
  const [hasSearched, setHasSearched] = useState(false); // 검색 수행 여부 (최초 안내 문구 숨김용)
  const [serverMediaTypes] = useState(['영화', '드라마', '애니메이션']); //호출 늦지 않기 위해 기본값 지정
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [selectedPinDetail, setSelectedPinDetail] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loadingPins, setLoadingPins] = useState(false);

  // 글로벌 상태 (Zustand 등)
  const activeMediaTypes = useMapStore((s) => s.activeMediaTypes);
  const toggleMediaType = useMapStore((s) => s.toggleMediaType);

  // 핀 상세 정보 조회 (마커 클릭 시)
  useEffect(() => {
    if (!selectedPinId) {
      setSelectedPinDetail(null);
      return;
    }
    const fetchPlaceDetail = async () => {
      try {
        const detail = await getPlaceDetail(selectedPinId);
        setSelectedPinDetail(detail || null);
      } catch (error) {
        console.error('[MapPage] 장소 상세 로드 실패:', error);
        setSelectedPinDetail(null);
      }
    };
    fetchPlaceDetail();
  }, [selectedPinId]);

  // 클라이언트 사이드 필터링
  // 검색된 원본(pins)에서 활성화된 태그(activeMediaTypes)만 걸러서 지도에 표시
  const filteredPins = useMemo(() => {
    if (activeMediaTypes.length === 0) return pins;
    return pins.filter((p) => activeMediaTypes.includes(p.mediaType));
  }, [pins, activeMediaTypes]);

  // 검색 핸들러 (MapFilterPanel에서 호출)
  const handleWorkSearchFromPanel = useCallback(
    async (keyword) => {
      const q = keyword?.trim();
      if (!q) {
        // 검색어가 지워지면 지도도 초기화
        setPins([]);
        setHasSearched(false);
        setSelectedPinId(null);
        return;
      }

      try {
        setLoadingPins(true);
        setHasSearched(true); // 결과 없음 메시지 노출 가능
        setSelectedPinId(null); // 기존 선택된 핀 초기화

        // 선택된 태그가 딱 1개라면 검색 API에 필터 파라미터로 전달
        const mediaParam = activeMediaTypes.length === 1 ? activeMediaTypes[0] : null;
        const data = await searchPlaces(q, mediaParam);
        const results = toArray(data);

        setPins(results);

        // 검색 결과가 있으면 첫 번째 핀 위치로 카메라 이동
        if (results.length > 0 && results[0].latitude != null && results[0].longitude != null) {
          setCenter({
            lat: Number(results[0].latitude),
            lng: Number(results[0].longitude),
          });
        }
      } catch (err) {
        console.error('[MapPage] 작품 검색 실패:', err);
      } finally {
        setLoadingPins(false);
      }
    },
    [activeMediaTypes],
  );

  // 핀 클릭 핸들러
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.placeId);
    if (pin.latitude != null && pin.longitude != null) {
      setCenter({ lat: Number(pin.latitude), lng: Number(pin.longitude) });
    }
  }, []);

  // 검색을 한 번도 안 했으면 메시지를 안 띄움
  const showEmptyNoData = hasSearched && !loadingPins && pins.length === 0;
  const showEmptyFiltered = hasSearched && !loadingPins && pins.length > 0 && filteredPins.length === 0;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MapLayout
        isMapPage={true}
        lockScroll={true}
        activeMenuKey="map"
        leftSidebar={
          <MapFilterPanel
            activeMediaTypes={activeMediaTypes}
            onToggleMediaType={toggleMediaType}
            onWorkSearch={handleWorkSearchFromPanel}
            serverMediaTypes={serverMediaTypes} // 서버에서 받아온 태그 전달
          />
        }
        mapComponent={
          <div className={styles.mapPageContainer}>
            {/* 데이터 오버레이 */}
            {loadingPins && <div className={styles.mapEmptyOverlay}>검색 중…</div>}

            {showEmptyNoData && (
              <div className={styles.mapEmptyOverlay} role="status">
                검색된 작품의 성지 정보가 없습니다.
              </div>
            )}

            {showEmptyFiltered && (
              <div className={styles.mapEmptyOverlay} role="status">
                선택한 태그에 맞는 장소가 없습니다.
              </div>
            )}

            <MapCore
              pins={filteredPins} // 필터링된 핀만 전달
              selectedPinId={selectedPinId}
              center={center}
              onPinClick={handlePinClick}
              disableMapClick={true}
              // onCameraIdle 제거: 지도 이동 시마다 재검색하지 않음
            />

            <MapRightPanel pin={selectedPinDetail} onClose={() => setSelectedPinId(null)} />

            <MapLegend pinCount={filteredPins.length} />
          </div>
        }
      />
    </APIProvider>
  );
}
