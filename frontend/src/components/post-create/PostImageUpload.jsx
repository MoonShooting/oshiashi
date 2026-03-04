import React from "react";

function PostImageUpload({
  fileInputRef,
  images,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPickImages,
  onRemoveImage,
}) {
  return (
    <div className="image-upload card">
      <div className="upload-header">
        <h3>사진 업로드</h3>
        <p>사진은 Map 페이지에서 핀 갤러리로 노출됩니다</p>
      </div>

      <button
        className={isDragOver ? "upload-dropzone drag-over" : "upload-dropzone"}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="upload-icon">⤴</span>
        <span>이미지를 드래그하거나 클릭하여 업로드</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden-file"
        onChange={onPickImages}
      />

      <p className="upload-count">최대 20장 업로드 가능 ({images.length}/20)</p>

      {!!images.length && (
        <div className="image-grid">
          {images.map((image) => (
            <article key={image.id} className="image-thumb">
              <img src={image.url} alt={image.name} />
              <button className="remove-btn" onClick={() => onRemoveImage(image.id)}>
                ✕
              </button>
              <div className="gps-chip">
                <span>📍</span>
                <span>{image.hasGPS ? "위치정보 포함" : "위치정보 없음"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostImageUpload;
