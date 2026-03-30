import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import styles from '@/styles/Toast.module.css';

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

/**
 * 토스트 알림 렌더러
 * useToast 훅의 toasts / dismiss 와 함께 사용합니다.
 */
const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className={styles.container} role="region" aria-label="알림">
      {toasts.map(({ id, message, type }) => {
        const Icon = ICON_MAP[type] ?? Info;
        return (
          <div key={id} className={`${styles.toast} ${styles[type]}`} role="alert">
            <Icon size={16} className={styles.icon} />
            <span className={styles.message}>{message}</span>
            <button type="button" className={styles.close} onClick={() => onDismiss(id)} aria-label="닫기">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
