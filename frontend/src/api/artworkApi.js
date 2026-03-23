const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// 작품 탐색 페이지만 TMDB를 직접 조회하도록 분리한 전용 API 계층입니다.
// 이유:
// 1) 페이지는 "작품 검색 결과를 보여준다"는 의도만 알고, 인증/URL/응답 정규화는 이 파일이 맡습니다.
// 2) 작성/조회 페이지는 이번 범위에서 TMDB를 직접 호출하지 않으므로 import 경계가 명확해집니다.
// 3) 이후 TMDB 응답 스키마가 바뀌어도 페이지 컴포넌트 수정 범위를 최소화할 수 있습니다.
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

const fetchTmdbSearch = async ({ path, query, mediaType }) => {
  const { headers } = readTmdbCredential();
  const { url } = buildTmdbUrl(path, { query });
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
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results
    .filter((item) => (item.title ?? item.name ?? '').trim())
    .map((item) => normalizeArtwork(item, mediaType));
};

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

// ArtworkSearchPage가 바로 소비할 수 있는 공통 작품 모델로 변환해 반환합니다.
// movie/tv를 합쳐도 카드 렌더링 규격을 동일하게 유지하려는 목적입니다.
export const searchExternalArtworks = async ({ query, mediaType = 'all' }) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const requests =
    mediaType === 'movie'
      ? [{ path: '/search/movie', mediaType: 'movie' }]
      : mediaType === 'tv'
        ? [{ path: '/search/tv', mediaType: 'tv' }]
        : [
            { path: '/search/movie', mediaType: 'movie' },
            { path: '/search/tv', mediaType: 'tv' },
          ];

  const results = await Promise.all(
    requests.map((request) =>
      fetchTmdbSearch({
        ...request,
        query: normalizedQuery,
      }),
    ),
  );

  return results
    .flat()
    .sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0));
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
