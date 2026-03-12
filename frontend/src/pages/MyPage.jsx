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
    if (tabKey === 'create-route') {
      navigate('/map');
      return;
    }

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

              return (
                <article key={item.key} className={styles.summaryCard}>
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
          <div className={styles.contentHeader}>
            <h3>{currentTabLabel}</h3>
            <p>현재는 mock 없이 연결되어 있어 실제 데이터가 들어오면 이 영역에 바로 반영됩니다.</p>
          </div>

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
        </section>
      </div>
    </MainLayout>
  );
};

export default MyPage;
