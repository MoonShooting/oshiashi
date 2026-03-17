import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '@/components/common/AlertModal.jsx';
import { useAlertStore } from '@/stores/useAlertStore.js';

const AlertHost = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    type,
    tone,
    title,
    message,
    confirmText,
    cancelText,
    allowBackdropClose,
    allowEscClose,
    closeAlert,
    confirmAlert,
    cancelAlert,
  } = useAlertStore((state) => ({
    isOpen: state.isOpen,
    type: state.type,
    tone: state.tone,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    allowBackdropClose: state.allowBackdropClose,
    allowEscClose: state.allowEscClose,
    closeAlert: state.closeAlert,
    confirmAlert: state.confirmAlert,
    cancelAlert: state.cancelAlert,
  }));

  useEffect(() => {
    if (!isOpen || !allowEscClose) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAlert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, allowEscClose, closeAlert]);

  return (
    <AlertModal
      isOpen={isOpen}
      type={type}
      tone={tone}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      allowBackdropClose={allowBackdropClose}
      onConfirm={() => confirmAlert(navigate)}
      onCancel={cancelAlert}
      onBackdropClose={closeAlert}
    />
  );
};

export default AlertHost;
