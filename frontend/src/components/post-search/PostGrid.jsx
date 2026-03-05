import React from 'react';
import PostCard from './PostCard';
import styles from '../../styles/PostSearchResultPage.module.css';

const PostGrid = ({ posts, loading }) => {
  return (
    <section className={styles.postGridSection}>
      <div className={styles.postGrid}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonBody}>
                  <div className={styles.skeletonLineLg} />
                  <div className={styles.skeletonLineMd} />
                  <div className={styles.skeletonLineSm} />
                </div>
              </div>
            ))
          : null}
      </div>
    </section>
  );
};

export default PostGrid;
