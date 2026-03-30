import { useState, useCallback } from 'react';

let _nextId = 0;
const DURATION_MS = 3000;

/**
 * 경량 인라인 토스트 훅
 * - toast.success / toast.error / toast.info 로 메시지 표시
 * - 3초 뒤 자동 제거, dismiss(id)로 수동 제거
 * - <Toast toasts={toasts} onDismiss={dismiss} /> 와 함께 사용
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION_MS);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    dismiss,
    toast: {
      success: (msg) => show(msg, 'success'),
      error: (msg) => show(msg, 'error'),
      info: (msg) => show(msg, 'info'),
    },
  };
};
