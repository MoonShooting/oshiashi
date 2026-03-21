/**
 * @file SpotPage.jsx
 * @description 루트 생성 페이지 (/spot)
 * 좌측: 장소 선택/북마크 (SpotSidePanel)
 * 중앙: 지도 (MapCore)
      - 기본 핀 / 선택 핀 / 경로선
      - 지도 클릭 시 주소 팝업 (ClickPopup)
 * 우하단: 루트 리스트 + 저장 (RouteListSelector)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { APIProvider, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import OrderPin from '@/components/map/OrderPin';
import SpotDirections from '@/components/spot/SpotDirections';
import MapSearchBar from '@/components/map/MapSearchBar';
import SpotSidePanel from '@/components/spot/SpotSidePanel';
import RouteListSelector from '@/components/spot/RouteListSelector';
import { useMapStore } from '@/stores/useMapStore';
import { DEFAULT_CENTER, MAX_SPOT_COUNT, PIN_COLOR } from '@/constants/mapConstants';
import { DUMMY_PILGRIMAGE_SITES, DUMMY_SPOT_FOLDERS, DEFAULT_LOCATION } from '@/data/dummyData';
import styles from '@/styles/SpotPage.module.css';

/**
 * 지도 클릭 팝업 — 클릭 좌표의 주소를 Geocoder로 변환해 보여주고 루트 추가 버튼 제공
 * AdvancedMarker를 쓰므로 <Map> innerContent 슬롯(APIProvider 내부)에서 렌더링되어야 함
 */
function ClickPopup({ pos, onAdd, onClose }) {
  const geocodingLib = useMapsLibrary('geocoding');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!geocodingLib || !pos) return;
    setAddress('');
    setLoading(true);
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      setLoading(false);
      setAddress(status === 'OK' && results[0] ? results[0].formatted_address : `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
    });
  }, [geocodingLib, pos]);

  if (!pos) return null;

  return (
    <AdvancedMarker position={pos} zIndex={200}>
      <div className={styles.clickPopup}>
        <button className={styles.clickPopupClose} onClick={onClose}>
          ×
        </button>
        <p className={styles.clickPopupAddr}>{loading ? '주소 조회 중...' : address}</p>
        <button className={styles.clickPopupAdd} disabled={loading} onClick={() => onAdd({ pos, address })}>
          + 루트에 추가
        </button>
      </div>
    </AdvancedMarker>
  );
}

export default function SpotPage() {
  const [center, setCenter] = useState(DEFAULT_LOCATION ?? DEFAULT_CENTER);
  const [durations, setDurations] = useState(null);
  const [clickedPos, setClickedPos] = useState(null);

  // TODO: GET /api/v1/routes/my 로 초기화
  const [savedRoutes, setSavedRoutes] = useState(DUMMY_SPOT_FOLDERS);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState('');

  const { selectedPlaces, addPlace, clearMap } = useMapStore();
  const [allPins] = useState(DUMMY_PILGRIMAGE_SITES);

  const selectedIds = useMemo(() => new Set(selectedPlaces.map((p) => p.id)), [selectedPlaces]);
  // 루트에 담긴 핀은 CustomPin에서 제외 → 번호 OrderPin으로 대체
  const unselectedPins = useMemo(() => allPins.filter((p) => !selectedIds.has(p.id)), [allPins, selectedIds]);

  const handlePreview = useCallback((loc) => {
    if (!loc || loc.lat == null) return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  const handleAddToRoute = useCallback(
    (spot) => {
      if (selectedPlaces.length >= MAX_SPOT_COUNT) {
        alert(`최대 ${MAX_SPOT_COUNT}개까지 추가할 수 있습니다.`);
        return;
      }
      if (spot.id && selectedIds.has(spot.id)) return;
      addPlace(spot);
      setClickedPos(null);
    },
    [selectedPlaces.length, selectedIds, addPlace],
  );

  // 기존 핀(CustomPin) 클릭 → 루트 추가 + 카메라 이동
  const handlePinClick = useCallback(
    (pin) => {
      if (!pin) {
        setClickedPos(null);
        return;
      }
      handleAddToRoute(pin);
      setCenter({ lat: Number(pin.position.lat), lng: Number(pin.position.lng) });
    },
    [handleAddToRoute],
  );

  // 빈 지도 클릭 → 팝업 표시 (기존 팝업 있으면 교체)
  const handleMapClick = useCallback((pos) => {
    setClickedPos(pos);
    setCenter(pos);
  }, []);

  // ClickPopup "추가" 버튼 → 루트에 등록
  const handlePopupAdd = useCallback(
    ({ pos, address }) => {
      handleAddToRoute({
        id: `click-${Date.now()}`,
        title: address || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
        name: address || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
        workName: '지도에서 추가',
        color: '#4b5563',
        position: pos,
      });
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
    // TODO: POST /api/v1/routes { title, isPublic: false, spotIds: selectedPlaces.map(p=>Number(p.id)) }
    setSavedRoutes((prev) => [...prev, { id: `r${Date.now()}`, name: title, count: selectedPlaces.length }]);
    setLastSavedTitle(title);
    setShowSaveModal(false);
    setRouteTitle('');
    clearMap();
    setDurations(null);
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
            <MapCore
              pins={unselectedPins}
              selectedPinId={null}
              center={center}
              onPinClick={handlePinClick}
              onMapClick={handleMapClick}
              disableMapClick={false}
              searchBar={
                <MapSearchBar
                  onSelectPlace={(loc) => {
                    setCenter({ lat: loc.lat, lng: loc.lng });
                    setClickedPos(null);
                  }}
                  onPreview={handlePreview}
                  placeholder="장소 검색..."
                  className={styles.spotSearchBar}
                  center={center}
                />
              }
              innerContent={
                <>
                  <SpotDirections onDurationsChange={setDurations} />

                  {selectedPlaces.map((place, idx) => (
                    <AdvancedMarker key={place.id} position={place.position} zIndex={100 + idx}>
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* 장소명 툴팁 */}
                        <div className={styles.pinLabel}>{place.title || place.name}</div>
                        <OrderPin num={idx + 1} colors={PIN_COLOR.SELECTED} isSelected={true} />
                      </div>
                    </AdvancedMarker>
                  ))}

                  {/* 지도 클릭 → 주소 팝업 */}
                  <ClickPopup pos={clickedPos} onAdd={handlePopupAdd} onClose={() => setClickedPos(null)} />
                </>
              }
            />

            <RouteListSelector onSave={handleSaveClick} durations={durations} />
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
