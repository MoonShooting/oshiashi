import React from 'react';
import Button from '@/components/modal/Button';
import './ConfirmModal.css';

/** 알림창, 선택창 공통 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {string} title - 제목
 * @param {string} message - 내용
 * @param {string} confirmText - 확인 버튼 텍스트
 * @param {string} cancelText - 취소 버튼 텍스트 (없으면 확인 버튼만 렌더링)
 * @param {string} variant - 'primary' (기본) | 'danger' (회원탈퇴 등 위험 상황)
 * @param {function} onConfirm - 확인 클릭 시 실행
 * @param {function} onCancel - 취소/닫기 클릭 시 실행
 */
const ConfirmModal = ({ isOpen, title, message, confirmText = '확인', cancelText, variant = 'primary', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="modal-title">{title}</h2>}
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          {/* 취소 텍스트가 있을 때만 취소 버튼 렌더링 */}
          {cancelText && (
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
