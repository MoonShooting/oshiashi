import { create } from 'zustand';

/**[전역으로 지도 호출 관리하여 랜더링 시 매끄럽게 바로 전환되기 위함.]
 * 핀 목록, 최적 경로, 검색 결과 등 지도와 관련된 모든 데이터를 여기서 관리합니다.
 */
export const useMapStore = create((set) => ({
  displayPlaces: [], // 지도페이지 첫 화면에 보여줄 핀들
  selectedPlaces: [], // 사용자가 담은 장소들 (핀 목록)
  optimizedPath: null, // 최단 거리 계산 결과
  previewLocation: null, // 검색 리스트 클릭 시 잠깐 보여줄 위치

  //가져다 쓸 함수 목록
  // 장소 추가 (Search.jsx에서 호출)
  addPlace: (place) =>
    set((state) => ({
      selectedPlaces: [...state.selectedPlaces, place],
    })),

  // 순서 변경 (Route Create Page에서 드래그 끝났을 때 호출)
  reorderPlaces: (newList) => set({ selectedPlaces: newList }),

  // 장소 삭제
  removePlace: (id) =>
    set((state) => ({
      selectedPlaces: state.selectedPlaces.filter((p) => p.id !== id),
    })),

  // 미리보기 위치 설정 (지도 부드러운 이동용)
  setPreview: (loc) => set({ previewLocation: loc }),

  // 초기화 (새로운 경로 만들기 등)
  clearMap: () => set({ selectedPlaces: [], optimizedPath: null }),

  // 서버에서 인기순/최신순 10개 가져오기(popular | update)
  fetchHotPlaces: async (sortType = 'popular') => {
    try {
      const data = await FetchClient(`/api/v1/posts/top?sort=${sortType}`);
      set({ displayPlaces: data });
    } catch (error) {
      console.warn('⚠️ 백엔드 연결 실패! 테스트용 데이터를 로드합니다.');

      // 임시 처리: 서버 에러 시 보여줄 가짜 데이터 10개
      const dummyData = Array.from({ length: 10 }).map((_, i) => ({
        id: `dummy-${i}`,
        title: `테스트 성지 ${i + 1} (${sortType === 'popular' ? '인기순' : '최신순'})`,
        position: {
          lat: 35.6812 + (Math.random() - 0.5) * 0.01,
          lng: 139.7671 + (Math.random() - 0.5) * 0.01,
        },
        description: '백엔드 연결 시 실제 데이터로 교체됩니다.',
      }));

      set({ displayPlaces: dummyData });
    }
  },

  // 작품명 + 타입으로 검색
  searchByWork: async (workName, typeId) => {
    // 검색 로직 구현
  },
}));
