import React from 'react';
import { ChevronLeft } from 'lucide-react';
import styles from '@/styles/AccountActionLayout.module.css';

// 계정 관련 작업 페이지(회원탈퇴, 비밀번호 변경 등)가
// 같은 상단 소개 + 안내 카드 + 폼 카드 구조를 재사용할 수 있도록 만든 공통 레이아웃입니다.
const AccountActionLayout = ({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  summaryItems = [],
  warningIcon: WarningIcon,
  warningTitle,
  warningDescription,
  warnings = [],
  formIcon: FormIcon,
  formTitle,
  formDescription,
  backLabel = '돌아가기',
  onBack,
  children,
}) => {
  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <ChevronLeft className={styles.backIcon} strokeWidth={2.3} />
          <span>{backLabel}</span>
        </button>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            {BadgeIcon ? <BadgeIcon className={styles.heroBadgeIcon} strokeWidth={2.1} /> : null}
            <span>{badgeLabel}</span>
          </div>

          <div className={styles.heroText}>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {/* 사용자 식별 정보처럼 페이지마다 바뀌는 요약 데이터만 prop으로 받아 렌더링합니다. */}
          {summaryItems.length ? (
            <div className={styles.accountSummary}>
              {summaryItems.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.infoCard}>
          <div className={styles.sectionHeader}>
            {WarningIcon ? <WarningIcon className={styles.sectionIcon} strokeWidth={2} /> : null}
            <div>
              <h3>{warningTitle}</h3>
              <p>{warningDescription}</p>
            </div>
          </div>

          <ul className={styles.warningList}>
            {warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.formCard}>
          <div className={styles.sectionHeader}>
            {FormIcon ? <FormIcon className={styles.sectionIcon} strokeWidth={2} /> : null}
            <div>
              <h3>{formTitle}</h3>
              <p>{formDescription}</p>
            </div>
          </div>

          {/* 실제 입력 폼은 children으로 열어두어 각 작업 페이지가 자유롭게 조합합니다. */}
          {children}
        </article>
      </section>
    </div>
  );
};

export default AccountActionLayout;
