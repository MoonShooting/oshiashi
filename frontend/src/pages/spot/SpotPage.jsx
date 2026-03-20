/**
 * @file SpotPage.jsx
 * @description 루트 생성 페이지 (/spot)
 * 좌측: SpotSidePanel (북마크/지도검색 탭)
 * 중앙: MapCore (성지 핀 표시, 클릭 시 루트 추가) + SpotDirections (경로선)
 * 우측 하단 플로팅: RoutePanel (장소 목록, 드래그 순서, 초기화/저장)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import SpotDirections from '@/components/spot/SpotDirections';
import SpotSidePanel from '@/components/spot/SpotSidePanel';
import RoutePanel from '@/components/spot/RouteListSelector';
import { useMapStore } from '@/stores/useMapStore';
import { DEFAULT_CENTER, MAX_SPOT_COUNT } from '@/constants/mapConstants';
import { DUMMY_PILGRIMAGE_SITES, DUMMY_SPOT_FOLDERS, DEFAULT_LOCATION } from '@/data/dummyData';
import styles from '@/styles/SpotPage.module.css';

export default function SpotPage() {
  const [center, setCenter] = useState(DEFAULT_LOCATION ?? DEFAULT_CENTER);

  // TODO: GET /api/v1/routes/my 로 초기화
  const [savedRoutes, setSavedRoutes] = useState(DUMMY_SPOT_FOLDERS);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState('');

  const { selectedPlaces, addPlace, clearMap } = useMapStore();
  const [allPins] = useState(DUMMY_PILGRIMAGE_SITES);
  const selectedIds = useMemo(() => new Set(selectedPlaces.map((p) => p.id)), [selectedPlaces]);

  const handlePreview = useCallback((loc) => {
    if (!loc || typeof loc.lat === 'undefined') return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  const handleAddToRoute = useCallback(
    (spot) => {
      if (selectedPlaces.length >= MAX_SPOT_COUNT) {
        alert(`최대 ${MAX_SPOT_COUNT}개까지 추가할 수 있습니다.`);
        return;
      }
      if (selectedIds.has(spot.id)) return;
      addPlace(spot);
    },
    [selectedPlaces.length, selectedIds, addPlace],
  );

  const handlePinClick = useCallback(
    (pin) => {
      if (!pin) return;
      handleAddToRoute(pin);
      setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
    },
    [handleAddToRoute],
  );

  const handleSaveClick = useCallback(() => {
    if (selectedPlaces.length < 1) return;
    setRouteTitle(`루트 ${savedRoutes.length + 1}`);
    setShowSaveModal(true);
  }, [selectedPlaces.length, savedRoutes.length]);

  const handleConfirmSave = useCallback(() => {
    const title = routeTitle.trim() || `루트 ${savedRoutes.length + 1}`;

    // TODO: POST /api/v1/routes
    // body: { title, isPublic: false, spotIds: selectedPlaces.map(p => Number(p.id)) }

    setSavedRoutes((prev) => [...prev, { id: `r${Date.now()}`, name: title, count: selectedPlaces.length }]);
    setLastSavedTitle(title);
    setShowSaveModal(false);
    setRouteTitle('');
    clearMap();

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [routeTitle, savedRoutes.length, selectedPlaces, clearMap]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MapLayout
        isMapPage={true}
        activeMenuKey="spot"
        leftSidebar={<SpotSidePanel savedRoutes={savedRoutes} onAddToRoute={handleAddToRoute} onPreview={handlePreview} center={center} />}
        mapComponent={
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapCore pins={allPins} selectedPinId={null} center={center} onPinClick={handlePinClick} disableMapClick={false}>
              {/* 경로선 렌더러: <Map> 컨텍스트 내부에서 동작 */}
              <SpotDirections />
            </MapCore>
            <RoutePanel onSave={handleSaveClick} />
          </div>
        }
      />

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

      {showToast && <div className={styles.toast}>✅ &nbsp;&apos;{lastSavedTitle}&apos; 루트가 저장되었습니다!</div>}
    </APIProvider>
  );
}
