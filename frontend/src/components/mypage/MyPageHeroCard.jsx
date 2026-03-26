import React from 'react';
import { UserRound } from 'lucide-react';
import styles from '@/styles/MyPage.module.css';

const MyPageHeroCard = ({ profile, summaryItems, onShowAchievements }) => (
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

        {/* 프로필 편집/설정은 아직 미완 기능이라 진입 버튼만 숨겨둡니다.
            기능이 준비되면 아래 액션 영역을 다시 복구해 연결합니다.
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
        */}
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
            onClick={isAchievementsCard ? onShowAchievements : undefined}
            onKeyDown={
              isAchievementsCard
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onShowAchievements();
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
);

export default MyPageHeroCard;
