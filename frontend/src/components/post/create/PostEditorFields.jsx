import React from 'react';
import styles from '@/styles/PostCreatePage.module.css';

/*
[PostEditorFields]
- 게시물 작성 계열에서 공통으로 쓰는 제목/본문 입력 블록
- route 게시물은 제목만, 커뮤니티는 제목+본문 형태로 재사용
*/
const PostEditorFields = ({
  title,
  onChangeTitle,
  titleLabel = '제목',
  titlePlaceholder = '',
  showContent = false,
  content = '',
  onChangeContent = () => {},
  contentLabel = '내용',
  contentPlaceholder = '',
}) => {
  return (
    <>
      <section className={styles.formSection}>
        <label htmlFor="post-editor-title" className={styles.sectionLabel}>
          {titleLabel}
        </label>
        <input
          id="post-editor-title"
          className={styles.titleInput}
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
          placeholder={titlePlaceholder}
        />
      </section>

      {showContent ? (
        <section className={styles.formSection}>
          <label htmlFor="post-editor-content" className={styles.sectionLabel}>
            {contentLabel}
          </label>
          <textarea
            id="post-editor-content"
            className={styles.composeTextarea}
            value={content}
            onChange={(event) => onChangeContent(event.target.value)}
            placeholder={contentPlaceholder}
          />
        </section>
      ) : null}
    </>
  );
};

export default PostEditorFields;
