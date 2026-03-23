/**
 * @file MapRightPanel.jsx
 * @description 장소 클릭 시 우측에 나타나는 상세 패널
 *
 * [변경 내용] MapPlaceResponse (getPlaceDetail 응답) 적용
 *
 * [필드 매핑]
 * 프론트                    → MapPlaceResponse
 * pin.mediaType('애니메이션') → pin.mediaType ('애니메이션')
 * pin.name                 → 장소 이름
 * pin.address              → 주소
 * pin.googleMapsUrl        → 좌표로 직접 생성 (latitude/longitude)
 * pin.artwork.title        → pin.artworkTitle
 * pin.artwork.posterUrl    → sceneImageUrl 장소/장면 대표 이미지
 * pin.artwork.spotCount    → relatedPostCount 장소가 포함된 루트를 참조하는 게시글 수
 *
 * @param {MapPlaceResponse|null} pin     - 선택된 장소 상세 데이터
 * @param {Function}              onClose - 패널 닫기 콜백
 */
import React from 'react';
import { X, ExternalLink, Plus } from 'lucide-react';
import styles from '@/styles/MapRightPanel.module.css';
import { PIN_COLOR } from '@/constants/mapConstants';

export default function MapRightPanel({ pin, onClose }) {
  if (!pin) return null;

  const pinConfig = PIN_COLOR[pin.mediaType] || PIN_COLOR.DEFAULT;

  // 구글 지도 URL 생성
  const googleMapsUrl = pin.latitude != null && pin.longitude != null ? `https://maps.google.com/?q=${pin.latitude},${pin.longitude}` : null;

  return (
    <aside className={styles.detailPanel}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span
            className={styles.suggestionBadge}
            style={{
              backgroundColor: pinConfig.background,
              borderColor: pinConfig.border,
              color: pinConfig.glyph, // 글자색 (보통 하얀색)
            }}>
            {pin.mediaType || '작품'}
          </span>
          <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        {/* 장소 이름 (name) */}
        <h2 className={styles.title}>{pin.name}</h2>
        {pin.address && <p className={styles.address}>{pin.address}</p>}
      </header>

      <div className={styles.scrollContent}>
        {/* 관련 작품 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>관련 작품</span>
            {/* 작품 제목 (artworkTitle) */}
            <span className={styles.dim}>{pin.artworkTitle}</span>
          </div>

          <div className={styles.imageCard}>
            {/* 대표 이미지 (sceneImageUrl) */}
            {pin.sceneImageUrl ? (
              <img src={pin.sceneImageUrl} alt={pin.artworkTitle} className={styles.imageCardImg} />
            ) : (
              <div className={styles.imageCardEmpty}>등록된 장면 이미지가 없습니다.</div>
            )}

            <div className={styles.imageOverlay}>
              {/* 게시글 수 (relatedPostCount) */}
              <p>관련 게시글: {pin.relatedPostCount ?? 0}개</p>
              <span className={styles.subInfo}>{pin.mediaType} 명장면 확인</span>
            </div>
          </div>
        </section>

        {/* 공개 게시글 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>공개 게시글</span>
            <span className={styles.count}>{pin.relatedPostCount ?? 0}개</span>
          </div>
          <ul className={styles.postList}>{(pin.relatedPostCount ?? 0) === 0 && <p className={styles.emptyText}>등록된 게시글이 없습니다.</p>}</ul>
        </section>
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.primaryBtn}
          style={{ backgroundColor: pinConfig.background }}
          onClick={() => googleMapsUrl && window.open(googleMapsUrl, '_blank')}
          disabled={!googleMapsUrl}>
          구글 지도에서 보기 <ExternalLink size={16} />
        </button>
        <button className={styles.secondaryBtn}>
          루트에 추가 <Plus size={16} />
        </button>
      </footer>
    </aside>
  );
}
