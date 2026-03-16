/**
 * @file SpotPage.jsx
 * @description 경로 생성 페이지 (/spot)
 *
 * [DB 연동 흐름]
 *   지도 핀 클릭 → useMapStore.addPlace(pin)  → 선택 목록에 추가
 *   드래그앤드롭 → useMapStore.reorderPlaces() → visit_order 순서 결정
 *   "경로 탐색"  → DirectionsService (Google Maps) → 지도 경로선 + 거리/시간
 *   "경로 저장"  → POST /api/v1/routes { title, isPublic, spotIds: [id...] }
 *                → Route 테이블 생성 + Route_spot 테이블에 visit_order 순으로 저장
 *
 * [반응형 레이아웃]
 *   < 768px  : 지도 풀스크린 + 하단 슬라이드업 패널 (칩 가로 스크롤)
 *   768~1199px: 좌지도 + 우측 220px 사이드 패널 (교통수단: 지도 우하단 pill)
 *   ≥ 1200px  : 좌지도 + 우측 300px 사이드 패널 (교통수단: 패널 하단 가로 탭)
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainLayout from '@/components/layout/MainLayout';
import MapCore from '@/components/map/MapCore';
import MapSearchBar from '@/components/map/MapSearchBar';
import { useMapStore } from '@/stores/useMapStore';
import { postRoute } from '@/api/mapApi';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAX_SPOT_COUNT } from '@/constants/mapConstants';
import styles from '@/styles/SpotPage.module.css';

// 이동수단 탭 정의
// Google Maps DirectionsService TravelMode와 동일 키 사용
const TRAVEL_MODES = [
  { key: 'WALKING', label: '도보', icon: '🚶' },
  { key: 'TRANSIT', label: '전철', icon: '🚇' },
  { key: 'DRIVING', label: '자동차', icon: '🚗' },
  { key: 'BICYCLING', label: '자전거', icon: '🚴' },
];

// 거리/시간 포맷 헬퍼
const fmtDist = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);
const fmtTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

// 거리뷰 새 창 열기 (후순위 기능)
const openStreetView = (lat, lng) => {
  window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`, '_blank');
};

// 메인 컴포넌트
export default function SpotPage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [travelMode, setTravelMode] = useState('WALKING');
  const [routeInfo, setRouteInfo] = useState(null);
  const [explored, setExplored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  const dragIdx = useRef(null);

  const { selectedPlaces, addPlace, removePlace, reorderPlaces, clearMap } = useMapStore();

  const selectedIds = useMemo(() => selectedPlaces.map((p) => p.id), [selectedPlaces]);

  // 지도 핀 클릭, 경로에 추가
  const handlePinClick = useCallback(
    (pin) => {
      if (!pin) return;
      if (selectedPlaces.length >= MAX_SPOT_COUNT) {
        alert(`최대 ${MAX_SPOT_COUNT}개까지 추가할 수 있습니다.`);
        return;
      }
      addPlace(pin);
      setCenter(pin.position);
      // 핀 추가 시 이전 탐색 결과 초기화 (순서 변경되었으므로)
      setExplored(false);
      setRouteInfo(null);
    },
    [selectedPlaces.length, addPlace],
  );

  // 검색 결과 선택 → 지도 이동
  const handleSelectPlace = useCallback((loc) => {
    setCenter({ lat: loc.lat, lng: loc.lng });
  }, []);

  // DirectionsService 결과 수신
  // DB 연관: 경로 요약(totalDistance, totalDuration)은 화면 표시 전용
  // 실제 거리는 DB에 저장하지 않음 (동적 계산값)
  const handleRouteInfo = useCallback((info) => {
    setRouteInfo(info);
  }, []);

  // 이동수단 변경
  const handleTravelMode = useCallback((mode) => {
    setTravelMode(mode);
    // 이동수단 변경 시 DirectionsService 재호출됨 (MapCore 내부 useEffect)
  }, []);

  // 경로 탐색 버튼
  const handleExplore = useCallback(() => {
    if (selectedPlaces.length < 2) {
      alert('장소를 2개 이상 선택해주세요.');
      return;
    }
    setExplored(true);
    // MapCore의 showPolyline=true가 DirectionsService를 자동 호출
  }, [selectedPlaces.length]);

  // 드래그앤드롭 핸들러
  const handleDragStart = useCallback((e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e, dropIdx) => {
      e.preventDefault();
      const from = dragIdx.current;
      if (from === null || from === dropIdx) return;
      const next = [...selectedPlaces];
      const [moved] = next.splice(from, 1);
      next.splice(dropIdx, 0, moved);
      reorderPlaces(next);
      dragIdx.current = null;
      // 순서 변경 → 탐색 결과 초기화
      setExplored(false);
      setRouteInfo(null);
    },
    [selectedPlaces, reorderPlaces],
  );

  // 경로 저장
  const handleSave = useCallback(() => {
    if (selectedPlaces.length < 2) {
      alert('장소를 2개 이상 선택해주세요.');
      return;
    }
    setShowModal(true);
  }, [selectedPlaces.length]);

  /**
   * 경로 저장 확정
   *
   * POST /api/v1/routes
   * Body: {
   *   title: string,         → Route.title
   *   isPublic: boolean,     → Route.is_public (0|1)
   *   spotIds: number[]      → selectedPlaces 순서대로 → Route_spot.visit_order
   * }
   */
  const handleConfirmSave = useCallback(async () => {
    if (!routeTitle.trim()) {
      alert('경로 이름을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    setShowModal(false);
    try {
      await postRoute({
        title: routeTitle,
        isPublic,
        // spot.id = Spot.spot_id (String → 백엔드에서 Long으로 파싱)
        spotIds: selectedPlaces.map((p) => Number(p.id)),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // TODO: 저장 성공 후 마이페이지 루트 목록으로 이동 여부 결정
      // navigate('/mypage/routes');
    } catch (err) {
      console.error('[SpotPage] 경로 저장 실패:', err.message);
      alert('경로 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
      setRouteTitle('');
    }
  }, [routeTitle, isPublic, selectedPlaces]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MainLayout
        isMapPage={true}
        activeMenuKey="spot"
        /* 지도는 MainLayout의 mapLayer 슬롯에 배치하여 
        전역 사이드바가 열려도 지도는 그 아래 깔리게 함 
      */
        mapComponent={
          <MapCore
            pins={selectedPlaces}
            center={center}
            zoom={DEFAULT_ZOOM}
            showPolyline={explored && selectedPlaces.length >= 2}
            travelMode={travelMode}
            onPinClick={handlePinClick}
            onRouteInfo={(info) => setRouteInfo(info)}></MapCore>
        }
        /* 경로 설정 패널은 leftSidebar 슬롯(혹은 right)으로 배치
        MainLayout에서 이 영역의 z-index를 전역 사이드바보다 낮게 설정 
      */
        leftSidebar={
          <div className={styles.sidePanel}>
            <div className={styles.listHeader}>
              <h3>경로 설정</h3>
              <span className={styles.count}>
                {selectedPlaces.length} / {MAX_SPOT_COUNT}
              </span>
            </div>

            <div className={styles.placeList}>
              {selectedPlaces.length > 0 ? (
                selectedPlaces.map((place, idx) => (
                  <SpotItem
                    key={place.id}
                    place={place}
                    idx={idx}
                    leg={explored ? routeInfo?.legs?.[idx] : null}
                    onRemove={removePlace}
                    onDragStart={(e, i) => {
                      dragIdx.current = i;
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e, dropIdx) => {
                      const from = dragIdx.current;
                      if (from === null || from === dropIdx) return;
                      const next = [...selectedPlaces];
                      const [moved] = next.splice(from, 1);
                      next.splice(dropIdx, 0, moved);
                      reorderPlaces(next);
                      setExplored(false);
                    }}
                    onStreetView={openStreetView}
                  />
                ))
              ) : (
                <div className={styles.empty}>장소를 추가해주세요.</div>
              )}
            </div>

            <div className={styles.panelFooter}>
              <button className={explored ? styles.saveBtn : styles.exploreBtn} onClick={explored ? () => setShowModal(true) : handleExplore}>
                {explored ? '경로 저장하기' : '경로 탐색'}
              </button>
              {selectedPlaces.length > 0 && (
                <button className={styles.clearBtn} onClick={clearMap}>
                  초기화
                </button>
              )}
            </div>
          </div>
        }>
        {/* children 영역: 전역 사이드바와 동일한 레벨 혹은 
        그보다 위여야 하는 모달/알림 배치 
      */}
        {showModal && (
          <SaveModal
            title={routeTitle}
            setTitle={setRouteTitle}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            onConfirm={handleConfirmSave}
            onCancel={() => setShowModal(false)}
            isSaving={isSaving}
          />
        )}
      </MainLayout>
    </APIProvider>
  );
}

// 서브: 드래그 가능한 장소 아이템
function SpotItem({ place, idx, leg, onRemove, onDragStart, onDragOver, onDrop, onStreetView }) {
  const [over, setOver] = useState(false);

  return (
    <div
      className={`${styles.spotItem} ${over ? styles.spotItemOver : ''}`}
      gestureHandling={'cooperative'}
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => {
        onDragOver(e);
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        onDrop(e, idx);
        setOver(false);
      }}>
      <span className={styles.spotNum}>{idx + 1}</span>
      <span className={styles.dragHandle}>
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="2.5" cy="2.5" r="1.5" />
          <circle cx="7.5" cy="2.5" r="1.5" />
          <circle cx="2.5" cy="7" r="1.5" />
          <circle cx="7.5" cy="7" r="1.5" />
          <circle cx="2.5" cy="11.5" r="1.5" />
          <circle cx="7.5" cy="11.5" r="1.5" />
        </svg>
      </span>
      <div className={styles.spotInfo}>
        {/* Spot.name */}
        <span className={styles.spotTitle}>{place.title}</span>
        {/* Artwork.title */}
        {place.workName && <span className={styles.spotWork}>{place.workName}</span>}
        {/* DirectionsService leg (DB 저장 안함, 표시 전용) */}
        {leg && (
          <span className={styles.spotLeg}>
            → {leg.distance.text} · {leg.duration.text}
          </span>
        )}
      </div>
      {/* 거리뷰 (후순위 기능) */}
      <button className={styles.svBtn} title="거리뷰 열기" onClick={() => onStreetView(place.position.lat, place.position.lng)}>
        🔭
      </button>
      <button className={styles.removeBtn} onClick={() => onRemove(place.id)}>
        ×
      </button>
    </div>
  );
}
