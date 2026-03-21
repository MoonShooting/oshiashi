/**
 * @file PinOverlay.jsx
 * @description 지도 핀 클릭 시 노출되는 팝업 카드 (장소 정보 + 거리뷰 조회)
 */
import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import styles from '@/styles/PinOverlay.module.css';

export default function PinOverlay({ place, onClose }) {
  if (!place) return null;

  const { lat, lng } = place.position || {};
  const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;

  return (
    <AdvancedMarker position={place.position} zIndex={100}>
      <div className={styles.overlayCard}>
        <button
          className={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}>
          ×
        </button>

        <div className={styles.imageSection}>
          <img src={place.postImageUrl || place.placePhotoUrl} alt="" />
        </div>

        <div className={styles.infoSection}>
          <h4 className={styles.title}>{place.title || place.name}</h4>
          <button
            className={styles.detailBtn}
            onClick={(e) => {
              e.stopPropagation();
              window.open(streetViewUrl, '_blank', 'noopener,noreferrer');
            }}>
            거리뷰 조회
          </button>
        </div>
      </div>
    </AdvancedMarker>
  );
}
