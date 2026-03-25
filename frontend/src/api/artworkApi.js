import { FetchJson } from '@/api/FetchClient';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_ANIMATION_GENRE_ID = 16;

/*
[artworkApi]
- 작품 탐색 카드 렌더링과 홈 인기 작품 섹션에서 필요한 "작품 정보 조회"를 담당합니다.
- 단, 작품 선택 후 최종 tagName 확정은 artworkTagApi가 맡습니다.

[역할 분리]
- artworkApi: "무슨 작품 카드들을 보여줄까?"
- artworkTagApi: "선택된 작품을 서비스 내부 tagName으로 어떻게 확정할까?"
이렇게 나눠 두어야 조회 로직과 저장/확정 로직이 섞이지 않습니다.
*/
const readTmdbCredential = () => {
  const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();
  // 이 프로젝트는 Vite를 사용하지만, 기존 .env에는 REACT_APP_TMDB_API_KEY가 이미 들어 있습니다.
  // 마이그레이션 비용을 줄이기 위해 VITE_*를 우선 읽고, 없으면 REACT_APP_*도 fallback으로 허용합니다.
  const apiKey =
    import.meta.env.VITE_TMDB_API_KEY?.trim() ??
    import.meta.env.REACT_APP_TMDB_API_KEY?.trim();

  if (accessToken) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams: {},
    };
  }

  if (apiKey) {
    return {
      headers: {},
      queryParams: {
        api_key: apiKey,
      },
    };
  }

  throw new Error('TMDB 인증 정보가 없습니다. VITE_TMDB_ACCESS_TOKEN 또는 VITE_TMDB_API_KEY를 설정해 주세요.');
};

const buildTmdbUrl = (path, params = {}) => {
  const { queryParams } = readTmdbCredential();
  const resolvedParams = new URLSearchParams({
    language: 'ko-KR',
    include_adult: 'false',
    ...queryParams,
    ...params,
  });

  return {
    url: `${TMDB_BASE_URL}${path}?${resolvedParams.toString()}`,
  };
};

const normalizeArtworkTypeName = (mediaType) => {
  if (mediaType === 'movie') return '영화';
  if (mediaType === 'tv') return '드라마';
  return '작품';
};

const normalizeServiceArtworkTypeName = (artworkTypeName) => {
  const normalized = String(artworkTypeName ?? '').trim();
  if (!normalized) return '작품';
  return normalized;
};

const matchesSelectedType = (artworkTypeName, selectedType) => {
  if (!selectedType || selectedType === 'all') return true;

  const normalizedType = normalizeServiceArtworkTypeName(artworkTypeName);
  if (selectedType === 'movie') return normalizedType === '영화';
  if (selectedType === 'tv') return normalizedType === '드라마';
  if (selectedType === 'animation') return normalizedType === '애니메이션';
  return true;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const buildArtworkDescription = (item) => {
  const releasedAt = item.release_date ?? item.first_air_date ?? '';
  const year = releasedAt ? releasedAt.slice(0, 4) : '';
  const overview = item.overview?.trim() || 'TMDB에 등록된 줄거리가 아직 없습니다.';

  return year ? `${year} · ${overview}` : overview;
};

const normalizeArtwork = (item, mediaType) => ({
  id: `${mediaType}-${item.id}`,
  tmdbId: item.id,
  mediaType,
  artworkTypeName: normalizeArtworkTypeName(mediaType),
  title: item.title ?? item.name ?? '제목 미정',
  description: buildArtworkDescription(item),
  imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : '',
  releaseDate: item.release_date ?? item.first_air_date ?? '',
  popularity: Number(item.popularity ?? 0),
});

const resolveImportedArtworkTypeName = (mediaType, genreIds) => {
  if (Array.isArray(genreIds) && genreIds.includes(TMDB_ANIMATION_GENRE_ID)) {
    return '애니메이션';
  }

  if (String(mediaType ?? '').toUpperCase() === 'TV') {
    return '드라마';
  }

  return '영화';
};

const normalizeLocalArtwork = (item) => ({
  id: `local-${item.artworkId}`,
  source: 'LOCAL_DB',
  artworkId: item.artworkId,
  title: item.title ?? '제목 미정',
  artworkTypeName: normalizeServiceArtworkTypeName(item.artworkTypeName),
  description: item.description?.trim() || '이미 서비스에 등록된 작품입니다. 선택하면 바로 태그 검색으로 이어집니다.',
  imageUrl: item.posterUrl ?? '',
});

const normalizeExternalCandidate = (item) => {
  const title = String(item?.title ?? '').trim();
  const posterPath = String(item?.posterPath ?? '').trim();
  if (!title || !posterPath) return null;

  return {
    id: `external-${String(item.mediaType ?? '').toLowerCase()}-${title}-${posterPath}`,
    source: 'TMDB',
    title,
    artworkTypeName: resolveImportedArtworkTypeName(item.mediaType, item.genreIds),
    description:
      item.overview?.trim() || '서비스에 아직 없는 작품입니다. 선택하면 Artwork와 Tag로 먼저 저장한 뒤 검색합니다.',
    imageUrl: item.posterUrl ?? '',
    posterPath,
    overview: item.overview ?? '',
    mediaType: item.mediaType ?? '',
    genreIds: Array.isArray(item.genreIds) ? item.genreIds : [],
  };
};

// 홈 메인 화면은 자동 인기 집계 대신 서비스가 보여주고 싶은 대표작 5개를 고정 큐레이션합니다.
// 검색어 기반 매칭은 동명이작/오탐에 취약하므로 홈 큐레이션은 TMDB ID를 고정합니다.
const FEATURED_HOME_ARTWORKS = [
  {
    tmdbId: 42916,
    mediaType: 'tv',
    fallbackTitle: '토라도라!',
  },
  {
    tmdbId: 42511,
    mediaType: 'tv',
    fallbackTitle: '스즈미야 하루히의 우울',
  },
  {
    tmdbId: 42253,
    mediaType: 'tv',
    fallbackTitle: '케이온!',
  },
  {
    tmdbId: 372058,
    mediaType: 'movie',
    fallbackTitle: '너의 이름은',
  },
  {
    tmdbId: 119100,
    mediaType: 'tv',
    fallbackTitle: '봇치 더 록!',
  },
];

const fetchTmdbDetail = async ({ path, mediaType }) => {
  const { headers } = readTmdbCredential();
  const { url } = buildTmdbUrl(path);
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'TMDB 검색 요청에 실패했습니다.');
  }

  const payload = await response.json();
  return normalizeArtwork(payload, mediaType);
};

// 작품 탐색 페이지는 로컬 Artwork를 우선 보여주고, 없을 때만 외부 후보를 노출합니다.
// 선택 시 이후 흐름이 Tag/게시글 검색으로 이어지므로 "서비스 기준 데이터"를 우선하는 편이 안전합니다.
export const searchArtworkCandidates = async ({ query, mediaType = 'all' }) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  // 작품 탐색 페이지의 원칙:
  // 1) 먼저 서비스 내부 Artwork를 검색한다.
  // 2) 결과가 있으면 그것만 보여준다.
  // 3) 내부 결과가 전혀 없을 때만 외부 후보를 제안한다.
  // 이렇게 해야 사용자가 같은 작품을 여러 방식으로 보지 않고,
  // 선택 시 바로 로컬 흐름으로 이어질 수 있습니다.
  const localResults = toArray(
    await FetchJson(`/api/v1/main/artwork/search?keyword=${encodeURIComponent(normalizedQuery)}`, { method: 'GET' }),
  )
    .map(normalizeLocalArtwork)
    .filter((item) => matchesSelectedType(item.artworkTypeName, mediaType));

  if (localResults.length > 0) {
    return localResults;
  }

  // 내부 결과가 없을 때만 외부 후보를 내려,
  // "서비스에 없는 작품을 새로 채택하는 화면"으로 동작하게 합니다.
  return toArray(
    await FetchJson(`/api/v1/artworks/map/search?query=${encodeURIComponent(normalizedQuery)}`, { method: 'GET' }),
  )
    .map(normalizeExternalCandidate)
    .filter(Boolean)
    .filter((item) => matchesSelectedType(item.artworkTypeName, mediaType));
};

// 홈 "인기 작품" 섹션은 자동 인기순이 아니라 서비스가 직접 고른 대표작 목록을 사용합니다.
// 각 항목은 고정된 TMDB ID를 사용해 항상 같은 작품의 포스터/연도/타입을 보여줍니다.
export const fetchPopularArtworks = async ({ limit = FEATURED_HOME_ARTWORKS.length } = {}) => {
  const results = await Promise.all(
    FEATURED_HOME_ARTWORKS.slice(0, limit).map(async (item) => {
      const path = item.mediaType === 'movie' ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`;
      const matched = await fetchTmdbDetail({
        path,
        mediaType: item.mediaType,
      }).catch(() => null);

      if (!matched) {
        return {
          id: `${item.mediaType}-${item.tmdbId}`,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          artworkTypeName: item.mediaType === 'movie' ? '영화' : '드라마',
          title: item.fallbackTitle,
          description: '',
          imageUrl: '',
          releaseDate: '',
          popularity: 0,
        };
      }

      return {
        ...matched,
        title: item.fallbackTitle,
      };
    }),
  );

  return results;
};
