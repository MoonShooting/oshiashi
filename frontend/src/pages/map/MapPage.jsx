/**
 * @file MapCore.jsx
 * @description 공통 지도 베이스 컴포넌트
 * - pins: CustomPin 렌더링 (mediaType별 색상 마커)
 * - innerContent: <Map> 내부 슬롯 (OrderPin, SpotDirections 등 useMap 필요 요소)
 * - onPinClick(pin|null): 핀 클릭 / 선택 해제
 * - onMapClick({lat,lng}): 빈 지도 좌표 클릭
 * - searchBar: <Map> 바깥 오버레이
 */
import React, { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import CustomPin from '@/components/map/CustomPin';
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

export default function MapCore({
  pins,
  selectedPinId,
  center,
  children,
  innerContent,
  onPinClick,
  onMapClick,
  disableMapClick = false,
  searchBar = null,
}) {
  const handleClick = (e) => {
    if (disableMapClick) return;
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat != null && lng != null) {
      onMapClick?.({ lat, lng });
    } else {
      onPinClick?.(null);
    }
  };

  return (
    <div className={styles.mapCoreWrapper}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId={MAP_ID}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        clickableIcons={false}
        options={{ draggableCursor: 'default', draggingCursor: 'grabbing' }}
        onClick={disableMapClick ? undefined : handleClick}>
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
        {innerContent}
      </Map>
      {/* searchBar는 <Map> 바깥 — 내부에 두면 mousedown 차단으로 드래그 pan 불가 */}
      {searchBar}
      {children}
    </div>
  );
}
