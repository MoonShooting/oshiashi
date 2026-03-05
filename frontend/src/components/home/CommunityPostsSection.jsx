import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import styles from '../../styles/Home.module.css';

const posts = [
  { id: 1, category: '후기', title: '교토 성지 다녀왔습니다! 너무 아름다웠어요', author: '교토러버', time: '2시간 전', views: 1234, likes: 89, comments: 23 },
  { id: 2, category: '질문', title: '카마쿠라 교통편 문의드립니다', author: '첫일본여행', time: '5시간 전', views: 567, likes: 12, comments: 34 },
  { id: 3, category: '정보', title: '벚꽃 시즌 성지순례 추천 일정 공유', author: '여행플래너', time: '12시간 전', views: 3456, likes: 234, comments: 67 },
  { id: 4, category: '후기', title: '도쿄 애니 명소 2박3일 완성 후기', author: '신카이덕후', time: '1일 전', views: 2341, likes: 156, comments: 45 },
];

const CommunityPostsSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>커뮤니티 최신 글</h2>
          <p>다른 덕후들의 생생한 성지순례 후기</p>
        </div>
        <span className={styles.viewAll}>전체 보기 〉</span>
      </div>

      <div className={styles.postList}>
        {posts.map((post) => (
          <article key={post.id} className={styles.postItem}>
            <div className={styles.postThumb} />
            <div className={styles.postBody}>
              <span className={styles.postCategory}>{post.category}</span>
              <h3>{post.title}</h3>
              <div className={styles.postMeta}>
                <span>{post.author}</span>
                <span>· {post.time}</span>
                <span className={styles.statItem}>
                  <Eye className={`${styles.statIcon} ${styles.statIconView}`} strokeWidth={2} />
                  {post.views}
                </span>
                <span className={styles.statItem}>
                  <Heart className={`${styles.statIcon} ${styles.statIconLike}`} strokeWidth={2} />
                  {post.likes}
                </span>
                <span className={styles.statItem}>
                  <MessageCircle className={`${styles.statIcon} ${styles.statIconComment}`} strokeWidth={2} />
                  {post.comments}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommunityPostsSection;
