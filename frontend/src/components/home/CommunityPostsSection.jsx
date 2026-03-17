import React from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '@/components/post/PostCard';
import { mockPostSummaries } from '@/data/post/postMockData';
import styles from '../../styles/Home.module.css';

const categoryByPostId = {
  '1': '후기',
  '2': '정보',
  '3': '질문',
};

const posts = mockPostSummaries.map((post) => ({
  id: String(post.id),
  category: categoryByPostId[String(post.id)] ?? '정보',
  title: post.title,
  author: post.userId,
  time: post.publishedAt,
  views: post.viewCount ?? 0,
  likes: post.likeCount ?? 0,
  comments: post.commentCount ?? 0,
}));

const CommunityPostsSection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      {/* Home 안에서 이 섹션은 "전체 커뮤니티 페이지로 들어가기 전에"
          최신 글 분위기를 짧게 맛보게 하는 preview 역할입니다. */}
      <div className={styles.sectionHeader}>
        <div>
          <h2>커뮤니티 최신 글</h2>
          <p>다른 덕후들의 생생한 성지순례 후기</p>
        </div>
        <span className={styles.viewAll}>전체 보기 〉</span>
      </div>

      <div className={styles.postList}>
        {posts.map((post) => (
          // 홈에서는 정보 밀도가 너무 높으면 다른 섹션 흐름을 깨므로,
          // PostCard를 compact 변형으로 사용해 제목/작성자/반응만 빠르게 훑게 합니다.
          <PostCard
            key={post.id}
            variant="compact"
            category={post.category}
            title={post.title}
            author={post.author}
            publishedAt={post.time}
            viewCount={post.views}
            likeCount={post.likes}
            commentCount={post.comments}
            onClick={() => navigate(`/posts/${post.id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default CommunityPostsSection;
