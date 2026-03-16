import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import styles from '@/styles/PostCard.module.css';

/**
 * 현재 고려사항
 * - 이 파일은 여러 화면에서 재사용되는 "게시글 공통 카드"이므로 components/post 아래에 둡니다.
 * - 적용 대상은 게시글 성격의 화면만입니다. 작품 카드(Artwork)는 별도 디자인/도메인으로 봅니다.
 * - 스타일 파일은 프로젝트의 기존 패턴에 맞춰 styles/ 아래 module css를 사용합니다.
 */

// 통계 숫자는 페이지마다 같은 형식으로 보여주는 편이 읽기 쉬워서,
// 카드 안에서 직접 포맷을 통일합니다. (예: 2310 -> 2,310)
const formatCount = (value) => {
  if (value === null || value === undefined) return null;
  return value.toLocaleString();
};

/**
 * PostCard
 *
 * 게시글 성격의 데이터를 여러 페이지에서 공통으로 보여주기 위한 카드입니다.
 * "게시글 검색 결과", "메인 커뮤니티 미리보기", 이후 "마이페이지 내 게시글/북마크"가
 * 같은 구조를 공유할 수 있도록 공통 뼈대를 담당합니다.
 *
 * variant 역할
 * - default: 정보량이 많은 기본 카드. 검색 결과/커뮤니티 목록에 적합
 * - compact: 높이를 줄인 축약 카드. 메인 홈의 미리보기 섹션에 적합
 * - minimal: 가장 단순한 카드. 마이페이지의 요약 리스트처럼 좁은 영역에 적합
 *
 * 현재는 게시글 검색 결과와 홈 커뮤니티 미리보기에 연결되어 있고,
 * 이후 마이페이지의 "내 게시글/북마크"도 같은 카드 체계를 공유하는 것을 목표로 합니다.
 */
const PostCard = ({
  title,
  excerpt = '',
  category = '',
  author = '',
  publishedAt = '',
  tags = [],
  viewCount,
  likeCount,
  commentCount,
  imageUrl = '',
  variant = 'default',
  className = '',
  onClick,
}) => {
  const hasImage = Boolean(imageUrl);

  // 카드의 공통 외형(styles.card)에 변형 스타일(styles.default 등)을 합쳐
  // 페이지마다 같은 컴포넌트를 쓰되 모양만 바꿔 쓸 수 있게 합니다.
  const rootClassName = [
    styles.card,
    styles[variant],
    onClick ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* 이미지가 있으면 실제 썸네일을, 없으면 공통 그라디언트 placeholder를 보여줍니다.
          이렇게 해두면 API가 아직 이미지 URL을 주지 않아도 카드 레이아웃이 무너지지 않습니다. */}
      <div className={styles.media}>
        {hasImage ? (
          <img src={imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true" />
        )}
      </div>

      <div className={styles.body}>
        {/* category는 홈처럼 "후기/질문/정보"를 짧게 강조할 때만 사용합니다.
            없는 페이지에서는 렌더링하지 않으므로 같은 카드로 여러 화면을 커버할 수 있습니다. */}
        {category ? <span className={styles.category}>{category}</span> : null}
        <h3 className={styles.title}>{title}</h3>

        {/* excerpt는 검색 결과처럼 본문 요약이 필요할 때만 보여줍니다.
            compact/minimal 변형에서는 CSS에서 줄 수를 줄이거나 숨겨 정보량을 조절합니다. */}
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}

        {/* 태그 영역은 검색 결과 페이지에서 특히 중요합니다.
            현재 카드가 어떤 검색 문맥에 속하는지 사용자가 한눈에 이해하도록 도와줍니다. */}
        {tags.length > 0 ? (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* footer는 "누가 썼는지"와 "얼마나 반응이 있었는지"를 모아 보여주는 영역입니다.
            페이지마다 상단 정보는 달라도, 하단 메타 정보는 공통 패턴으로 유지하려는 의도입니다. */}
        <div className={styles.footer}>
          <div className={styles.authorRow}>
            <span className={styles.authorAvatar} aria-hidden="true" />
            <span className={styles.authorText}>
              {author}
              {publishedAt ? <span className={styles.dot}>·</span> : null}
              {publishedAt ? <span>{publishedAt}</span> : null}
            </span>
          </div>

          {/* 조회/좋아요/댓글은 값이 있는 것만 렌더링합니다.
              그래서 홈 미리보기, 검색 결과, 마이페이지 요약처럼 필요한 정보 조합만 넘기면 됩니다. */}
          <div className={styles.stats}>
            {viewCount !== undefined ? (
              <span className={styles.stat}>
                <Eye className={styles.statIcon} strokeWidth={2} />
                {formatCount(viewCount)}
              </span>
            ) : null}
            {likeCount !== undefined ? (
              <span className={styles.stat}>
                <Heart className={`${styles.statIcon} ${styles.likeIcon}`} strokeWidth={2} />
                {formatCount(likeCount)}
              </span>
            ) : null}
            {commentCount !== undefined ? (
              <span className={styles.stat}>
                <MessageCircle className={`${styles.statIcon} ${styles.commentIcon}`} strokeWidth={2} />
                {formatCount(commentCount)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      // 클릭 가능한 카드인 경우 button으로 렌더링해 접근성과 상호작용 의도를 함께 보장합니다.
      <button type="button" className={rootClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  // 상세 이동이 아직 없는 화면에서는 article로 렌더링해 "읽기용 카드" 역할만 수행합니다.
  return <article className={rootClassName}>{content}</article>;
};

export default PostCard;
