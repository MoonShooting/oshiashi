import React, { useEffect, useRef, useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";

const genres = ["애니메이션", "영화 드라마", "음악"];

const contentCards = [
  { id: 1, genre: "애니메이션" },
  { id: 2, genre: "애니메이션" },
  { id: 3, genre: "영화 드라마" },
  { id: 4, genre: "영화 드라마" },
  { id: 5, genre: "음악" },
  { id: 6, genre: "음악" },
];

const postCards = [
  { id: 1, likes: 88, order: 4 },
  { id: 2, likes: 42, order: 3 },
  { id: 3, likes: 113, order: 2 },
  { id: 4, likes: 20, order: 1 },
];

function Home({ isLoggedIn, onGoLogin, onLogout, onGoCreatePost, onGoRouteBuilder, onGoMyPage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("애니메이션");
  const [postSort, setPostSort] = useState("최신순");
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileMenuOpen]);

  const filteredContents = contentCards.filter((item) => item.genre === selectedGenre);
  const sortedPosts = [...postCards].sort((a, b) => {
    if (postSort === "인기순") return b.likes - a.likes;
    return b.order - a.order;
  });

  return (
    <div className="main-page">
      <SharedHeader
        onMenuClick={() => setSidebarOpen(true)}
        searchPlaceholder="컨텐츠 이름을 입력하세요."
        searchReadOnly
        rightSlot={
          <>
            <button className="create-btn" onClick={onGoCreatePost}>게시글 작성</button>
            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                className="main-avatar"
                aria-label="profile"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              />
              {profileMenuOpen && (
                <div className="profile-menu">
                  {!isLoggedIn ? (
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onGoLogin();
                      }}
                    >
                      로그인 하기
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onGoMyPage?.();
                        }}
                      >
                        나의 정보 보기
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
                      >
                        로그아웃
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        }
      />

      <SharedSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeKey="home"
        onNavigate={(key) => {
          if (key === "route-builder") onGoRouteBuilder();
          else if (key === "post-create") onGoCreatePost();
          else onNavigate?.(key);
        }}
      />

      <main className="main-content">
        <div className="main-shell">
          <section className="hero hero-box">
            <div className="hero-inner">
              <h2>여행을 시작해 보세요</h2>
            </div>
          </section>

          <section className="popular-section">
            <div className="section-head">
              <div>
                <h3>컨텐츠</h3>
                <p>컨텐츠 내용이 표시됩니다.</p>
              </div>
              <div className="filter-group">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    className={selectedGenre === genre ? "filter-btn active" : "filter-btn"}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="popular-row">
              {filteredContents.map((item) => (
                <article key={item.id} className="popular-card placeholder-box">
                  <div className="card-type">{item.genre}</div>
                  <h4>컨텐츠 내용이 표시됩니다.</h4>
                  <p>컨텐츠 내용이 표시됩니다.</p>
                </article>
              ))}
            </div>
          </section>

          <section className="community-section">
            <div className="section-head">
              <div>
                <h3>게시물</h3>
                <p>게시물 내용이 표시됩니다.</p>
              </div>
              <div className="filter-group">
                {["최신순", "인기순"].map((option) => (
                  <button
                    key={option}
                    className={postSort === option ? "filter-btn active" : "filter-btn"}
                    onClick={() => setPostSort(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="community-list">
              {sortedPosts.map((post) => (
                <article key={post.id} className="community-item">
                  <div className="community-thumb placeholder-box" />
                  <div className="community-body">
                    <div className="post-chip">{postSort}</div>
                    <h4>게시물 내용이 표시됩니다.</h4>
                    <p>게시물 내용이 표시됩니다.</p>
                    <small>좋아요 {post.likes}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
