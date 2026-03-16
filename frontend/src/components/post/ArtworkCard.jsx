import React from 'react';
import { Film } from 'lucide-react';
import styles from '@/styles/ArtworkCard.module.css';

/**
 * 현재 고려사항
 * - 작품 카드는 게시글 카드와 정보 구조가 달라 PostCard에 합치지 않고 별도 컴포넌트로 유지합니다.
 * - 이 파일은 작품 탐색 페이지뿐 아니라 이후 홈의 작품 미리보기 변형에도 재사용될 수 있어 components 아래에 둡니다.
 * - 스타일은 프로젝트의 현재 패턴에 맞춰 styles/ 아래 module css로 분리합니다.
 */

/**
 * ArtworkCard
 *
 * 작품 카드에서 공통으로 필요한 "대표 비주얼 영역 + 작품 유형 + 제목 + 설명" 구조를 담당합니다.
 * 현재는 ArtworkSearchPage의 기본 카드로 사용하고, 페이지는 검색 상태/필터/이동 흐름만 관리합니다.
 */
const ArtworkCard = ({
  title,
  artworkTypeName,
  description = '',
  imageUrl = '',
  className = '',
  onClick,
}) => {
  const hasImage = Boolean(imageUrl);

  const rootClassName = [styles.card, className].filter(Boolean).join(' ');

  const content = (
    <>
      <div className={styles.media}>
        {hasImage ? (
          <img src={imageUrl} alt="" className={styles.poster} />
        ) : (
          <div className={styles.posterFallback} aria-hidden="true">
            <Film className={styles.posterFallbackIcon} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.typeBadge}>{artworkTypeName}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </>
  );

  if (onClick) {
    return (
      // 작품 카드는 현재 목록 선택을 위한 상호작용 요소이므로 button으로 렌더링합니다.
      <button type="button" className={rootClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className={rootClassName}>{content}</article>;
};

export default ArtworkCard;
