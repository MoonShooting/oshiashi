/**
 * @file MapCore.jsx
 * @description 공통 지도 베이스 컴포넌트
 * - pins: CustomPin(미디어 타입별 색상 마커) 렌더링
 * - innerContent: <Map> 내부에 주입할 추가 요소 (OrderPin, DirectionsRenderer 등)
 * - children: <Map> 바깥 오버레이 (searchBar 등)
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

/**
 * @param {boolean} disableMapClick - true 시 배경 클릭 이벤트 차단
 * @param {ReactNode} innerContent  - <Map> 내부에 렌더링할 요소 (OrderPin, SpotDirections 등)
 * @param {ReactNode} children      - <Map> 바깥 오버레이
 */
export default function MapCore({ pins, selectedPinId, center, children, innerContent, onPinClick, disableMapClick = false, searchBar = null }) {
  return (
    <div className={styles.mapCoreWrapper}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId={MAP_ID}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        clickableIcons={true}
        options={{
          draggableCursor: 'default',
          draggingCursor: 'grabbing',
        }}
        onClick={(e) => {
          const lat = e.detail.latLng.lat;
          const lng = e.detail.latLng.lng;
          console.log('map click', lat, lng);
        }}>
        <MapPanController center={center} />
        {pins?.map((pin) => (
          <CustomPin
            key={pin.id}
            place={pin}
            isSelected={selectedPinId === pin.id}
            onClick={() => onPinClick?.(pin)}
            onCloseOverlay={() => onPinClick?.(null)}
          />
        ))}
        {/* <Map> 내부 주입 슬롯: OrderPin, SpotDirections 등 Map 컨텍스트가 필요한 요소 */}
        {innerContent}
      </Map>
      {/* searchBar는 <Map> 바깥에 렌더링. 내부에 두면 mousedown 차단으로 드래그 pan 불가 */}
      {searchBar}
      {children}
    </div>
  );
}
