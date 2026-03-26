/**
 * @file MapPage.jsx
 * @description 성지 탐색 지도 페이지 (/map)
 *
 * 지도 이동(idle) 시 자동 호출 제거
 * 오직 좌측 패널(MapFilterPanel)에서 작품 검색 시에만 searchPlaces 호출
 * 미디어 타입 칩: 검색된 결과 내에서 클라이언트 사이드 필터링 수행
 * 서버로부터 미디어 타입 목록을 받아 MapFilterPanel에 전달
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import MapFilterPanel from '@/components/map/MapFilterPanel';
import MapRightPanel from '@/components/map/MapRightPanel';
import MapLegend from '@/components/map/MapLegend';
import styles from '@/styles/MapLayout.module.css';
import { searchPlaces, getPlaceDetail, getPlaces } from '@/api/mapApi';
import { DEFAULT_CENTER } from '@/constants/mapConstants';
import { useMapStore } from '@/stores/useMapStore';

const toArray = (data) => (Array.isArray(data) ? data : []);

export default function MapPage() {
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

  // 핀 상세 정보 조회 (마커 클릭 / 자동 선택 시)
  useEffect(() => {
    if (!selectedPinId) {
      setSelectedPinDetail(null);
      return;
    }
    const fetchPlaceDetail = async () => {
      // local- 합성 ID는 실제 API가 없으므로 목록 데이터를 직접 사용
      if (selectedPinId.startsWith('local-')) {
        const fallback = pins.find((p) => p.placeId === selectedPinId) ?? null;
        setSelectedPinDetail(fallback);
        return;
      }
      try {
        const detail = await getPlaceDetail(selectedPinId);
        setSelectedPinDetail(detail || null);
      } catch (error) {
        console.error('[MapPage] 장소 상세 로드 실패:', error);
        // detail API 실패 시 목록 데이터로 패널 표시
        const fallback = pins.find((p) => p.placeId === selectedPinId) ?? null;
        setSelectedPinDetail(fallback);
      }
    };
    fetchPlaceDetail();
  }, [selectedPinId]); // pins는 의도적으로 deps 제외 (fallback 전용)

  // 클라이언트 사이드 필터링
  // 검색된 원본(pins)에서 활성화된 태그(activeMediaTypes)만 걸러서 지도에 표시
  const filteredPins = useMemo(() => {
    if (activeMediaTypes.length === 0) return pins;
    return pins.filter((p) => activeMediaTypes.includes(p.mediaType));
  }, [pins, activeMediaTypes]);

  // 검색 핸들러 (MapFilterPanel에서 호출)
  // useMapStore.getState()로 즉시 읽어 칩 토글 직후 재검색 시 스테일 클로저 방지
  const handleWorkSearchFromPanel = useCallback(async (keyword) => {
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

      // 칩 토글과 동시에 호출되는 경우 최신 값을 보장하기 위해 store에서 직접 읽음
      const currentMediaTypes = useMapStore.getState().activeMediaTypes;
      const mediaParam = currentMediaTypes.length === 1 ? currentMediaTypes[0] : null;
      const data = await searchPlaces(q, mediaParam);
      const results = toArray(data);

      setPins(results);

      // 키워드 검색 결과가 있으면 첫 번째 핀 자동 선택 → PinOverlay + 우측 패널 자동 오픈
      if (results.length > 0 && results[0].latitude != null && results[0].longitude != null) {
        setCenter({
          lat: Number(results[0].latitude),
          lng: Number(results[0].longitude),
        });
        setSelectedPinId(results[0].placeId); // synthetic ID라도 항상 non-null
      }
    } catch (err) {
      console.error('[MapPage] 작품 검색 실패:', err);
    } finally {
      setLoadingPins(false);
    }
  }, []);

  // 태그 토글 핸들러 — 검색 없이 태그만 클릭한 경우 전체 핀을 불러와 클라이언트 필터링
  const handleToggleMediaType = useCallback(async (type) => {
    toggleMediaType(type);
    setSelectedPinId(null); // 태그 모드에서는 선택 초기화 (팝업 닫기)
    if (pins.length === 0) {
      try {
        setLoadingPins(true);
        setHasSearched(true);
        const results = await getPlaces();
        setPins(results);
      } catch (err) {
        console.error('[MapPage] 전체 장소 로드 실패:', err);
      } finally {
        setLoadingPins(false);
      }
    }
  }, [pins.length, toggleMediaType]);

  // 핀 클릭 핸들러
  const handlePinClick = useCallback((pin) => {
    if (!pin) {
      setSelectedPinId(null);
      return;
    }
    setSelectedPinId(pin.placeId); // synthetic ID 포함 항상 non-null
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
            onToggleMediaType={handleToggleMediaType}
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
            />

            <MapRightPanel pin={selectedPinDetail} onClose={() => setSelectedPinId(null)} />

            <MapLegend pinCount={filteredPins.length} />
          </div>
        }
      />
    </APIProvider>
  );
}
