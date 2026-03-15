import React from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import CustomPin from '@/components/map/CustomPin';
import PinOverlay from '@/components/map/PinOverlay';
import { MAP_ID, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/mapConstants';

export default function MapCore({ pins, selectedPinId, center, onPinClick, children }) {
  const map = useMap();

  React.useEffect(() => {
    if (map && center) map.panTo(center);
  }, [map, center]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} mapId={MAP_ID} disableDefaultUI>
        {pins &&
          pins.map((pin) => (
            <CustomPin
              key={pin.id}
              place={pin}
              isSelected={selectedPinId === pin.id}
              onClick={() => onPinClick?.(pin)}
              onCloseOverlay={() => onPinClick?.(null)} // 닫기 함수 전달
            />
          ))}
      </Map>
      {children}
    </div>
  );
}
