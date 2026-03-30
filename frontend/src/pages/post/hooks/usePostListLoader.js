import { useEffect, useRef, useState } from 'react';

/**
 * 게시글 목록 공통 로더 훅
 * - 로딩/에러/목록 상태 관리
 * - 생성/수정/삭제 이벤트 수신 시 동일 조건으로 재조회 (디바운스 적용)
 *
 * 페이지마다 다른 점은 loadPosts 함수와 이벤트 이름만 주입합니다.
 */
const usePostListLoader = ({
  loadPosts,
  updatedEventName,
  fallbackErrorMessage = '목록을 불러오지 못했습니다.',
}) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // 비동기 완료 시점에 언마운트된 컴포넌트 setState를 막기 위한 가드입니다.
    let alive = true;

    const run = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextPosts = await loadPosts();
        if (alive) {
          setPosts(Array.isArray(nextPosts) ? nextPosts : []);
        }
      } catch (error) {
        if (alive) {
          setPosts([]);
          setLoadError(error?.message || fallbackErrorMessage);
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    // ── 성능 최적화: 디바운스 적용 ──
    // 빠른 연속 이벤트(댓글 여러 개 작성, 좋아요 연타 등) 시 재조회를 300ms 디바운스
    const handleUpdated = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        run();
      }, 300);
    };

    run();

    if (updatedEventName && typeof window !== 'undefined') {
      window.addEventListener(updatedEventName, handleUpdated);
    }

    return () => {
      alive = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (updatedEventName && typeof window !== 'undefined') {
        window.removeEventListener(updatedEventName, handleUpdated);
      }
    };
  }, [loadPosts, updatedEventName, fallbackErrorMessage]);

  return {
    posts,
    isLoading,
    loadError,
  };
};

export default usePostListLoader;
