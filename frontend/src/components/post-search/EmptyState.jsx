import React from 'react';
import { SearchX } from 'lucide-react';
import styles from '../../styles/PostSearchResultPage.module.css';

const EmptyState = ({ onReset }) => {
  return (
    <section className={styles.emptyState}>
      <SearchX className={styles.emptyIcon} strokeWidth={1.8} />
      <h3>검색 결과가 없습니다</h3>
      <p>선택한 태그 조건을 변경해서 다시 찾아보세요.</p>
      <button type="button" className={styles.emptyActionBtn} onClick={onReset}>
        다른 태그 검색
      </button>
    </section>
  );
};

export default EmptyState;
