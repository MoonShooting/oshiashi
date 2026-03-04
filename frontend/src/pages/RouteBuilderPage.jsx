import React, { useMemo, useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";

const bookmarkFolders = [
  {
    id: "f1",
    name: "도쿄 성지순례",
    spots: [
      { id: "s1", name: "스가 신사", artworkName: "너의 이름은", category: "anime", x: 48, y: 38 },
      { id: "s2", name: "유시마 텐만구", artworkName: "러브라이브!", category: "anime", x: 72, y: 22 },
      { id: "s3", name: "시부야 스크램블", artworkName: "웨더링 위드 유", category: "anime", x: 40, y: 62 },
    ],
  },
  {
    id: "f2",
    name: "드라마 촬영지",
    spots: [
      { id: "s4", name: "도쿄 타워", artworkName: "도쿄 러브스토리", category: "drama", x: 58, y: 68 },
      { id: "s5", name: "키사텐 카페", artworkName: "고독한 미식가", category: "drama", x: 35, y: 48 },
    ],
  },
  {
    id: "f3",
    name: "영화 명장면",
    spots: [
      { id: "s6", name: "가쿠슈인 학교", artworkName: "바케모노가타리", category: "movie", x: 28, y: 18 },
    ],
  },
];

const allSpots = bookmarkFolders.flatMap((folder) => folder.spots);

function RouteBuilderPage({ onGoHome, onGoCreatePost, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bookmark");
  const [folderId, setFolderId] = useState("f1");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [routeSpots, setRouteSpots] = useState([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [routeTitle, setRouteTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const selectedFolder = useMemo(
    () => bookmarkFolders.find((folder) => folder.id === folderId),
    [folderId]
  );

  const searchResults = useMemo(
    () =>
      allSpots.filter((spot) => {
        const queryOk = !query || spot.name.includes(query) || spot.artworkName.includes(query);
        const filterOk = !filter || spot.category === filter;
        return queryOk && filterOk;
      }),
    [query, filter]
  );

  const routeIds = routeSpots.map((spot) => spot.id);

  const addSpot = (spot) => {
    if (!routeIds.includes(spot.id)) setRouteSpots((prev) => [...prev, spot]);
  };

  const removeSpot = (spotId) => {
    setRouteSpots((prev) => prev.filter((spot) => spot.id !== spotId));
  };

  const moveSpot = (index, dir) => {
    const next = [...routeSpots];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRouteSpots(next);
  };

  const saveRoute = () => {
    window.alert(`루트 저장 완료: ${routeTitle || "자동 제목 루트"}`);
    setSaveOpen(false);
    setRouteTitle("");
  };

  const spotsForList = activeTab === "bookmark" ? selectedFolder?.spots || [] : searchResults;

  return (
    <div className="rb-page">
      <SharedHeader
        onMenuClick={() => setMenuOpen((prev) => !prev)}
        searchPlaceholder="장소, 작품, 루트 검색..."
        rightSlot={
          <div className="rb-right">
            <button className="rb-create-btn" onClick={onGoCreatePost}>게시글 작성</button>
            <button className="rb-avatar">U</button>
          </div>
        }
      />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey="route-builder"
        onNavigate={(key) => {
          if (key === "home") onGoHome();
          else if (key === "post-create") onGoCreatePost();
          else onNavigate?.(key);
        }}
      />

      <div className="rb-titlebar">루트 생성</div>

      <main className="rb-main">
        <section className="rb-left-panel">
          <div className="rb-tabs">
            <button
              className={activeTab === "bookmark" ? "active" : ""}
              onClick={() => setActiveTab("bookmark")}
            >
              북마크
            </button>
            <button
              className={activeTab === "search" ? "active" : ""}
              onClick={() => setActiveTab("search")}
            >
              지도 검색
            </button>
          </div>

          {activeTab === "bookmark" ? (
            <div className="rb-scroll">
              <div className="rb-folders">
                {bookmarkFolders.map((folder) => (
                  <button
                    key={folder.id}
                    className={folderId === folder.id ? "active" : ""}
                    onClick={() => setFolderId(folder.id)}
                  >
                    <span>{folder.name}</span>
                    <small>{folder.spots.length}개</small>
                  </button>
                ))}
              </div>
              <div className="rb-spot-list">
                {spotsForList.map((spot) => (
                  <article key={spot.id} className="rb-spot-card">
                    <div>
                      <p>{spot.name}</p>
                      <small>{spot.artworkName}</small>
                    </div>
                    {routeIds.includes(spot.id) ? (
                      <button className="danger" onClick={() => removeSpot(spot.id)}>제거</button>
                    ) : (
                      <button onClick={() => addSpot(spot)}>추가</button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="rb-scroll">
              <input
                className="rb-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="장소 또는 작품 검색..."
              />
              <div className="rb-filters">
                {[
                  ["anime", "애니"],
                  ["drama", "드라마"],
                  ["movie", "영화"],
                ].map(([key, label]) => (
                  <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(filter === key ? "" : key)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="rb-spot-list">
                {spotsForList.map((spot) => (
                  <article key={spot.id} className="rb-spot-card">
                    <div>
                      <p>{spot.name}</p>
                      <small>{spot.artworkName}</small>
                    </div>
                    {routeIds.includes(spot.id) ? (
                      <button className="danger" onClick={() => removeSpot(spot.id)}>제거</button>
                    ) : (
                      <button onClick={() => addSpot(spot)}>추가</button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rb-map-wrap">
          <div className="rb-map">
            {allSpots.map((spot) => {
              const idx = routeSpots.findIndex((item) => item.id === spot.id);
              const inRoute = idx >= 0;
              return (
                <button
                  key={spot.id}
                  className={inRoute ? "rb-pin in-route" : "rb-pin"}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={() => (inRoute ? removeSpot(spot.id) : addSpot(spot))}
                  title={spot.name}
                >
                  {inRoute ? idx + 1 : "●"}
                </button>
              );
            })}
            <div className="rb-map-label">東京 · Tokyo</div>
          </div>

          <aside className="rb-right-panel">
            <div className="rb-rp-head">
              <h3>루트에 담긴 장소</h3>
              <span>{routeSpots.length}</span>
            </div>
            <div className="rb-rp-list">
              {!routeSpots.length ? (
                <p className="rb-empty">장소를 추가해주세요</p>
              ) : (
                routeSpots.map((spot, index) => (
                  <article key={spot.id} className="rb-rp-item">
                    <strong>{index + 1}</strong>
                    <div>
                      <p>{spot.name}</p>
                      <small>{spot.artworkName}</small>
                    </div>
                    <div className="rb-rp-actions">
                      <button onClick={() => moveSpot(index, -1)}>↑</button>
                      <button onClick={() => moveSpot(index, 1)}>↓</button>
                      <button onClick={() => removeSpot(spot.id)}>✕</button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="rb-rp-foot">
              <button onClick={() => setRouteSpots([])} disabled={!routeSpots.length}>초기화</button>
              <button className="primary" onClick={() => setSaveOpen(true)} disabled={!routeSpots.length}>저장</button>
            </div>
          </aside>
        </section>
      </main>

      {saveOpen && (
        <div className="rb-overlay">
          <div className="rb-save-modal">
            <h3>루트 저장</h3>
            <label>루트 제목</label>
            <input value={routeTitle} onChange={(e) => setRouteTitle(e.target.value)} placeholder="예: 도쿄 애니 성지순례" />
            <label>공개 설정</label>
            <div className="rb-privacy">
              <button className={!isPublic ? "active" : ""} onClick={() => setIsPublic(false)}>비공개</button>
              <button className={isPublic ? "active" : ""} onClick={() => setIsPublic(true)}>공개</button>
            </div>
            <p className="rb-summary">총 {routeSpots.length}개 장소를 저장합니다.</p>
            <div className="rb-save-actions">
              <button onClick={() => setSaveOpen(false)}>취소</button>
              <button className="primary" onClick={saveRoute}>저장 완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteBuilderPage;
