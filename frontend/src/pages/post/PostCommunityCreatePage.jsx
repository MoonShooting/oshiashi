import React, { useState } from 'react';
import { AlertCircle, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostEditorFields from '@/components/post/create/PostEditorFields';
import { createCommunityPost } from '@/api/communityApi';
import styles from '@/styles/PostCreatePage.module.css';

/*
[PostCommunityCreatePage]
- 커뮤니티 작성도 게시물 작성과 동일한 공통 입력 컴포넌트(PostEditorFields)로 조립
- 정책: 제목/내용 필수, 생성 성공 시 상세(/community/:id) 이동
*/
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
        <header className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>Community Post</span>
          <h1 className={styles.pageTitle}>커뮤니티 게시글 작성</h1>
          <p className={styles.pageDescription}>
            커뮤니티 작성 화면도 게시물 작성 공통 컴포넌트로 구성했습니다. 제목과 내용을 입력하고
            바로 게시할 수 있습니다.
          </p>
        </header>

        {submitError ? (
          <div className={styles.banner}>
            <AlertCircle size={16} />
            {submitError}
          </div>
        ) : null}

        <PostEditorFields
          title={title}
          onChangeTitle={setTitle}
          titleLabel="제목"
          titlePlaceholder="예: 도쿄 첫 방문 동선 후기 공유합니다"
          showContent
          content={content}
          onChangeContent={setContent}
          contentLabel="내용"
          contentPlaceholder="커뮤니티에 공유할 내용을 자유롭게 작성해 주세요."
        />

        <section className={styles.overviewCard}>
          <div className={styles.overviewLead}>
            <PenSquare size={18} />
            <strong>작성 상태</strong>
          </div>
          <p className={styles.overviewText}>
            제목 {title.trim().length > 0 ? '입력 완료' : '미입력'} · 내용{' '}
            {content.trim().length > 0 ? '입력 완료' : '미입력'}
          </p>
        </section>
      </section>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <div className={styles.bottomSummary}>
            <strong className={styles.bottomSummaryTitle}>커뮤니티 자유게시판</strong>
            <p className={styles.bottomSummaryText}>
              게시 후에는 상세 페이지에서 수정/삭제/댓글 관리를 이어서 할 수 있습니다.
            </p>
          </div>

          <div className={styles.bottomActions}>
            <button type="button" className={styles.secondaryCtaButton} onClick={() => navigate('/community')}>
              취소
            </button>
            <button
              type="button"
              className={
                canSubmit && !isSubmitting
                  ? styles.primaryCtaButton
                  : `${styles.primaryCtaButton} ${styles.primaryCtaButtonDisabled}`
              }
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}>
              <PenSquare size={16} />
              {isSubmitting ? '등록 중...' : '게시글 등록'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostCommunityCreatePage;
