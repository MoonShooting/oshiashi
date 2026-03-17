import React, { useState } from 'react';
import { ArrowLeft, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { createCommunityPost } from '@/api/communityApi';
import styles from '@/styles/PostCommunityCreatePage.module.css';

// 커뮤니티 전용 작성 페이지 (제목 + 내용 단순 폼)
const PostCommunityCreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 자유게시판 정책: 제목/내용 2개만 채워지면 작성 가능.
  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const createdPost = await createCommunityPost({
        title,
        content,
      });

      // 생성 직후 상세로 보내서 방금 등록한 글을 바로 확인하게 합니다.
      navigate(`/community/${createdPost.id}`);
    } catch (error) {
      setSubmitError(error.message || '게시글 등록에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="community">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/community')}>
            <ArrowLeft size={16} />
            커뮤니티로 돌아가기
          </button>

          <header className={styles.header}>
            <span className={styles.eyebrow}>Community Post</span>
            <h1>커뮤니티 게시글 작성</h1>
            <p>자유게시판 글은 제목과 내용만으로 간단히 작성할 수 있습니다.</p>
          </header>

          <section className={styles.formSection}>
            <label htmlFor="community-post-title">제목</label>
            <input
              id="community-post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 도쿄 첫 방문 동선 후기 공유합니다"
            />
          </section>

          <section className={styles.formSection}>
            <label htmlFor="community-post-content">내용</label>
            <textarea
              id="community-post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="커뮤니티에 공유할 내용을 자유롭게 작성해 주세요."
            />
          </section>

          {submitError ? <p className={styles.submitError}>{submitError}</p> : null}

          <div className={styles.actionRow}>
            <button type="button" className={styles.cancelButton} onClick={() => navigate('/community')}>
              취소
            </button>
            <button
              type="button"
              className={
                canSubmit && !isSubmitting
                  ? styles.submitButton
                  : `${styles.submitButton} ${styles.submitButtonDisabled}`
              }
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}>
              <PenSquare size={16} />
              {isSubmitting ? '등록 중...' : '게시글 등록'}
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default PostCommunityCreatePage;
