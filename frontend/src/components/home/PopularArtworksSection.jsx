import React, { useEffect, useState } from 'react';
import { CalendarDays, Flame, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularArtworks } from '@/api/artworkApi';
import styles from '../../styles/Home.module.css';

const PopularArtworksSection = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadPopularArtworks = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        // 홈은 실시간 인기 집계보다 서비스가 지금 전면에 보여주고 싶은
        // 대표 애니메이션 5개를 고정 진열하고, 포스터/연도만 TMDB에서 가져옵니다.
        const response = await fetchPopularArtworks({ limit: 5 });
        if (!alive) return;

        setArtworks(response);
      } catch (error) {
        if (!alive) return;

        setArtworks([]);
        setLoadError(error.message || '인기 작품을 불러오지 못했습니다.');
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadPopularArtworks();

    return () => {
      alive = false;
    };
  }, []);

  const handleOpenPosts = (title) => {
    // 홈 카드도 작품 탐색 페이지와 같은 흐름을 따르도록
    // 작품명을 tags query로 넘겨 게시글 검색으로 바로 이어집니다.
    const next = new URLSearchParams();
    next.set('tags', title);
    navigate(`/posts?${next.toString()}`);
  };

  const renderCardBody = () => {
    if (loadError) {
      return <div className={styles.homeStateCard}>{loadError}</div>;
    }

    if (isLoading) {
      return (
        <div className={styles.artworkGrid}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`popular-loading-${index}`} className={styles.artworkCard}>
              <div className={styles.artworkPosterShell}>
                <div className={styles.artworkPosterFallback} />
                <div className={styles.artworkGradient} />
                <div className={styles.artworkRankBadge}>TOP {index + 1}</div>
              </div>
              <div className={styles.artworkInfoPanel}>
                <h3>TMDB 인기 작품을 불러오는 중입니다.</h3>
                <div className={styles.cardStats}>
                  <span className={styles.statItem}>잠시만 기다려 주세요.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.artworkGrid}>
        {artworks.map((art, index) => (
          <button
            key={art.id}
            type="button"
            className={styles.artworkCard}
            onClick={() => handleOpenPosts(art.title)}>
            <div className={styles.artworkPosterShell}>
              {art.imageUrl ? (
                <img src={art.imageUrl} alt="" className={styles.artworkPoster} />
              ) : (
                <div className={styles.artworkPosterFallback} />
              )}
              <div className={styles.artworkGradient} />
              <div className={styles.artworkRankBadge}>TOP {index + 1}</div>
            </div>

            <div className={styles.artworkInfoPanel}>
              <h3>{art.title}</h3>
              <div className={styles.cardStats}>
                <span className={styles.statItem}>
                  <CalendarDays className={`${styles.statIcon} ${styles.statIconView}`} strokeWidth={2} />
                  {art.releaseDate ? art.releaseDate.slice(0, 4) : '연도 미정'}
                </span>
                <span className={styles.statItem}>
                  <Flame className={`${styles.statIcon} ${styles.statIconLike}`} strokeWidth={2} />
                  인기 {Math.round(art.popularity)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>인기 작품</h2>
          <p>지금 메인에서 보여줄 대표 애니메이션 5개만 먼저 소개하고, 더 많은 작품은 탐색 페이지로 이어집니다.</p>
        </div>
        <button type="button" className={styles.viewAll} onClick={() => navigate('/artworks')}>
          <Search size={16} />
          <span>전체 보기</span>
        </button>
      </div>

      {renderCardBody()}
    </section>
  );
};

export default PopularArtworksSection;
