import React from "react";

function PostBottomBar({ canSubmit, onSaveDraft, onSubmit }) {
  return (
    <footer className="bottom-bar">
      <div className="bottom-inner">
        <button className="ghost-btn" onClick={onSaveDraft}>
          <span>💾</span>
          <span>임시 저장</span>
        </button>
        <div className="bottom-actions">
          <button className={canSubmit ? "primary-btn" : "primary-btn disabled"} onClick={onSubmit}>
            게시글 등록
          </button>
        </div>
      </div>
    </footer>
  );
}

export default PostBottomBar;
