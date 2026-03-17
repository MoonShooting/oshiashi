import React from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostLocationModal = ({ entry, onClose }) => {
  if (!entry) return null;

  // 좌표가 있으면 lat/lng 링크를, 없으면 주소 검색 링크를 사용합니다.
  const lat = Number(entry.lat);
  const lng = Number(entry.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.address || entry.title || '')}`;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitleRow}>
              <MapPin size={18} />
              <h3>{entry.title}</h3>
            </div>
            <p className={styles.modalAddress}>{entry.address}</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalMapMock}>
          <div className={styles.modalPin} />
          {hasCoordinates ? (
            <div className={styles.modalCoords}>
              Lat {lat.toFixed(4)} · Lng {lng.toFixed(4)}
            </div>
          ) : (
            <div className={styles.modalCoords}>좌표 정보가 없어 주소 기준으로 안내합니다.</div>
          )}
        </div>

        <div className={styles.modalActions}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.modalPrimaryLink}>
            <ExternalLink size={16} />
            Google Maps로 열기
          </a>
        </div>
      </div>
    </div>
  );
};

export default PostLocationModal;
