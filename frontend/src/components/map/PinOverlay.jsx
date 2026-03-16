import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/PinOverlay.module.css';

export default function PinOverlay({ place, onClose }) {
  const navigate = useNavigate();

  if (!place) return null;

  const handleNavigateToPost = (event) => {
    event.stopPropagation();

    // 핀에서 "자세히 보기"를 눌렀을 때 지도 상호작용으로 닫히지 않고,
    // 연결된 게시물 상세로 바로 이동하도록 postId 기준으로 라우팅합니다.
    if (!place.postId) return;
    navigate(`/posts/${place.postId}`);
  };

  return (
    <AdvancedMarker position={place.position} zIndex={100}>
      {/* AdvancedMarker 안에 div를 바로 넣으면 
        구글의 프레임 없이 마음대로 디자인할 수 있습니다.
      */}
      {/* 카드 내부 클릭은 다시 지도 핀 클릭으로 전파되지 않게 막아
          오버레이가 의도치 않게 닫히는 현상을 방지합니다. */}
      <div className={styles.overlayCard} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
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
          <p className={styles.workName}>{place.workName ?? '저장된 게시물로 이동할 수 있습니다.'}</p>
          <button type="button" className={styles.detailBtn} onClick={handleNavigateToPost}>
            자세히 보기
          </button>
        </div>
      </div>
    </AdvancedMarker>
  );
}
