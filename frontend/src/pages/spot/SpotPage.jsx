/**
 * @file SpotPage.jsx
 * @description 루트 생성 페이지 (/spot)
 *
 * [레이아웃]
 *   - 좌측: SpotSidePanel (북마크 탭 / 지도 검색 탭)
 *   - 중앙: 지도 (MapCore) — DUMMY_PILGRIMAGE_SITES 핀 표시, 클릭 → 루트 추가
 *   - 우측 하단 플로팅: RoutePanel (담긴 장소 목록, 드래그 순서, 초기화/저장)
 *   - NavBar 우측: "루트 공유" 버튼 → RouteShareSidebar (전역 Sidebar와 별개)
 *
 * [저장 흐름]
 *   RoutePanel 저장 클릭 → SaveModal(루트명 입력) → 확인
 *   → 좌측 사이드바 폴더 목록에 추가 + 저장 완료 토스트
 *   → clearMap() (선택 장소 초기화)
 *
 * [백엔드 연동 포인트]
 *   handleConfirmSave: POST /api/v1/routes 주석 참고
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainLayout from '@/components/layout/MainLayout';
import MapCore from '@/components/map/MapCore';
import SpotSidePanel from '@/components/spot/SpotSidePanel';
import RoutePanel from '@/components/spot/RouteListSelector';
// import RouteShareSidebar from '@/components/spot/RouteShareSidebar';
import { useMapStore } from '@/stores/useMapStore';
import { DEFAULT_CENTER, MAX_SPOT_COUNT } from '@/constants/mapConstants';
import { DUMMY_PILGRIMAGE_SITES, DUMMY_SPOT_FOLDERS, DEFAULT_LOCATION } from '@/data/dummyData';
import styles from '@/styles/SpotPage.module.css';

export default function SpotPage() {
  const [center, setCenter] = useState(DEFAULT_LOCATION ?? DEFAULT_CENTER);

  // 저장된 루트 폴더 목록 (좌측 사이드 패널에 표시)
  // TODO: useEffect + GET /api/v1/routes/my 로 초기화
  const [savedRoutes, setSavedRoutes] = useState(DUMMY_SPOT_FOLDERS);

  // 공유 사이드바
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState('');

  // 저장 모달
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');

  // 저장 완료 토스트
  const [showToast, setShowToast] = useState(false);

  const { selectedPlaces, addPlace, clearMap } = useMapStore();

  // 지도에 표시할 모든 핀
  const [allPins] = useState(DUMMY_PILGRIMAGE_SITES);

  // 이미 루트에 담긴 핀 ID 집합 (중복 추가 방지)
  const selectedIds = useMemo(() => new Set(selectedPlaces.map((p) => p.id)), [selectedPlaces]);

  // 지도 카메라 이동 (hover preview, 검색 결과 선택 등)
  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  // 루트에 장소 추가
  const handleAddToRoute = useCallback(
    (spot) => {
      if (selectedPlaces.length >= MAX_SPOT_COUNT) {
        alert(`최대 ${MAX_SPOT_COUNT}개까지 추가할 수 있습니다.`);
        return;
      }
      if (selectedIds.has(spot.id)) return; // 중복 방지
      addPlace(spot);
    },
    [selectedPlaces.length, selectedIds, addPlace],
  );

  // 지도 핀 클릭 → 루트 추가 + 카메라 이동
  const handlePinClick = useCallback(
    (pin) => {
      if (!pin) return;
      handleAddToRoute(pin);
      setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
    },
    [handleAddToRoute],
  );

  // 저장 버튼 클릭 → 모달 열기
  const handleSaveClick = useCallback(() => {
    if (selectedPlaces.length < 1) return;
    setRouteTitle(`루트 ${savedRoutes.length + 1}`);
    setShowSaveModal(true);
  }, [selectedPlaces.length, savedRoutes.length]);

  // 저장 확정
  const handleConfirmSave = useCallback(() => {
    const title = routeTitle.trim() || `루트 ${savedRoutes.length + 1}`;

    /*
     * TODO: 백엔드 연동 시 아래 주석 해제
     * fetch('/api/v1/routes', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
     *   body: JSON.stringify({
     *     title,
     *     isPublic: false,
     *     spotIds: selectedPlaces.map((p) => Number(p.id)), // visit_order = 배열 순서
     *   }),
     * })
     *   .then((r) => r.json())
     *   .then((data) => {
     *     setSavedRoutes((prev) => [
     *       ...prev,
     *       { id: String(data.routeId), name: data.title, count: selectedPlaces.length },
     *     ]);
     *   });
     */

    // 더미: 좌측 사이드바 폴더 목록에 즉시 추가
    setSavedRoutes((prev) => [...prev, { id: `r${Date.now()}`, name: title, count: selectedPlaces.length }]);
    setLastSavedTitle(title);
    setShowSaveModal(false);
    setRouteTitle('');
    clearMap();

    // 저장 완료 토스트
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [routeTitle, savedRoutes.length, selectedPlaces, clearMap]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MainLayout
        isMapPage={true}
        activeMenuKey="spot"
        // "루트 공유" 버튼 — NavBar 우측에 주입 (전역 Sidebar와 무관한 별도 패널 오픈)
        navRightAction={
          <button className={styles.shareNavBtn} onClick={() => setIsShareOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            루트 공유
          </button>
        }
        // 좌측 패널 — 북마크 탭 / 지도 검색 탭
        leftSidebar={<SpotSidePanel savedRoutes={savedRoutes} onAddToRoute={handleAddToRoute} onPreview={handlePreview} center={center} />}
        // 지도 + RoutePanel 플로팅 패널
        mapComponent={
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapCore
              pins={allPins}
              selectedPinId={null}
              center={center}
              onPinClick={handlePinClick}
              // 핀 클릭 = 루트 추가이므로 PinOverlay 팝업 없이 핀 크기 강조만
              disableOverlay={true}
            />
            {/* 루트에 담긴 장소 플로팅 패널 (absolute bottom-right) */}
            <RoutePanel onSave={handleSaveClick} />
          </div>
        }
      />

      {/* 저장 확인 모달 */}
      {showSaveModal && (
        <div className={styles.saveModal}>
          <div className={styles.saveModalBackdrop} onClick={() => setShowSaveModal(false)} />
          <div className={styles.saveModalBox}>
            <p className={styles.saveModalTitle}>루트 저장</p>
            <input
              className={styles.saveModalInput}
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmSave()}
              placeholder="루트 이름을 입력하세요"
              autoFocus
            />
            <div className={styles.saveModalActions}>
              <button className={styles.saveModalCancel} onClick={() => setShowSaveModal(false)}>
                취소
              </button>
              <button className={styles.saveModalConfirm} onClick={handleConfirmSave}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장 완료 토스트 */}
      {showToast && <div className={styles.toast}>✅ &nbsp;&apos;{lastSavedTitle}&apos; 루트가 저장되었습니다!</div>}
    </APIProvider>
  );
}
