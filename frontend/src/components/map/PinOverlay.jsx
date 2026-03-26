/**
 * @file PinOverlay.jsx
 * @description 지도 핀 클릭 시 노출되는 팝업 카드 (장소 정보 + 거리뷰 조회)
 *
 * 이미지 우선순위:
 *  1) place.sceneImageUrl / place.artwork?.posterUrl
 *  2) Google Street View Static API (위치 기반)
 *  3) 색상 placeholder
 */
import React, { useState, useEffect } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import styles from '@/styles/PinOverlay.module.css';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function PinOverlay({ place, position, onClose }) {
  //  hooks는 조건 없이 항상 최상단에 ─
  const initialSrc = place?.sceneImageUrl || place?.artwork?.posterUrl || null;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [stage, setStage] = useState(initialSrc ? 'main' : 'sv');

  // place(핀)가 바뀌면 이미지 상태 초기화
  useEffect(() => {
    if (!place) return;
    const src = place.sceneImageUrl || place.artwork?.posterUrl || null;
    setImgSrc(src);
    setStage(src ? 'main' : 'sv');
  }, [place?.placeId]);

  // stage 에 따라 Street View URL 세팅
  useEffect(() => {
    if (stage !== 'sv' || !position) return;
    const { lat, lng } = position;
    const svSrc = GOOGLE_MAPS_KEY
      ? `https://maps.googleapis.com/maps/api/streetview?size=280x140&location=${lat},${lng}&key=${GOOGLE_MAPS_KEY}&return_error_code=true`
      : null;
    setImgSrc(svSrc);
  }, [stage, position]);

  // early return은 hooks 이후에
  if (!place || !position) return null;

  const { lat, lng } = position;
  const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;

  const handleImgError = () => {
    if (stage === 'main') setStage('sv');
    else setImgSrc(null); // placeholder
  };

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
          {imgSrc ? <img src={imgSrc} alt={place.name} onError={handleImgError} /> : <div className={styles.imgPlaceholder} />}
        </div>

        <div className={styles.infoSection}>
          <h4 className={styles.title}>{place.name}</h4>
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
