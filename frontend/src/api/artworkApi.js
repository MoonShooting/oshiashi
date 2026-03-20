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

const buildSearchUrl = (path, query, extraParams = {}) => {
  const { queryParams } = readTmdbCredential();
  const params = new URLSearchParams({
    language: 'ko-KR',
    include_adult: 'false',
    query,
    ...queryParams,
    ...extraParams,
  });

  return {
    url: `${TMDB_BASE_URL}${path}?${params.toString()}`,
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

const fetchTmdbSearch = async ({ path, query, mediaType }) => {
  const { headers } = readTmdbCredential();
  const { url } = buildSearchUrl(path, query);
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
