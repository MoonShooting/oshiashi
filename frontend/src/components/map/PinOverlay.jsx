import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import styles from '@/styles/PinOverlay.module.css';

export default function PinOverlay({ place, onClose }) {
  if (!place) return null;

  return (
    <AdvancedMarker position={place.position} zIndex={100}>
      {/* AdvancedMarker 안에 div를 바로 넣으면 
        구글의 프레임 없이 마음대로 디자인할 수 있습니다.
      */}
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
          <h4 className={styles.title}>{place.title}</h4>
          <button className={styles.detailBtn}>자세히 보기</button>
        </div>
      </div>
    </AdvancedMarker>
  );
}
