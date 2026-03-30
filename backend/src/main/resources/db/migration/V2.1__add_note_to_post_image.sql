-- 게시글 이미지에 장소별 메모(note) 컬럼 추가
-- 기존: 모든 entry의 note가 PostEntity.content에 합쳐져 저장됨
-- 개선: entry별 note를 post_image.note에 개별 저장하여 조회 시 장소별로 올바르게 표시
ALTER TABLE post_image ADD COLUMN note TEXT;
