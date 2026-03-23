/**
 * @file CustomPin.jsx
 * @description 지도 마커 컴포넌트 (작품 타입별 색상 구분)
 *
 * [변경 내용] 더미 → MapPlaceResponse 필드 적용
 * - place.position → { lat: place.latitude, lng: place.longitude }
 * - place.mediaType: 이제 한국어 DB값 ('영화', '드라마', '애니메이션')
 *   PIN_COLOR 키도 동일한 한국어 값으로 변경됨 (mapConstants.js 수정으로 자동 반영)
 */
import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { PIN_COLOR } from '@/constants/mapConstants';
import PinOverlay from '@/components/map/PinOverlay';

export default function CustomPin({ place, isSelected, onClick, onCloseOverlay }) {
  // MapPlaceResponse: latitude/longitude → position 객체 변환
  const position = {
    lat: Number(place.latitude),
    lng: Number(place.longitude),
  };

  // place.mediaType이 '영화'/'드라마'/'애니메이션' (DB 한국어값)
  // PIN_COLOR 키도 동일한 한국어이므로 그대로 조회
  const config = isSelected ? PIN_COLOR.SELECTED : PIN_COLOR[place.mediaType] || PIN_COLOR.DEFAULT;

  return (
    <AdvancedMarker position={position} onClick={onClick} zIndex={isSelected ? 200 : 1}>
      <Pin
        background={config.background}
        borderColor={config.border || '#ffffff'}
        glyphColor={config.glyph || '#ffffff'}
        scale={isSelected ? 1.2 : 1.0}
      />
      {isSelected && <PinOverlay place={place} position={position} onClose={onCloseOverlay} />}
    </AdvancedMarker>
  );
}
