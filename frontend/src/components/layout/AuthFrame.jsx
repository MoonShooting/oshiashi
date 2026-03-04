import React from 'react';
import styles from './AuthFrame.module.css';

const AuthFrame = ({ children }) => {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>{children}</div>
    </div>
  );
};

export default AuthFrame;
