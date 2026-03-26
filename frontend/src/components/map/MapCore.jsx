/**
 * @file MapCore.jsx
 * @description 공통 지도 베이스 컴포넌트
 *
 * [pins 데이터 기준] MapPlaceResponse
 * - placeId   : 마커 key, selectedPinId 비교 기준
 * - latitude  : 위도 (Double)
 * - longitude : 경도 (Double)
 * - mediaType : 작품 타입명 (DB 한국어값)
 *
 * @param {MapPlaceResponse[]} pins          - 지도에 표시할 장소 목록
 * @param {number|null}        selectedPinId - 선택된 장소의 placeId
 * @param {{ lat, lng }}       center        - 지도 중심 좌표
 * @param {boolean}            disableMapClick
 * @param {ReactNode}          innerContent  - Map 내부 주입 슬롯
 * @param {ReactNode}          searchBar     - Map 바깥 오버레이
 * @param {(center: { lat: number, lng: number }) => void} [onCameraIdle] - 지도 카메라가 멈출 때(드래그·줌 후) 현재 중심 좌표 전달 (SpotPage 등에서는 미전달)
 * @param {(pos: { lat: number, lng: number }) => void} [onMapClick] - SpotPage: 빈 지도 클릭 시 좌표 전달
 */
import React, { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import CustomPin from './CustomPin';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_ID } from '@/constants/mapConstants';
import styles from '@/styles/MapLayout.module.css';

function MapPanController({ center }) {
  const map = useMap();
  const prevCenter = useRef(null);

  useEffect(() => {
    if (!map || !center) return;
    const prev = prevCenter.current;
    if (prev && prev.lat === center.lat && prev.lng === center.lng) return;
    prevCenter.current = center;
    map.panTo({ lat: center.lat, lng: center.lng });
  }, [map, center]);

  return null;
}

/** 지도 idle 시점의 실제 중심 좌표를 부모에 알립니다 (MapPage 근처 검색 디바운스용). */
function MapCameraIdleBridge({ onCameraIdle }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof onCameraIdle !== 'function') return;

    const listener = google.maps.event.addListener(map, 'idle', () => {
      const c = map.getCenter();
      if (!c) return;
      onCameraIdle({ lat: c.lat(), lng: c.lng() });
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onCameraIdle]);

  return null;
}

export default function MapCore({
  pins,
  selectedPinId,
  center,
  children,
  innerContent,
  onPinClick,
  disableMapClick = false,
  searchBar = null,
  onCameraIdle = undefined,
  onMapClick = undefined,
}) {
  const safePins = Array.isArray(pins) ? pins : [];

  return (
    <div className={styles.mapCoreWrapper}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId={MAP_ID}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        clickableIcons={false}
        options={{
          draggableCursor: 'default',
          draggingCursor: 'grabbing',
        }}
        onClick={(e) => {
          if (disableMapClick) return;
          const ll = e.detail?.latLng;
          if (!ll) return;
          const lat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
          const lng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
          if (typeof onMapClick === 'function') {
            onMapClick({ lat: Number(lat), lng: Number(lng) });
            return;
          }
          console.log('map click', lat, lng);
        }}>
        <MapPanController center={center} />
        {typeof onCameraIdle === 'function' ? <MapCameraIdleBridge onCameraIdle={onCameraIdle} /> : null}

        {safePins.map((pin, idx) => {
          // latitude/longitude 없는 핀은 렌더 생략
          if (pin.latitude == null || pin.longitude == null) return null;
          // placeId가 null이면 좌표 기반 키 사용 (duplicate key 방지)
          const pinKey = pin.placeId ?? `pin-${pin.latitude}-${pin.longitude}-${idx}`;
          // null===null 오탐 방지: 양쪽 모두 non-null일 때만 선택 처리
          const isSelected = pin.placeId != null && selectedPinId != null && selectedPinId === pin.placeId;
          return (
            <CustomPin
              key={pinKey}
              place={pin}
              isSelected={isSelected}
              onClick={() => onPinClick?.(pin)}
              onCloseOverlay={() => onPinClick?.(null)}
            />
          );
        })}

        {innerContent}
      </Map>

      {/* searchBar: Map 바깥 렌더링 (내부에 두면 mousedown 차단으로 pan 불가) */}
      {searchBar}
      {children}
    </div>
  );
}
