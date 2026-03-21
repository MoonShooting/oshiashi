import React from 'react';
import { X, ExternalLink, Plus } from 'lucide-react';
import styles from '@/styles/MapRightPanel.module.css';
import { MEDIA_TYPE_LABEL } from '@/constants/mapConstants';

/**
 * @param {Object} props
 * @param {Object} props.pin - 선택된 장소의 상세 데이터 (DUMMY_SPOT_DETAILS[id])
 * @param {Function} props.onClose - 패널 닫기 함수
 */
export default function MapRightPanel({ pin, onClose }) {
  if (!pin) return null;

  /* BACKEND 연동 시, 나중에 API 응답 객체의 필드명에 맞춰 아래 변수들을 수정하세요.
    예: pin.name -> pin.spot_name / pin.mediaType -> pin.category_type 등
  */
  const mediaLabel = MEDIA_TYPE_LABEL[pin.mediaType] || '기타'; // 임시데이터 mapConstants.js 연동
  const badgeClass = `${styles.suggestionBadge} ${styles[`badge_${pin.mediaType}`] || ''}`;
  const actionBtnClass = `${styles.primaryBtn} ${styles[`footerBtn_${pin.mediaType}`] || ''}`;

  return (
    <aside className={styles.detailPanel}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={badgeClass}>{mediaLabel}</span>
          <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <h2 className={styles.title}>{pin.name}</h2>
        <p className={styles.address}>{pin.address}</p>
        <p className={styles.desc}>{pin.description}</p>
      </header>

      <div className={styles.scrollContent}>
        {/* 관련 작품 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>관련 작품</span>
            <span className={styles.dim}>{pin.artwork?.title}</span>
          </div>
          <div
            className={styles.imageCard}
            style={{
              /* BACKEND 연동 시, pin.artwork.posterUrl 필드 확인 */
              backgroundImage: pin.artwork?.posterUrl ? `url(${pin.artwork.posterUrl})` : 'none',
            }}>
            <div className={styles.imageOverlay}>
              <p>성지 개수: {pin.artwork?.spotCount || 0}곳</p>
              <span className={styles.subInfo}>{mediaLabel} 명장면 확인</span>
            </div>
          </div>
        </section>

        {/* 유저 게시글 그리드 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>공개 게시글</span>
            <span className={styles.count}>{pin.posts?.length || 0}개</span>
          </div>
          <ul className={styles.postList}>
            {pin.posts && pin.posts.length > 0 ? (
              pin.posts.map((post) => (
                <li key={post.id} className={styles.postItem}>
                  {/* post.typeLabel (예: '정보', '후기') */}
                  <span className={styles.infoBadge}>{post.typeLabel || '정보'}</span>
                  <div className={styles.postText}>
                    <strong>{post.title || '성지순례 다녀왔어요!'}</strong>
                    <span>
                      @{post.author} · {post.createdAt || '최근'}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <p className={styles.emptyText}>등록된 게시글이 없습니다.</p>
            )}
          </ul>
        </section>
      </div>

      <footer className={styles.footer}>
        <button className={actionBtnClass} onClick={() => window.open(pin.googleMapsUrl, '_blank')}>
          구글 지도에서 보기 <ExternalLink size={16} />
        </button>
        <button className={styles.secondaryBtn}>
          루트에 추가 <Plus size={16} />
        </button>
      </footer>
    </aside>
  );
}
