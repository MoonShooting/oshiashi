import { create } from 'zustand';

const createInitialAlertState = () => ({
  isOpen: false,
  type: 'single',
  tone: 'info',
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  redirectTo: null,
  shouldRedirectOnConfirm: false,
  allowBackdropClose: true,
  allowEscClose: true,
  onConfirm: null,
  onCancel: null,
});

const resolveAlertState = (payload = {}, defaults = {}) => {
  const base = createInitialAlertState();

  return {
    ...base,
    ...defaults,
    ...payload,
    isOpen: true,
    confirmText: payload.confirmText ?? defaults.confirmText ?? base.confirmText,
    cancelText: payload.cancelText ?? defaults.cancelText ?? base.cancelText,
    shouldRedirectOnConfirm:
      payload.shouldRedirectOnConfirm ??
      defaults.shouldRedirectOnConfirm ??
      Boolean(payload.redirectTo ?? defaults.redirectTo),
    allowBackdropClose: payload.allowBackdropClose ?? defaults.allowBackdropClose ?? base.allowBackdropClose,
    allowEscClose: payload.allowEscClose ?? defaults.allowEscClose ?? base.allowEscClose,
    onConfirm: payload.onConfirm ?? defaults.onConfirm ?? null,
    onCancel: payload.onCancel ?? defaults.onCancel ?? null,
  };
};

export const useAlertStore = create((set, get) => ({
  ...createInitialAlertState(),

  openAlert: (payload = {}) =>
    set(() =>
      resolveAlertState(payload, {
        type: 'single',
        tone: 'info',
        allowBackdropClose: true,
        allowEscClose: true,
      }),
    ),

  openConfirm: (payload = {}) =>
    set(() =>
      resolveAlertState(payload, {
        type: 'confirm',
        tone: 'info',
        allowBackdropClose: false,
        allowEscClose: false,
      }),
    ),

  closeAlert: () => set(() => createInitialAlertState()),

  confirmAlert: (navigate) => {
    const currentAlert = get();

    set(() => createInitialAlertState());

    if (typeof currentAlert.onConfirm === 'function') {
      try {
        currentAlert.onConfirm();
      } catch (error) {
        console.error('Alert confirm callback failed:', error);
      }
    }

    if (currentAlert.shouldRedirectOnConfirm && currentAlert.redirectTo && typeof navigate === 'function') {
      navigate(currentAlert.redirectTo);
    }
  },

  cancelAlert: () => {
    const currentAlert = get();

    set(() => createInitialAlertState());

    if (typeof currentAlert.onCancel === 'function') {
      try {
        currentAlert.onCancel();
      } catch (error) {
        console.error('Alert cancel callback failed:', error);
      }
    }
  },
}));
