import React from "react";

const TOOLBAR_ITEMS = [
  { key: "bold", label: "B" },
  { key: "italic", label: "I" },
  { key: "list", label: "•" },
  { key: "quote", label: "❝" },
];

function PostContentEditor({ activeFormats, onToggleFormat, content, onChange }) {
  return (
    <div className="editor card">
      <div className="editor-toolbar">
        {TOOLBAR_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            className={activeFormats.has(key) ? "active" : ""}
            onClick={() => onToggleFormat(key)}
            aria-label={key}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <textarea value={content} onChange={onChange} placeholder="성지순례 경험을 공유해주세요..." />
    </div>
  );
}

export default PostContentEditor;
