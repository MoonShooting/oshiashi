import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../../styles/PostSearchResultPage.module.css';

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className={styles.sortWrapper}>
      <label htmlFor="post-sort" className={styles.sortLabel}>
        정렬
      </label>
      <div className={styles.sortSelectWrapper}>
        <select id="post-sort" className={styles.sortSelect} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="views">조회순</option>
        </select>
        <ChevronDown className={styles.sortChevron} strokeWidth={2} />
      </div>
    </div>
  );
};

export default SortDropdown;
