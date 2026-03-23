/**
 * @file PinOverlay.jsx
 * @description 지도 핀 클릭 시 노출되는 팝업 카드 (장소 정보 + 거리뷰 조회)
 *
 * [변경 내용] 더미 → MapPlaceResponse 필드 적용
 * - position prop 추가 (CustomPin에서 이미 계산된 { lat, lng } 전달)
 * - place.postImageUrl / place.placePhotoUrl → place.sceneImageUrl
 * - place.title → place.name (장소명), place.artworkTitle (작품명) 표시 추가
 */
import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import styles from '@/styles/PinOverlay.module.css';

export default function PinOverlay({ place, position, onClose }) {
  if (!place || !position) return null;

  const { lat, lng } = position;
  const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;

  return (
    <AdvancedMarker position={position} zIndex={100}>
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
          {/* MapPlaceResponse.sceneImageUrl (작품 이미지) */}
          {place.sceneImageUrl ? <img src={place.sceneImageUrl} alt={place.name} /> : <div className={styles.imgPlaceholder} />}
        </div>

        <div className={styles.infoSection}>
          {/* place.name (장소명) */}
          <h4 className={styles.title}>{place.name}</h4>
          {/* 작품명 */}
          {place.artworkTitle && <p className={styles.workName}>{place.artworkTitle}</p>}
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
