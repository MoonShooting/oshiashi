import React from 'react';
import './TermsModal.css';

//이용약관 모달
const TermsModal = ({ isOpen, title, content, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <pre style={{ whiteSpace: 'pre-wrap' }}>{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
