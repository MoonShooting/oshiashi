import React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import CustomPin from './CustomPin';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_ID } from '@/constants/mapConstants';
import styles from '@/styles/MainLayout.module.css';

export default function MapCore({ pins, selectedPinId, center, onPinClick, children }) {
  return (
    /* 여기서 높이를 100%로 강제합니다. */
    <div className={styles.mapMain} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        center={center}
        defaultZoom={DEFAULT_ZOOM}
        mapId={MAP_ID}
        /* 이 style 속성이 없으면 지도가 로드되어도 화면에 안 보입니다. */
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI={true}
        clickableIcons={false} // 구글 기본 팝업 차단
        onClick={() => onPinClick(null)}>
        {pins?.map((pin) => (
          <CustomPin
            key={pin.id}
            place={pin}
            isSelected={selectedPinId === pin.id}
            onClick={() => onPinClick(pin)}
            onCloseOverlay={() => onPinClick(null)}
          />
        ))}
      </Map>
      {children}
    </div>
  );
}
