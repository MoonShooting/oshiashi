import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { PIN_COLOR } from '@/constants/mapConstants';
import PinOverlay from '@/components/map/PinOverlay'; // 팝업 컴포넌트 임포트

export default function CustomPin({ place, isSelected, onClick, onCloseOverlay }) {
  const getPinColor = () => {
    return PIN_COLOR[place.mediaType]?.background || PIN_COLOR.DEFAULT.background;
  };

  return (
    <AdvancedMarker
      position={place.position}
      onClick={onClick}
      // isSelected일 때 zIndex를 압도적으로 높여서 팝업이 최상단에 오게 합니다.
      zIndex={isSelected ? 9999 : 1}>
      <Pin background={getPinColor()} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={isSelected ? 1.2 : 1.0} />

      {isSelected && <PinOverlay place={place} onClose={onCloseOverlay} />}
    </AdvancedMarker>
  );
}
