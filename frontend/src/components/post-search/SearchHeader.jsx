import React from 'react';
import styles from '../../styles/PostSearchResultPage.module.css';

const SearchHeader = ({ searchedTag, resultCount }) => {
  return (
    <section className={styles.searchHeader}>
      <h2 className={styles.searchTitle}>#{searchedTag} 검색 결과</h2>
      <p className={styles.searchCount}>총 {resultCount.toLocaleString()}개의 게시글</p>
    </section>
  );
};

export default SearchHeader;
