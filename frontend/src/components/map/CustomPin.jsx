import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { PIN_COLOR } from '@/constants/mapConstants';
import PinOverlay from '@/components/map/PinOverlay';

export default function CustomPin({ place, isSelected, onClick, onCloseOverlay }) {
  const getPinColor = () => {
    return PIN_COLOR[place.mediaType]?.background || PIN_COLOR.DEFAULT.background;
  };

  return (
    <AdvancedMarker position={place.position} onClick={onClick} zIndex={isSelected ? 9999 : 1}>
      <Pin
        background={getPinColor()}
        borderColor={'#ffffff'}
        glyphColor={'#ffffff'}
        scale={isSelected ? 1.2 : 1.0} // 크기만 살짝 커짐
      />

      {isSelected && <PinOverlay place={place} onClose={onCloseOverlay} />}
    </AdvancedMarker>
  );
}
