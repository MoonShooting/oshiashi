import React, { useEffect, useMemo, useRef, useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";
import PostRouteSelector from "../components/post-create/PostRouteSelector";
import PostTitleField from "../components/post-create/PostTitleField";
import PostContentEditor from "../components/post-create/PostContentEditor";
import PostImageUpload from "../components/post-create/PostImageUpload";
import PostPublicToggle from "../components/post-create/PostPublicToggle";
import PostBottomBar from "../components/post-create/PostBottomBar";
import PostSceneMatching from "../components/post-create/PostSceneMatching";

const routes = [
  { id: "1", title: "도쿄 성지순례 루트 A", places: 5 },
  { id: "2", title: "교토 클래식 루트", places: 8 },
  { id: "3", title: "오사카 먹방 투어", places: 6 },
  { id: "4", title: "카마쿠라 슬램덩크 루트", places: 4 },
  { id: "5", title: "아키하바라 오타쿠 투어", places: 7 },
];

function PostCreatePage({ onGoHome, onGoRouteBuilder, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState([]);
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [activeFormats, setActiveFormats] = useState(new Set());
  const fileInputRef = useRef(null);

  const selectedRouteData = useMemo(
    () => routes.find((route) => route.id === selectedRoute),
    [selectedRoute]
  );

  const canSubmit = selectedRoute && title.trim();

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.url) URL.revokeObjectURL(image.url);
      });
    };
  }, [images]);

  const toggleFormat = (format) => {
    setActiveFormats((prev) => {
      const next = new Set(prev);
      if (next.has(format)) next.delete(format);
      else next.add(format);
      return next;
    });
  };

  const appendFiles = (files) => {
    if (!files.length) return;
    const nextItems = files.slice(0, 20 - images.length).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      hasGPS: Math.random() > 0.5,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...nextItems]);
  };

  const handlePickImages = (event) => {
    const files = Array.from(event.target.files || []);
    appendFiles(files);
  };

  const handleImageDragOver = (event) => {
    event.preventDefault();
    setIsDragOverImage(true);
  };

  const handleImageDragLeave = (event) => {
    event.preventDefault();
    setIsDragOverImage(false);
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    setIsDragOverImage(false);
    const files = Array.from(event.dataTransfer.files || []);
    appendFiles(files);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    window.alert("게시글이 등록되었습니다.");
  };

  const handleSaveDraft = () => {
    window.alert("임시 저장되었습니다.");
  };

  return (
    <div className="post-page">
      <SharedHeader
        onMenuClick={() => setMenuOpen((prev) => !prev)}
        searchPlaceholder="장소, 작품, 루트 검색..."
        searchReadOnly={false}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        rightSlot={
          <button className="avatar" aria-label="profile">
            U
          </button>
        }
      />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey="post-create"
        onNavigate={(key) => {
          if (key === "home") onGoHome();
          else if (key === "route-builder") onGoRouteBuilder();
          else onNavigate?.(key);
        }}
      />

      <main className="post-main">
        <section className="post-title-wrap">
          <h2>게시글 작성</h2>
        </section>

        <section className="post-content-shell">
          <PostRouteSelector
            routes={routes}
            selectedRoute={selectedRoute}
            selectedRouteData={selectedRouteData}
            routeDropdownOpen={routeDropdownOpen}
            setRouteDropdownOpen={setRouteDropdownOpen}
            setSelectedRoute={setSelectedRoute}
          />

          <PostTitleField title={title} onChange={(e) => setTitle(e.target.value)} />

          <PostContentEditor
            activeFormats={activeFormats}
            onToggleFormat={toggleFormat}
            content={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <PostImageUpload
            fileInputRef={fileInputRef}
            images={images}
            isDragOver={isDragOverImage}
            onDragOver={handleImageDragOver}
            onDragLeave={handleImageDragLeave}
            onDrop={handleImageDrop}
            onPickImages={handlePickImages}
            onRemoveImage={removeImage}
          />

          <PostSceneMatching />

          <PostPublicToggle isPublic={isPublic} onToggle={() => setIsPublic((prev) => !prev)} />
        </section>
      </main>

      <PostBottomBar canSubmit={canSubmit} onSaveDraft={handleSaveDraft} onSubmit={handleSubmit} />
    </div>
  );
}

export default PostCreatePage;
