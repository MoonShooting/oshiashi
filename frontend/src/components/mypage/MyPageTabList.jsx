import React from 'react';
import styles from '@/styles/MyPage.module.css';

const MyPageTabList = ({ tabs, activeTab, onTabClick }) => (
  <section className={styles.tabCard}>
    <div className={styles.tabList} role="tablist" aria-label="마이페이지 섹션">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={activeTab === tab.key ? styles.tabButtonActive : styles.tabButton}
          onClick={() => onTabClick(tab.key)}>
          {tab.label}
        </button>
      ))}
    </div>
  </section>
);

export default MyPageTabList;
