import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '@/components/post/PostCard';
import { communityPostsUpdatedEvent, fetchCommunityPosts } from '@/api/communityApi';
import styles from '../../styles/Home.module.css';

const CommunityPostsSection = () => {
  const navigate = useNavigate();
  const [communityPreviewPosts, setCommunityPreviewPosts] = useState([]);

  useEffect(() => {
    // 언마운트 이후 setState 경고를 막기 위한 가드 플래그입니다.
    let alive = true;

    const loadPreviewPosts = async () => {
      try {
        const nextPosts = await fetchCommunityPosts({
          sortBy: 'latest',
          limit: 4,
        });

        if (alive) {
          setCommunityPreviewPosts(nextPosts);
        }
      } catch {
        if (alive) {
          setCommunityPreviewPosts([]);
        }
      }
    };

    const handlePostsUpdated = () => {
      // 홈 미리보기도 동일한 이벤트를 수신해서 커뮤니티 최신 상태를 유지합니다.
      loadPreviewPosts();
    };

    loadPreviewPosts();
    window.addEventListener(communityPostsUpdatedEvent, handlePostsUpdated);

    return () => {
      alive = false;
      window.removeEventListener(communityPostsUpdatedEvent, handlePostsUpdated);
    };
  }, []);

  const moveToCommunityPost = (postId) => {
    const encodedId = encodeURIComponent(String(postId));
    navigate(`/community/${encodedId}`);
  };

  return (
    <section className={styles.section}>
      {/* Home 안에서 이 섹션은 "전체 커뮤니티 페이지로 들어가기 전에"
          최신 글 분위기를 짧게 맛보게 하는 preview 역할입니다. */}
      <div className={styles.sectionHeader}>
        <div>
          <h2>커뮤니티 미리보기</h2>
          <p>자유게시판 최신 글을 홈 하단에서 바로 확인할 수 있습니다.</p>
        </div>
        <button
          type="button"
          className={styles.viewAll}
          onClick={() => navigate('/community')}>
          전체 보기 〉
        </button>
      </div>

      <div className={styles.postList}>
        {communityPreviewPosts.map((post) => (
          // 홈에서는 정보 밀도가 너무 높으면 다른 섹션 흐름을 깨므로,
          // PostCard를 compact 변형으로 사용해 제목/작성자/반응만 빠르게 훑게 합니다.
          <PostCard
            key={post.id}
            variant="compact"
            category="커뮤니티"
            title={post.title}
            author={post.userId}
            publishedAt={post.publishedAt}
            viewCount={post.viewCount}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            onClick={() => moveToCommunityPost(post.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default CommunityPostsSection;
