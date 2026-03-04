import React, { useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";
import MyProfileSummary from "../components/mypage/MyProfileSummary";
import MyPageTabs from "../components/mypage/MyPageTabs";
import MyRouteGrid from "../components/mypage/MyRouteGrid";

const statCards = [
  { label: "내 루트", value: "12", icon: "🗺️" },
  { label: "내 게시글", value: "24", icon: "📝" },
  { label: "북마크", value: "8", icon: "🔖" },
  { label: "업적", value: "15", icon: "🏆" },
];

const tabs = ["내 루트", "내 게시글", "북마크", "업적", "루트 생성"];

const routeCards = [
  {
    title: "도쿄 애니메이션 성지순례 3박 4일",
    visibility: "공개",
    date: "2026-02-20",
    spots: "12 스팟",
    saves: "45",
  },
  {
    title: "오사카 덕질 루트",
    visibility: "비공개",
    date: "2026-02-15",
    spots: "8 스팟",
    saves: "23",
  },
  {
    title: "서울 K-POP 명소 투어",
    visibility: "공개",
    date: "2026-02-10",
    spots: "15 스팟",
    saves: "67",
  },
];

function MyPage({ onNavigate, onGoCreatePost }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("내 루트");

  return (
    <div className="my-page">
      <SharedHeader
        onMenuClick={() => setMenuOpen((prev) => !prev)}
        searchPlaceholder="작품명, 장소, 태그 검색..."
        rightSlot={
          <div className="my-header-right">
            <button className="my-share-btn" onClick={onGoCreatePost}>+ 루트 공유</button>
            <button className="my-avatar-btn" aria-label="profile" />
          </div>
        }
      />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey="mypage"
        onNavigate={onNavigate}
      />

      <main className="my-main">
        <MyProfileSummary statCards={statCards} />
        <MyPageTabs tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />
        <MyRouteGrid routeCards={routeCards} />
      </main>
    </div>
  );
}

export default MyPage;
