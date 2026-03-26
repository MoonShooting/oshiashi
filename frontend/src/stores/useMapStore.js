/**
 * @file useMapStore.js
 * @description 지도 관련 전역 상태 관리 (Zustand)
 *
 * [activeMediaTypes]
 * - DB artwork_type_name 값 배열 (ex: ['애니메이션', '드라마'])
 * - mapConstants.MEDIA_TYPE 값과 동일한 한국어 문자열
 * - 복수 선택 지원 (toggle 방식)
 */

import { create } from 'zustand';
import { FetchClient } from '@/api/FetchClient.js';
import { getPlaces, searchPlaces } from '@/api/mapApi.js';

const resolvePlaceKey = (place) => place?.placeId ?? place?.spotId ?? place?.id ?? null;

export const useMapStore = create((set, get) => ({
  displayPlaces: [], // 지도에 표시할 MapPlaceResponse[] 목록
  selectedPlaces: [], // 사용자가 경로에 담은 장소들
  optimizedPath: null, // 최단 거리 계산 결과
  previewLocation: null, // 검색 리스트 클릭 시 잠깐 보여줄 위치

  // 필터 상태 — DB artwork_type_name 값 배열 (복수 선택)
  activeMediaTypes: [], // 예: ['애니메이션', '드라마']
  sortType: 'popular', // 현재 정렬 기준

  //  미디어 타입 토글 (이미 있으면 제거, 없으면 추가)
  toggleMediaType: (type) =>
    set((state) => ({
      activeMediaTypes: state.activeMediaTypes.includes(type) ? state.activeMediaTypes.filter((t) => t !== type) : [...state.activeMediaTypes, type],
    })),

  // 미디어 타입 필터 전체 해제
  clearMediaFilter: () => set({ activeMediaTypes: [] }),

  //  장소 담기 (placeId 기준 중복 방지)
  addPlace: (place) =>
    set((state) => {
      const nextPlaceKey = resolvePlaceKey(place);
      if (nextPlaceKey != null && state.selectedPlaces.some((p) => resolvePlaceKey(p) === nextPlaceKey)) return state;
      return { selectedPlaces: [...state.selectedPlaces, place] };
    }),

  // 순서 변경 (드래그 앤 드롭)
  reorderPlaces: (newList) => set({ selectedPlaces: newList }),

  // 기존 route를 그대로 편집하거나 북마크 route를 복사 편집할 때는
  // 현재 선택 장소 배열을 한 번에 교체해야 visitOrder가 보존됩니다.
  replacePlaces: (places) =>
    set({
      selectedPlaces: Array.isArray(places) ? places : [],
      optimizedPath: null,
    }),

  // 장소 삭제 (placeId 기준)
  removePlace: (placeId) =>
    set((state) => ({
      selectedPlaces: state.selectedPlaces.filter((p) => resolvePlaceKey(p) !== placeId),
    })),

  // 미리보기 위치 설정
  setPreview: (loc) => set({ previewLocation: loc }),

  // 지도 상태 초기화
  clearMap: () => set({ selectedPlaces: [], optimizedPath: null }),

  // 전체 장소 초기 로드
  fetchAllPlaces: async () => {
    try {
      const data = await getPlaces();
      set({ displayPlaces: data ?? [] });
    } catch (err) {
      console.warn('[useMapStore] fetchAllPlaces 실패:', err);
    }
  },

  // 인기/최신 장소 목록 로드
  // TODO: /api/v1/posts/top?sort= 파라미터 값 확정 후 수정
  fetchHotPlaces: async (sortType = 'popular') => {
    try {
      const data = await FetchClient(`/api/v1/posts/top?sort=${sortType}`);
      set({ displayPlaces: data ?? [], sortType });
    } catch (err) {
      console.warn('[useMapStore] fetchHotPlaces 실패:', err);
    }
  },

  // 작품명 + 미디어 타입으로 장소 검색
  // workName: 작품명
  // mediaType: DB artwork_type_name 값 ('영화', '드라마', '애니메이션') 또는 null
  searchByWork: async (workName, mediaType = null) => {
    try {
      const data = await searchPlaces(workName, mediaType);
      set({ displayPlaces: data ?? [] });
      return data ?? [];
    } catch (err) {
      console.warn('[useMapStore] searchByWork 실패:', err);
      return [];
    }
  },
}));
