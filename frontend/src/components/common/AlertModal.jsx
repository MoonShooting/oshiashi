import React, { useEffect, useId, useRef } from 'react';
import styles from '@/styles/AlertModal.module.css';

const TONE_LABEL = {
  success: '성공',
  error: '오류',
  info: '안내',
};

const AlertModal = ({
  isOpen,
  type = 'single',
  tone = 'info',
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  allowBackdropClose = true,
  onConfirm,
  onCancel,
  onBackdropClose,
}) => {
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmType = type === 'confirm';
  const safeTitle = title?.trim() || '알림';
  const safeMessage = message?.trim() || '요청 결과를 확인해주세요.';
  const safeTone = tone in TONE_LABEL ? tone : 'info';

  const toneClassName =
    safeTone === 'success'
      ? styles.toneSuccess
      : safeTone === 'error'
        ? styles.toneError
        : styles.toneInfo;

  const handleBackdropClick = () => {
    if (allowBackdropClose && typeof onBackdropClose === 'function') {
      onBackdropClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <span className={`${styles.toneBadge} ${toneClassName}`}>{TONE_LABEL[safeTone]}</span>
          <h2 id={dialogTitleId} className={styles.title}>
            {safeTitle}
          </h2>
        </div>

        <p id={dialogDescriptionId} className={styles.message}>
          {safeMessage}
        </p>

        <div className={`${styles.actions} ${isConfirmType ? styles.actionsDouble : styles.actionsSingle}`}>
          {isConfirmType ? (
            <button type="button" className={`${styles.actionButton} ${styles.cancelButton}`} onClick={onCancel}>
              {cancelText}
            </button>
          ) : null}

          <button
            type="button"
            ref={confirmButtonRef}
            className={`${styles.actionButton} ${styles.confirmButton}`}
            onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
