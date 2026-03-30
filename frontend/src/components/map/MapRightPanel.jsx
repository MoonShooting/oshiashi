/**
 * @file MapRightPanel.jsx
 * @description 장소 클릭 시 우측에 나타나는 상세 패널
 *
 * 작품 이미지 우선순위:
 *  1) pin.artwork.posterUrl / pin.sceneImageUrl (백엔드 직접 제공)
 *  2) artworkTitle 키워드로 내부 DB 검색 → posterUrl
 *  3) Google Places API textSearch → 위치 사진
 *  4) 색상 placeholder
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { X, ExternalLink, Plus } from 'lucide-react';
import styles from '@/styles/MapRightPanel.module.css';
import { PIN_COLOR } from '@/constants/mapConstants';
import { getPublicPostsByTag } from '@/api/postApi';
import { getArtworkPosterByTitle } from '@/api/mapApi';

export default function MapRightPanel({ pin, onClose }) {
  const navigate = useNavigate();
  const placesLib = useMapsLibrary('places');

  const [publicPosts, setPublicPosts] = useState([]);
  const [posterUrl, setPosterUrl] = useState(null);

  // 작품 포스터 이미지 결정
  // 1단계: 백엔드 직접 제공
  // 2단계: 내부 Artwork DB 검색
  // 3단계: Google Places API 위치 사진
  useEffect(() => {
    if (!pin) {
      setPosterUrl(null);
      return;
    }

    const directUrl = pin.artwork?.posterUrl ?? pin.sceneImageUrl ?? null;
    if (directUrl) {
      setPosterUrl(directUrl);
      return;
    }

    // 이하 단계들은 직접 URL이 없을 때만 시도
    setPosterUrl(null);
    const artworkTitle = pin.artworkTitle || pin.artwork?.title || '';

    // 2단계: 내부 DB 검색
    if (artworkTitle) {
      getArtworkPosterByTitle(artworkTitle)
        .then((url) => {
          if (url) {
            setPosterUrl(url);
          }
        })
        .catch(() => {});
    }
  }, [pin?.placeId]);

  // 3단계: Places API — 내부 DB에서도 이미지를 못 찾았을 때 위치 사진 조회
  useEffect(() => {
    if (!placesLib || !pin?.latitude || !pin?.longitude || posterUrl) return;

    let cancelled = false;
    const container = document.createElement('div');
    const service = new placesLib.PlacesService(container);

    service.textSearch(
      {
        query: pin.name || pin.artworkTitle || '',
        location: { lat: Number(pin.latitude), lng: Number(pin.longitude) },
        radius: 200,
      },
      (results, status) => {
        if (cancelled) return;
        if (status === 'OK' && results?.[0]?.photos?.[0]) {
          const url = results[0].photos[0].getUrl({ maxWidth: 400, maxHeight: 200 });
          setPosterUrl(url);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [placesLib, pin?.placeId]); // posterUrl 제외 — 변경 시 재실행 불필요, early-return으로 충분

  //  공개 게시글 조회
  useEffect(() => {
    const title = pin?.artworkTitle || pin?.artwork?.title;
    if (!title) {
      setPublicPosts([]);
      return;
    }
    getPublicPostsByTag(title)
      .then(setPublicPosts)
      .catch(() => setPublicPosts([]));
  }, [pin?.placeId]);

  if (!pin) return null;

  const pinConfig = PIN_COLOR[pin.mediaType] || PIN_COLOR.DEFAULT;
  const artworkTitle = pin.artworkTitle || pin.artwork?.title || '';

  const googleMapsUrl = pin.latitude != null && pin.longitude != null ? `https://maps.google.com/?q=${pin.latitude},${pin.longitude}` : null;

  return (
    <aside className={styles.detailPanel}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span
            className={styles.suggestionBadge}
            style={{
              backgroundColor: pinConfig.background,
              borderColor: pinConfig.border,
              color: pinConfig.glyph,
            }}>
            {pin.mediaType || '작품'}
          </span>
          <button className={styles.closeButton} onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <h2 className={styles.title}>{pin.name}</h2>
        {pin.address && <p className={styles.address}>{pin.address}</p>}
      </header>

      <div className={styles.scrollContent}>
        {/* 관련 작품 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>관련 작품</span>
            <span className={styles.dim}>{artworkTitle}</span>
          </div>

          <div className={styles.imageCard}>
            {posterUrl ? (
              <img src={posterUrl} alt={artworkTitle} className={styles.imageCardImg} />
            ) : (
              <div className={styles.imageCardEmpty}>등록된 장면 이미지가 없습니다.</div>
            )}
            <div className={styles.imageOverlay}>
              <p>관련 게시글: {pin.relatedPostCount ?? 0}개</p>
              <span className={styles.subInfo}>{pin.mediaType} 명장면 확인</span>
            </div>
          </div>
        </section>

        {/* 공개 게시글 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span>공개 게시글</span>
            <span className={styles.dim}>{publicPosts.length}개</span>
          </div>
          <ul className={styles.postList}>
            {publicPosts.length === 0 ? (
              <p className={styles.emptyText}>등록된 게시글이 없습니다.</p>
            ) : (
              publicPosts.map((post) => {
                const postId = post.postId ?? post.id;
                const author = post.userNickname ?? post.userName ?? post.author ?? '익명';
                const date = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                    })
                  : '';
                const thumb = post.thumbnailUrl || (Array.isArray(post.imageUrl) ? post.imageUrl[0] : null);
                return (
                  <li
                    key={postId}
                    className={styles.postItem}
                    onClick={() => navigate(`/posts/${postId}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/posts/${postId}`)}>
                    {thumb && <img src={thumb} alt="" className={styles.postThumb} />}
                    <div className={styles.postText}>
                      <strong>{post.title || '(제목 없음)'}</strong>
                      <span>
                        {author}
                        {date ? ` · ${date}` : ''}
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>

      <footer className={styles.footer}>
        <button className={styles.primaryBtn} onClick={() => googleMapsUrl && window.open(googleMapsUrl, '_blank')} disabled={!googleMapsUrl}>
          구글 지도에서 보기 <ExternalLink size={16} />
        </button>
        <button className={styles.secondaryBtn} onClick={() => navigate('/spot')}>
          루트에 추가 <Plus size={16} />
        </button>
      </footer>
    </aside>
  );
}
