import React, { useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import CustomPin from './CustomPin';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_ID } from '@/constants/mapConstants';
import styles from '@/styles/MainLayout.module.css';

/**
 * <Map> 내부에만 렌더링되는 pan 컨트롤러 center prop을 <Map>에 직접 넘기면 controlled prop이 되어
 * 값이 바뀔 때마다 강제 재중심화 → 드래그 도중 끊김 현상 발생.
 * 이 컴포넌트는 center가 실제로 바뀔 때만 panTo()를 명시적으로 호출하여 사용자 드래그와 충돌하지 않습니다.
 */
function MapPanController({ center }) {
  const map = useMap();
  const prevCenter = useRef(null);

  useEffect(() => {
    if (!map || !center) return;
    // 이전 값과 동일하면 panTo 호출 안 함 (불필요한 이동 방지)
    const prev = prevCenter.current;
    if (prev && prev.lat === center.lat && prev.lng === center.lng) return;
    prevCenter.current = center;
    map.panTo({ lat: center.lat, lng: center.lng });
  }, [map, center]);

  return null;
}

/**
 * @param {{ lat, lng }} center      - 지도 중심 이동 요청 좌표 (핀 클릭·검색 시) controlled prop이 아닌 panTo()로 처리되므로 사용자 드래그와 충돌하지 않습니다.
 * @param {boolean} disableMapClick  - true 시 지도 배경 클릭 이벤트 차단 (핀 클릭만 허용)
 * @param {ReactNode} searchBar      - 지도 위 absolute 오버레이 검색창 <Map> 바깥에 렌더링하여 mousedown 차단 방지.
 */
export default function MapCore({ pins, selectedPinId, center, onPinClick, children, disableMapClick = false, searchBar = null }) {
  return (
    /* 여기서 높이를 100%로 강제합니다. */
    <div className={styles.mapMain} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        // center를 controlled prop으로 넘기지 않습니다.
        // 대신 내부 MapPanController가 panTo()로 이동을 처리합니다.
        defaultZoom={DEFAULT_ZOOM}
        mapId={MAP_ID}
        /* 이 style 속성이 없으면 지도가 로드되어도 화면에 안 보입니다. */
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        clickableIcons={false} // 구글 기본 팝업 차단
        // disableMapClick=true면 지도 배경 클릭을 완전히 무시 (MapPage 등 핀 전용 뷰에서 사용)
        onClick={disableMapClick ? undefined : () => onPinClick?.(null)}>
        {/* panTo 전용 컨트롤러 — <Map> 자식으로 있어야 useMap() 접근 가능 */}
        <MapPanController center={center} />

        {pins?.map((pin) => (
          <CustomPin
            key={pin.id}
            place={pin}
            isSelected={selectedPinId === pin.id}
            onClick={() => onPinClick(pin)}
            onCloseOverlay={() => onPinClick?.(null)}
          />
        ))}
      </Map>

      {/* searchBar는 <Map> 바깥 wrapper div에 absolute 오버레이로 렌더링
          → <Map> 내부에 두면 라이브러리 오버레이가 mousedown을 가로막아 드래그 pan 불가 */}
      {searchBar}

      {children}
    </div>
  );
}
