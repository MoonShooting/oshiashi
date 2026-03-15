import React from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostLocationModal = ({ entry, onClose }) => {
  if (!entry) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${entry.lat},${entry.lng}`;

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
          <div className={styles.modalCoords}>
            Lat {entry.lat.toFixed(4)} · Lng {entry.lng.toFixed(4)}
          </div>
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
