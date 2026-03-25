import { useCallback, useEffect, useRef, useState } from 'react';
import { loadArtworkTags, searchArtworkTagOptions, ensureLocalArtworkTag } from '@/api/artworkTagApi';
import { createRouteWithArtworkTag } from '@/api/spotRouteApi';

const normalizeTag = (value) => String(value ?? '').replace(/^#/, '').trim();

const pickInitialTagRecommendations = (tags, selectedPlaces) => {
  const preferredTitles = new Set(
    selectedPlaces
      .map((place) => normalizeTag(place.artworkTitle ?? place.workName ?? place.title ?? ''))
      .filter(Boolean),
  );

  const prioritized = tags.filter((tag) => preferredTitles.has(normalizeTag(tag.tagName)));
  const rest = tags.filter((tag) => !preferredTitles.has(normalizeTag(tag.tagName)));
  return [...prioritized, ...rest].slice(0, 3);
};

/**
 * 루트 저장 모달 전용 상태 훅
 *
 * 목적:
 * - 입력/자동완성/저장 버튼 상태를 SpotPage 본문에서 분리해 유지보수성을 높인다.
 * - 태그는 "로컬 DB 태그 확정" 상태여야만 저장 가능하게 강제한다.
 */
export default function useSpotRouteSaveModal({
  selectedPlaces,
  myRoutesCount,
  routeSaveContext,
  onSaved,
}) {
  // 모달 표시/입력 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [routeTagQuery, setRouteTagQuery] = useState('');
  const [selectedArtworkTag, setSelectedArtworkTag] = useState(null);

  // 자동완성/검색 상태
  const [localArtworkTags, setLocalArtworkTags] = useState([]);
  const [tagRecommendations, setTagRecommendations] = useState([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(-1);
  const [isSearchingTags, setIsSearchingTags] = useState(false);

  // 저장 진행/오류 상태
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [saveModalError, setSaveModalError] = useState('');

  const tagInputRef = useRef(null);
  const saveModalRef = useRef(null);
  const tagSearchDebounceRef = useRef(null);
  const isComposing = useRef(false);

  const closeSaveModal = useCallback(() => {
    // 재오픈 시 이전 입력값이 남지 않도록 모달 상태를 완전히 초기화한다.
    setShowSaveModal(false);
    setRouteTitle('');
    setRouteTagQuery('');
    setSelectedArtworkTag(null);
    setTagRecommendations([]);
    setIsTagDropdownOpen(false);
    setActiveTagIndex(-1);
    setSaveModalError('');
  }, []);

  const openSaveModal = useCallback(() => {
    if (selectedPlaces.length < 1) return;
    setRouteTitle(routeSaveContext?.title ?? `루트 ${myRoutesCount + 1}`);
    setRouteTagQuery(routeSaveContext?.artworkTagName ?? '');
    setSelectedArtworkTag(null);
    setTagRecommendations([]);
    setIsTagDropdownOpen(false);
    setActiveTagIndex(-1);
    setSaveModalError('');
    setShowSaveModal(true);
  }, [myRoutesCount, routeSaveContext, selectedPlaces.length]);

  useEffect(() => {
    if (!showSaveModal) return;

    let cancelled = false;

    const prepareTags = async () => {
      // 모달 진입 시 로컬 태그를 먼저 로드해
      // "포커스 시 기본 추천 3개"를 즉시 보여줄 수 있게 준비한다.
      setIsSearchingTags(true);
      setSaveModalError('');

      try {
        const tags = await loadArtworkTags();
        if (cancelled) return;

        setLocalArtworkTags(tags);
        // 입력 포커스 전에 보여줄 기본 추천(최대 3개)을 미리 계산한다.
        // selectedPlaces와 매칭되는 태그를 우선 배치해 첫 추천 정확도를 높인다.
        setTagRecommendations(pickInitialTagRecommendations(tags, selectedPlaces));

        if (!routeSaveContext?.artworkTagName) return;
        const preselected = tags.find((tag) => normalizeTag(tag.tagName) === normalizeTag(routeSaveContext.artworkTagName));
        if (!preselected) return;

        setSelectedArtworkTag(preselected);
        setRouteTagQuery(preselected.tagName);
      } catch (error) {
        if (cancelled) return;
        setSaveModalError(error.message || '작품 태그를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) {
          setIsSearchingTags(false);
        }
      }
    };

    prepareTags();

    return () => {
      cancelled = true;
      if (tagSearchDebounceRef.current) {
        clearTimeout(tagSearchDebounceRef.current);
      }
    };
  }, [showSaveModal, selectedPlaces, routeSaveContext]);

  useEffect(() => {
    if (!showSaveModal) return undefined;

    const closeDropdownOnOutside = (event) => {
      if (saveModalRef.current && !saveModalRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', closeDropdownOnOutside);
    return () => document.removeEventListener('mousedown', closeDropdownOnOutside);
  }, [showSaveModal]);

  const handleSearchArtworkTag = useCallback(async (rawQuery) => {
    const query = normalizeTag(rawQuery);
    if (!query) return;

    setIsSearchingTags(true);
    setSaveModalError('');

    try {
      // 로컬 DB 우선, 미매칭 시 TMDB 후보를 내려주는 공통 API를 사용한다.
      // 화면은 source 구분 없이 후보만 그리되, 선택 시 ensureLocalArtworkTag에서 최종 확정한다.
      const result = await searchArtworkTagOptions(query);
      setTagRecommendations((result.items ?? []).slice(0, 6));
      setIsTagDropdownOpen(true);
      setActiveTagIndex(-1);
    } catch (error) {
      setSaveModalError(error.message || '작품 태그 검색에 실패했습니다.');
      setIsTagDropdownOpen(false);
      setTagRecommendations([]);
    } finally {
      setIsSearchingTags(false);
    }
  }, []);

  const handlePickArtworkTag = useCallback(async (candidate) => {
    setIsSearchingTags(true);
    setSaveModalError('');

    try {
      // TMDB 후보를 직접 저장하지 않고, 로컬 DB 태그로 확정한 결과만 저장에 사용한다.
      // 게시물 태그 자동 확정 흐름은 로컬 artworkId를 필요로 하므로 이 단계가 반드시 선행되어야 한다.
      // 이 규칙을 게시글 검색/작품 탐색/지도 검색과 공통으로 맞추기 위해
      // artworkTagApi의 ensureLocalArtworkTag를 재사용한다.
      const resolvedTag = await ensureLocalArtworkTag(candidate);
      setSelectedArtworkTag(resolvedTag);
      setRouteTagQuery(resolvedTag.tagName);
      setTagRecommendations([resolvedTag]);
      setIsTagDropdownOpen(false);
      setActiveTagIndex(-1);
    } catch (error) {
      setSaveModalError(error.message || '작품 태그 확정에 실패했습니다.');
    } finally {
      setIsSearchingTags(false);
    }
  }, []);

  const handleTagInputFocus = useCallback(() => {
    const defaults = pickInitialTagRecommendations(localArtworkTags, selectedPlaces);
    setTagRecommendations(defaults);
    setIsTagDropdownOpen(defaults.length > 0);
    setActiveTagIndex(-1);
  }, [localArtworkTags, selectedPlaces]);

  const handleTagInputChange = useCallback(
    (value) => {
      setRouteTagQuery(value);
      setSelectedArtworkTag(null);
      setSaveModalError('');

      if (tagSearchDebounceRef.current) {
        clearTimeout(tagSearchDebounceRef.current);
      }

      const normalized = normalizeTag(value);
      if (!normalized) {
        const defaults = pickInitialTagRecommendations(localArtworkTags, selectedPlaces);
        setTagRecommendations(defaults);
        setIsTagDropdownOpen(defaults.length > 0);
        setActiveTagIndex(-1);
        return;
      }

      // 한글 조합 중에는 API 호출을 지연해 불필요한 요청 폭주를 막는다.
      if (isComposing.current) return;
      tagSearchDebounceRef.current = setTimeout(() => {
        handleSearchArtworkTag(normalized);
      }, 300);
    },
    [handleSearchArtworkTag, localArtworkTags, selectedPlaces],
  );

  const handleConfirmSave = useCallback(async () => {
    const title = routeTitle.trim() || routeSaveContext?.title || `루트 ${myRoutesCount + 1}`;
    if (!selectedArtworkTag) {
      setSaveModalError('작품 태그를 먼저 선택해 주세요.');
      tagInputRef.current?.focus();
      return;
    }

    setIsSavingRoute(true);
    setSaveModalError('');

    try {
      const saved = await createRouteWithArtworkTag({
        routeId: routeSaveContext?.mode === 'edit' ? routeSaveContext.routeId : null,
        title,
        selectedTag: selectedArtworkTag,
        spots: selectedPlaces,
      });

      // 저장 성공 후 후속 동작(목록 갱신/토스트/맵 초기화)은 상위 컴포넌트가 결정한다.
      // 훅은 저장 성공 사실만 전달하고, 화면 전환 정책은 페이지가 소유한다.
      await onSaved?.(saved, title);
      closeSaveModal();
    } catch (error) {
      setSaveModalError(error.message || '루트 저장에 실패했습니다.');
    } finally {
      setIsSavingRoute(false);
    }
  }, [closeSaveModal, myRoutesCount, onSaved, routeSaveContext, routeTitle, selectedArtworkTag, selectedPlaces]);

  return {
    showSaveModal,
    routeTitle,
    routeTagQuery,
    tagRecommendations,
    isTagDropdownOpen,
    activeTagIndex,
    isSearchingTags,
    isSavingRoute,
    saveModalError,
    tagInputRef,
    saveModalRef,
    isComposing,
    selectedArtworkTag,
    setRouteTitle,
    setIsTagDropdownOpen,
    setActiveTagIndex,
    openSaveModal,
    closeSaveModal,
    handleTagInputFocus,
    handleTagInputChange,
    handlePickArtworkTag,
    handleConfirmSave,
  };
}
