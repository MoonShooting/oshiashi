import React from "react";

function PostTitleField({ title, onChange }) {
  return (
    <div className="field-group">
      <label>제목</label>
      <input
        className="text-input"
        value={title}
        onChange={onChange}
        placeholder="게시글 제목을 입력하세요"
      />
    </div>
  );
}

export default PostTitleField;
