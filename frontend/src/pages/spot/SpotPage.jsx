/**
 * @file SpotPage.jsx
 * @description 루트 생성 페이지 (/spot)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import OrderPin from '@/components/map/OrderPin';
import SpotDirections from '@/components/spot/SpotDirections';
import SpotSearchBar from '@/components/spot/SpotSearchBar';
import SpotSidePanel from '@/components/spot/SpotSidePanel';
import RouteListSelector from '@/components/spot/RouteListSelector';
import useSpotRouteSaveModal from '@/pages/spot/hooks/useSpotRouteSaveModal';
import useSpotRouteSidebar from '@/pages/spot/hooks/useSpotRouteSidebar';
import { useMapStore } from '@/stores/useMapStore';
import { DEFAULT_CENTER, MAX_SPOT_COUNT, PIN_COLOR } from '@/constants/mapConstants';
import { DUMMY_PILGRIMAGE_SITES, DEFAULT_LOCATION } from '@/data/dummyData';
import styles from '@/styles/SpotPage.module.css';

function RouteDialogModal({ dialog, onCancel, onConfirm }) {
  const inputRef = useRef(null);
  const [draftValue, setDraftValue] = useState('');

  useEffect(() => {
    if (!dialog) return;
    setDraftValue(dialog.initialValue ?? '');
  }, [dialog]);

  useEffect(() => {
    if (!dialog || dialog.type !== 'prompt') return;
    inputRef.current?.focus();
    inputRef.current?.select?.();
  }, [dialog]);

  if (!dialog) return null;

  return (
    <div className={styles.saveModal}>
      <div className={styles.saveModalBackdrop} onClick={onCancel} />
      <div className={styles.saveModalBox} onClick={(event) => event.stopPropagation()}>
        <p className={styles.saveModalTitle}>{dialog.title}</p>
        {dialog.message ? <p className={styles.routeDialogMessage}>{dialog.message}</p> : null}

        {dialog.type === 'prompt' ? (
          <input
            ref={inputRef}
            className={styles.saveModalInput}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={dialog.inputPlaceholder ?? '입력해 주세요'}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm(draftValue);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                onCancel();
              }
            }}
          />
        ) : null}

        <div className={styles.saveModalActions}>
          {dialog.cancelText ? (
            <button className={styles.saveModalCancel} type="button" onClick={onCancel}>
              {dialog.cancelText}
            </button>
          ) : null}
          <button
            className={styles.saveModalConfirm}
            type="button"
            onClick={() => onConfirm(dialog.type === 'prompt' ? draftValue : true)}>
            {dialog.confirmText ?? '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 지도 클릭으로 임시 장소를 추가할 수 있는 팝업.
 * Geocoding 대신 Places Service를 사용하여 상호명을 우선적으로 조회합니다.
 */
function ClickPopup({ pos, onAdd, onClose }) {
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placesLib || !geocodingLib || !pos) return;

    setAddress('');
    setLoading(true);

    const dummyElement = document.createElement('div');
    const placesService = new placesLib.PlacesService(dummyElement);
    const geocoder = new geocodingLib.Geocoder();

    geocoder.geocode({ location: pos }, (geoResults, geoStatus) => {
      let fullAddress = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
      let placeId = null;
      let meaningfulName = null;

      if (geoStatus === 'OK' && geoResults[0]) {
        const result = geoResults[0];

        fullAddress = result.formatted_address.replace(/^(대한민국\s|일본\s)/, '').trim();

        placeId = result.place_id;

        // ✅ 타입 기반 의미있는 이름 추출
        for (const r of geoResults) {
          if (
            r.types.includes('premise') || // 건물
            r.types.includes('point_of_interest') || // 랜드마크
            r.types.includes('establishment')
          ) {
            meaningfulName = r.address_components?.[0]?.long_name;
            break;
          }
        }
      }

      // -----------------------------
      // 1️⃣ place_id 기반 상세 조회
      // -----------------------------
      if (placeId) {
        placesService.getDetails(
          {
            placeId,
            fields: ['name', 'types'],
          },
          (placeResult, status) => {
            const broadPlaceTypes = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'political'];
            const isBroadType = placeResult?.types?.some((t) => broadPlaceTypes.includes(t));
            if (
              status === placesLib.PlacesServiceStatus.OK &&
              placeResult?.name &&
              !isTooBroad(placeResult.name) &&
              !isBroadType
            ) {
              setAddress(placeResult.name);
              setLoading(false);
            } else {
              fallback();
            }
          },
        );
      } else {
        fallback();
      }

      // -----------------------------
      // 2️⃣ fallback 처리
      // -----------------------------
      function fallback() {
        // ✅ geocoding에서 의미있는 이름 있으면 사용
        if (meaningfulName && !isTooBroad(meaningfulName)) {
          setAddress(meaningfulName);
          setLoading(false);
          return;
        }

        // -----------------------------
        // 3️⃣ nearbySearch (보조)
        // -----------------------------
        const request = {
          location: pos,
          radius: 50,
        };

        placesService.nearbySearch(request, (results, status) => {
          if (status === placesLib.PlacesServiceStatus.OK && results.length > 0 && !isTooBroad(results[0].name)) {
            setAddress(results[0].name);
          } else {
            // -----------------------------
            // 4️⃣ 행정구역 fallback
            // -----------------------------
            const area = extractArea(geoResults);
            if (area) {
              setAddress(area);
            } else {
              // -----------------------------
              // 5️⃣ 최종 fallback
              // -----------------------------
              setAddress(fullAddress);
            }
          }
          setLoading(false);
        });
      }

      // -----------------------------
      // 유틸 함수
      // -----------------------------
      function isTooBroad(name) {
        return name.includes('대한민국') || name.includes('한국') || name.includes('일본') || name.length < 2;
      }

      function extractArea(results) {
        if (!results) return null;

        for (const r of results) {
          for (const comp of r.address_components || []) {
            if (
              comp.types.includes('sublocality') || // 동
              comp.types.includes('locality') || // 시
              comp.types.includes('administrative_area_level_2')
            ) {
              return comp.long_name;
            }
          }
        }
        return null;
      }
    });
  }, [placesLib, geocodingLib, pos]);

  if (!pos) return null;

  return (
    <AdvancedMarker position={pos} zIndex={200}>
      <div className={styles.clickPopup}>
        {/* X 버튼 클릭 이벤트 버블링 방지 유지 */}
        <button
          className={styles.clickPopupClose}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}>
          ×
        </button>

        {/* 상세 풀 주소가 텍스트로 나타납니다 */}
        <p className={styles.clickPopupAddr}>{loading ? '상세 위치 확인 중...' : address}</p>

        <button
          className={styles.clickPopupAdd}
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            onAdd({ pos, address });
          }}>
          + 루트에 추가
        </button>
      </div>
    </AdvancedMarker>
  );
}

export default function SpotPage() {
  // 지도/페이지 공통 표시 상태
  const [center, setCenter] = useState(DEFAULT_LOCATION ?? DEFAULT_CENTER);
  const [durations, setDurations] = useState(null);
  const [clickedPos, setClickedPos] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [routeDialog, setRouteDialog] = useState(null);
  const toastTimerRef = useRef(null);
  const routeDialogResolverRef = useRef(null);

  const { selectedPlaces, addPlace, clearMap, replacePlaces } = useMapStore();
  const selectedIds = useMemo(() => new Set(selectedPlaces.map((place) => place.id)), [selectedPlaces]);
  const unselectedPins = useMemo(() => DUMMY_PILGRIMAGE_SITES.filter((pin) => !selectedIds.has(pin.id)), [selectedIds]);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const closeRouteDialog = useCallback((result) => {
    const resolver = routeDialogResolverRef.current;
    routeDialogResolverRef.current = null;
    setRouteDialog(null);
    resolver?.(result);
  }, []);

  const openRouteDialog = useCallback((dialogConfig) => {
    return new Promise((resolve) => {
      // 브라우저 기본 alert/confirm/prompt 대신 Spot 페이지의 기존 저장 모달 스타일을 재사용한다.
      // 동작 의미는 그대로 두고, 시각적 경험만 프로젝트 공통 톤으로 통일하는 목적이다.
      routeDialogResolverRef.current = resolve;
      setRouteDialog(dialogConfig);
    });
  }, []);

  // 사이드패널/루트 목록 액션은 전용 훅으로 분리하여 SpotPage를 "조립 컴포넌트"로 유지한다.
  const sidebar = useSpotRouteSidebar({
    replacePlaces,
    clearMap,
    setCenter,
    showToast,
    openRouteDialog,
  });

  const saveModal = useSpotRouteSaveModal({
    selectedPlaces,
    myRoutesCount: sidebar.myRoutes.length,
    routeSaveContext: sidebar.routeSaveContext,
    onSaved: async (saved, title) => {
      // 저장 후의 화면 후처리(목록 새로고침/선택 해제/맵 초기화)는 페이지 컨텍스트에서만 알 수 있어
      // 훅이 아닌 SpotPage에서 수행한다.
      await sidebar.refreshSidebarRoutes();
      sidebar.clearRouteSaveContext();
      sidebar.resetRoutePreview();
      clearMap();
      setDurations(null);
      showToast(`'${saved?.title ?? title}' 루트가 저장되었습니다.`);
    },
  });

  useEffect(() => {
    return () => {
      // 루트 생성 페이지는 "임시 편집 화면" 성격이 강하므로,
      // 다른 페이지로 나갈 때 이전에 보던 루트/선택 장소를 남기지 않는다.
      // 특히 selectedPlaces는 전역 store라서 정리하지 않으면 재진입 시
      // 예전에 선택했던 루트가 그대로 복원된 것처럼 보일 수 있다.
      clearMap();
    };
  }, [clearMap]);

  const handlePreview = useCallback((loc) => {
    if (!loc || loc.lat == null) return;
    setCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
  }, []);

  const handleAddToRoute = useCallback(
    (spot) => {
      if (sidebar.isRoutePreviewLocked) {
        // 저장된 route를 그냥 보고 있는 상태에서는
        // selectedPlaces를 수정해 버리면 "조회용 미리보기"와 "편집 중 route"가 섞여 버립니다.
        // 그래서 수정 모드로 전환하기 전에는 추가를 막습니다.
        void openRouteDialog({
          type: 'alert',
          title: '읽기 전용 루트',
          message: '저장된 루트는 읽기 전용입니다. 수정 버튼을 눌러 편집해 주세요.',
          confirmText: '확인',
        });
        return;
      }
      if (selectedPlaces.length >= MAX_SPOT_COUNT) {
        void openRouteDialog({
          type: 'alert',
          title: '추가 제한',
          message: `최대 ${MAX_SPOT_COUNT}개까지 추가할 수 있습니다.`,
          confirmText: '확인',
        });
        return;
      }
      // 동일 spot 중복 추가는 막고, 나머지 저장 가능 판정은 백엔드에 위임한다.
      if (spot.id && selectedIds.has(spot.id)) return;

      addPlace(spot);
      setClickedPos(null);
    },
    [sidebar.isRoutePreviewLocked, selectedPlaces.length, selectedIds, addPlace],
  );

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

  const handleMapClick = useCallback((pos) => {
    setClickedPos(pos);
    setCenter(pos);
  }, []);

  const handlePopupAdd = useCallback(
    ({ pos, address }) => {
      // 지도 클릭 추가 항목은 아직 DB spotId가 없다.
      // 이 상태 그대로 저장 API로 전달하고, 실제 spot 생성/검증은 백엔드가 수행한다.
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

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <MapLayout
        isMapPage={true}
        activeMenuKey="spot"
        leftSidebar={
          <SpotSidePanel
            myRoutes={sidebar.myRoutes}
            bookmarkedRoutes={sidebar.bookmarkedRoutes}
            visibleSpots={sidebar.visibleRouteSpots}
            activeRouteKey={sidebar.activeSidebarRouteKey}
            sidebarError={sidebar.sidebarError}
            sidebarIssues={sidebar.sidebarIssues}
            onSelectRoute={sidebar.handleSelectSidebarRoute}
            onRouteAction={sidebar.handleRouteAction}
            onAddToRoute={handleAddToRoute}
            onPreview={handlePreview}
            center={center}
            onEnterMapSearch={sidebar.startMapSearchMode}
          />
        }
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
                <SpotSearchBar
                  onSelectPlace={(loc) => {
                    setCenter({ lat: loc.lat, lng: loc.lng });
                    setClickedPos(null);
                  }}
                  onPreview={handlePreview}
                  placeholder="장소 검색..."
                  className={styles.spotSearchBar}
                />
              }
              innerContent={
                <>
                  <SpotDirections onDurationsChange={setDurations} />

                  {selectedPlaces.map((place, idx) => (
                    <AdvancedMarker key={place.id} position={place.position} zIndex={100 + idx}>
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={styles.pinLabel}>{place.title || place.name}</div>
                        <OrderPin num={idx + 1} mediaType={place.mediaType} isSelected={true} />
                      </div>
                    </AdvancedMarker>
                  ))}

                  <ClickPopup pos={clickedPos} onAdd={handlePopupAdd} onClose={() => setClickedPos(null)} />
                </>
              }
            />

            <RouteListSelector
              onSave={saveModal.openSaveModal}
              onReset={() => {
                // 우측 패널 초기화는 "현재 편집 컨텍스트 종료" 의미이므로
                // routeSaveContext와 route preview를 함께 해제한다.
                sidebar.clearRouteSaveContext();
                sidebar.resetRoutePreview();
              }}
              isLocked={sidebar.isRoutePreviewLocked}
              lockMessage={
                sidebar.isRoutePreviewLocked
                  ? `'${sidebar.activeSidebarRoute?.title || '선택한 루트'}'는 현재 읽기 전용입니다. 수정 버튼을 눌러 편집을 시작해 주세요.`
                  : ''
              }
              durations={durations}
              isEditMode={sidebar.activeSidebarRoute != null}
            />
          </div>
        }
      />

      {saveModal.showSaveModal ? (
        <div className={styles.saveModal}>
          <div className={styles.saveModalBackdrop} onClick={saveModal.closeSaveModal} />
          <div className={styles.saveModalBox} ref={saveModal.saveModalRef}>
            <p className={styles.saveModalTitle}>루트 저장</p>
            <input
              className={styles.saveModalInput}
              value={saveModal.routeTitle}
              onChange={(event) => saveModal.setRouteTitle(event.target.value)}
              onKeyDown={(event) => {
                // 첫 줄(루트 이름) Enter 입력 시 두 번째 줄(태그 검색)로 이동.
                if (event.key === 'Enter') {
                  event.preventDefault();
                  saveModal.tagInputRef.current?.focus();
                }
              }}
              placeholder="루트 이름을 입력하세요"
              autoFocus
            />

            <input
              ref={saveModal.tagInputRef}
              className={styles.saveModalInput}
              value={saveModal.routeTagQuery}
              onChange={(event) => saveModal.handleTagInputChange(event.target.value)}
              onFocus={saveModal.handleTagInputFocus}
              onCompositionStart={() => {
                saveModal.isComposing.current = true;
              }}
              onCompositionEnd={(event) => {
                saveModal.isComposing.current = false;
                saveModal.handleTagInputChange(event.target.value);
              }}
              onKeyDown={(event) => {
                if (saveModal.isComposing.current) return;

                if (event.key === 'ArrowDown' && saveModal.isTagDropdownOpen) {
                  event.preventDefault();
                  saveModal.setActiveTagIndex((prev) => Math.min(prev + 1, saveModal.tagRecommendations.length - 1));
                } else if (event.key === 'ArrowUp' && saveModal.isTagDropdownOpen) {
                  event.preventDefault();
                  saveModal.setActiveTagIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === 'Enter') {
                  // 추천 항목이 있으면 Enter로 선택 확정.
                  // 확정된 태그(selectedArtworkTag)가 없으면 저장 버튼은 비활성 상태를 유지한다.
                  event.preventDefault();
                  if (saveModal.isTagDropdownOpen && saveModal.activeTagIndex >= 0) {
                    saveModal.handlePickArtworkTag(saveModal.tagRecommendations[saveModal.activeTagIndex]);
                  } else if (saveModal.isTagDropdownOpen && saveModal.tagRecommendations.length > 0) {
                    saveModal.handlePickArtworkTag(saveModal.tagRecommendations[0]);
                  }
                } else if (event.key === 'Escape') {
                  saveModal.setIsTagDropdownOpen(false);
                }
              }}
              placeholder="작품 태그를 검색하세요"
            />

            {saveModal.isTagDropdownOpen && saveModal.tagRecommendations.length > 0 ? (
              <ul className={styles.tagAutocompleteList}>
                {saveModal.tagRecommendations.map((candidate, index) => {
                  const label = candidate.tagName ?? candidate.title ?? '';
                  return (
                    <li
                      key={`${candidate.source}-${candidate.artworkId ?? label}-${index}`}
                      className={
                        index === saveModal.activeTagIndex
                          ? `${styles.tagAutocompleteItem} ${styles.tagAutocompleteItemActive}`
                          : styles.tagAutocompleteItem
                      }
                      onMouseEnter={() => saveModal.setActiveTagIndex(index)}
                      onClick={() => saveModal.handlePickArtworkTag(candidate)}>
                      {label}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <p className={styles.saveModalHint}>게시물의 태그는 여기서 선택한 작품 태그로 고정됩니다.</p>
            {saveModal.saveModalError ? <p className={styles.saveModalError}>{saveModal.saveModalError}</p> : null}

            <div className={styles.saveModalActions}>
              <button className={styles.saveModalCancel} onClick={saveModal.closeSaveModal}>
                취소
              </button>
              <button
                className={styles.saveModalConfirm}
                type="button"
                onClick={saveModal.handleConfirmSave}
                disabled={saveModal.isSearchingTags || saveModal.isSavingRoute || !saveModal.routeTitle.trim() || !saveModal.selectedArtworkTag}>
                {saveModal.isSavingRoute ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <RouteDialogModal dialog={routeDialog} onCancel={() => closeRouteDialog(null)} onConfirm={closeRouteDialog} />

      {toastMessage ? <div className={styles.toast}>{toastMessage}</div> : null}
    </APIProvider>
  );
}
