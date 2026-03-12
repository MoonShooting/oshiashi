import React, { useMemo, useState } from 'react';
import { Bookmark, FileText, MapPinned, Pencil, Settings, Trophy, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/MyPage.module.css';

const TAB_ITEMS = [
  { key: 'routes', label: '내 루트' },
  { key: 'posts', label: '내 게시글' },
  { key: 'bookmarks', label: '북마크' },
  { key: 'achievements', label: '업적' },
  { key: 'create-route', label: '루트 생성' },
];

const SUMMARY_ITEMS = [
  { key: 'routes', label: '내 루트', icon: MapPinned },
  { key: 'posts', label: '내 게시글', icon: FileText },
  { key: 'bookmarks', label: '북마크', icon: Bookmark },
  { key: 'achievements', label: '업적', icon: Trophy },
];

const MyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('routes');

  // mock 데이터를 두지 않기 위해 사용자 정보는 store 값만 사용하고,
  // 아직 API가 연결되지 않은 통계/목록은 0과 빈 상태 UI로 표현합니다.
  const profile = useMemo(
    () => ({
      displayName: user?.nickname || user?.userId || '사용자',
      userId: user?.userId || '-',
      email: user?.email || '-',
      joinedAt: user?.createdAt ? String(user.createdAt).slice(0, 10) : '-',
    }),
    [user],
  );

  const summaryItems = useMemo(
    () =>
      SUMMARY_ITEMS.map((item) => ({
        ...item,
        value: 0,
      })),
    [],
  );

  const handleTabClick = (tabKey) => {
    // 루트 생성은 마이페이지 내부 탭 콘텐츠가 아니라 별도 작성 화면으로 이어지는 진입점입니다.
    if (tabKey === 'create-route') {
      navigate('/map');
      return;
    }

    // 업적 탭은 전용 업적 페이지로 바로 이동시키지 않고,
    // 마이페이지 안에서 "나의 업적 미리보기"를 먼저 보여주도록 유지합니다.
    setActiveTab(tabKey);
  };

  const currentTabLabel = TAB_ITEMS.find((tab) => tab.key === activeTab)?.label ?? '내 루트';

  return (
    <MainLayout isMapPage={false} activeMenuKey="mypage">
      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroGlowStart} />
          <div className={styles.heroGlowEnd} />

          <div className={styles.profileSection}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarCircle}>
                <UserRound className={styles.avatarIcon} strokeWidth={1.9} />
              </div>
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileHeader}>
                <h2 className={styles.profileName}>{profile.displayName}</h2>
              </div>

              <div className={styles.profileMeta}>
                <p>ID: {profile.userId}</p>
                <p>Email: {profile.email}</p>
                <p>가입일: {profile.joinedAt}</p>
              </div>

              <div className={styles.profileActions}>
                <button type="button" className={styles.primaryActionButton}>
                  <Pencil className={styles.actionIcon} strokeWidth={2} />
                  <span>프로필 편집</span>
                </button>

                <button type="button" className={styles.secondaryActionButton}>
                  <Settings className={styles.actionIcon} strokeWidth={2} />
                  <span>설정</span>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            {summaryItems.map((item) => {
              const Icon = item.icon;
              const isAchievementsCard = item.key === 'achievements';

              return (
                <article
                  key={item.key}
                  className={isAchievementsCard ? `${styles.summaryCard} ${styles.summaryCardLink}` : styles.summaryCard}
                  role={isAchievementsCard ? 'button' : undefined}
                  tabIndex={isAchievementsCard ? 0 : undefined}
                  // 상단 업적 요약 카드는 업적 전용 페이지로 보내지 않고,
                  // 같은 화면에서 업적 preview 섹션을 활성화하는 용도로만 사용합니다.
                  onClick={isAchievementsCard ? () => setActiveTab('achievements') : undefined}
                  onKeyDown={
                    isAchievementsCard
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveTab('achievements');
                          }
                        }
                      : undefined
                  }>
                  <div className={styles.summaryHeader}>
                    <span>{item.label}</span>
                    <Icon className={styles.summaryIcon} strokeWidth={2} />
                  </div>
                  <strong className={styles.summaryValue}>{item.value}</strong>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.tabCard}>
          <div className={styles.tabList} role="tablist" aria-label="마이페이지 섹션">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={activeTab === tab.key ? styles.tabButtonActive : styles.tabButton}
                onClick={() => handleTabClick(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.contentCard}>
          <div className={styles.contentHeaderRow}>
            <div className={styles.contentHeader}>
              <h3>{currentTabLabel}</h3>
              <p>현재는 mock 없이 연결되어 있어 실제 데이터가 들어오면 이 영역에 바로 반영됩니다.</p>
            </div>

            {activeTab === 'achievements' ? (
              // 업적 탭이 열렸을 때만 "전체보기" 버튼을 노출해
              // preview -> 전용 페이지 이동 흐름이 분명하게 보이도록 합니다.
              <button type="button" className={styles.previewActionButton} onClick={() => navigate('/achievements')}>
                업적 전체보기
              </button>
            ) : null}
          </div>

          {activeTab === 'achievements' ? (
            // 마이페이지의 업적 영역은 상세 목록이 아니라 preview 전용입니다.
            // 실제 전체 업적 목록은 /achievements 전용 페이지에서 보여주도록 역할을 분리했습니다.
            <div className={styles.achievementPreview}>
              <div className={styles.emptyIconWrap}>
                <Trophy className={styles.emptyIcon} strokeWidth={2} />
              </div>

              <div className={styles.achievementPreviewText}>
                <strong>나의 업적 미리보기</strong>
                <p>업적 요약은 이 영역에서 먼저 확인하고, 상세 업적 목록은 `업적 전체보기` 버튼으로 전용 페이지에서 이어서 확인합니다.</p>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                {activeTab === 'routes' ? (
                  <MapPinned className={styles.emptyIcon} strokeWidth={2} />
                ) : activeTab === 'posts' ? (
                  <FileText className={styles.emptyIcon} strokeWidth={2} />
                ) : activeTab === 'bookmarks' ? (
                  <Bookmark className={styles.emptyIcon} strokeWidth={2} />
                ) : (
                  <Trophy className={styles.emptyIcon} strokeWidth={2} />
                )}
              </div>

              <strong>{currentTabLabel} 데이터가 아직 없습니다.</strong>
              <p>API가 연결되면 별도의 mock 교체 없이 이 화면 구조에 그대로 출력되도록 만들었습니다.</p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default MyPage;
