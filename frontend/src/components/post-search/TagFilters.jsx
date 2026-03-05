import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import styles from '../../styles/PostSearchResultPage.module.css';

const TagFilters = ({ tags, onRemove, onClear }) => {
  return (
    <section className={styles.tagFilterRow}>
      <div className={styles.tagList}>
        {tags.map((tag) => (
          <button
            key={tag}
            className={styles.activeTagChip}
            onClick={() => onRemove(tag)}
            type="button"
            aria-label={`${tag} 태그 제거`}
          >
            <span>#{tag}</span>
            <X className={styles.tagRemoveIcon} strokeWidth={2.2} />
          </button>
        ))}
      </div>
      <button className={styles.resetFilterBtn} onClick={onClear} type="button">
        <RotateCcw className={styles.resetIcon} strokeWidth={2} />
        필터 초기화
      </button>
    </section>
  );
};

export default TagFilters;
