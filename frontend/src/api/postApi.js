import { FetchClient } from './FetchClient.js';

// 인기/최신 장소 목록 로드
// TODO: /api/v1/posts/top?sort= 파라미터 값 확정 후 수정
fetchHotPlaces: async (sortType = 'popular') => {
  try {
    const data = await FetchClient(`/api/v1/posts/top?sort=${sortType}`);
    set({ displayPlaces: data ?? [], sortType });
  } catch (err) {
    console.warn('[useMapStore] fetchHotPlaces 실패:', err);
  }
};
