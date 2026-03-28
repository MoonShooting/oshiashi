import React from 'react';
import styles from '../../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ message = '로딩 중...' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
