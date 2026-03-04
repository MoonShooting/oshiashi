import React from "react";

function PostPublicToggle({ isPublic, onToggle }) {
  return (
    <div className="public-toggle card">
      <div>
        <label>공개 게시글</label>
        <p>공개 시 Map 페이지에서 다른 사용자에게 노출됩니다</p>
      </div>
      <button className={isPublic ? "switch on" : "switch"} onClick={onToggle}>
        <span />
      </button>
    </div>
  );
}

export default PostPublicToggle;
