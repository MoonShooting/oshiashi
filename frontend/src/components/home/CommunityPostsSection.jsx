import React from 'react';
import PostCard from '@/components/post/PostCard';
import styles from '../../styles/Home.module.css';

// 홈 화면에서 "커뮤니티 최신 글" 영역을 확인하기 위한 목업 데이터입니다.
// 이 섹션은 검색 결과 페이지와 달리, 최신 글을 짧게 미리 보여주는 목적의 축약형 리스트입니다.
const posts = [
  { id: 1, category: '후기', title: '교토 성지 다녀왔습니다! 너무 아름다웠어요', author: '교토러버', time: '2시간 전', views: 1234, likes: 89, comments: 23 },
  { id: 2, category: '질문', title: '카마쿠라 교통편 문의드립니다', author: '첫일본여행', time: '5시간 전', views: 567, likes: 12, comments: 34 },
  { id: 3, category: '정보', title: '벚꽃 시즌 성지순례 추천 일정 공유', author: '여행플래너', time: '12시간 전', views: 3456, likes: 234, comments: 67 },
  { id: 4, category: '후기', title: '도쿄 애니 명소 2박3일 완성 후기', author: '신카이덕후', time: '1일 전', views: 2341, likes: 156, comments: 45 },
];

const CommunityPostsSection = () => {
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
          />
        ))}
      </div>
    </section>
  );
};

export default CommunityPostsSection;
