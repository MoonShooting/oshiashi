import { FetchJson } from '@/api/FetchClient';
import { importArtwork, searchMapArtworks } from '@/api/mapApi';

/*
[artworkTagApi]
- "작품 후보를 어떻게 찾고, 최종적으로 어떤 tagName을 서비스에서 사용할 것인가"를
  프론트 전체에서 공통으로 맞추기 위한 API 모듈입니다.
- 이 파일의 핵심 책임은 3가지입니다.
  1) 로컬 Tag 목록/후보를 조회한다.
  2) 로컬에 없으면 외부 작품 후보를 가져온다.
  3) 사용자가 선택한 후보를 반드시 로컬 Tag로 확정한다.

[왜 분리했는가]
- 작품 탐색 페이지
- 게시글 검색 페이지
- 루트 저장 모달의 태그 검색
위 세 곳이 모두 같은 정책을 써야 하는데, 페이지마다 따로 구현하면
"어떤 화면에서는 TMDB 원본 제목 사용, 어떤 화면에서는 로컬 tagName 사용" 같은
불일치가 생기기 쉽습니다.
- 그래서 "작품 선택 -> 로컬 Tag 확정"을 한 곳으로 모읍니다.
*/

const text = (value) => String(value ?? '').trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};

const unwrapObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (value.data && typeof value.data === 'object') return value.data;
  if (value.result && typeof value.result === 'object') return value.result;
  return value;
};

const normalizeLocalTag = (tag) => {
  const tagName = text(tag?.tagName);
  if (!tagName) return null;

  // 화면 계층에서는 source/tagId/artworkId/tagName 형태만 알면
  // 공통 추천 UI와 선택 UI를 재사용할 수 있습니다.
  // 즉, 백엔드 응답 스키마 차이는 여기서 흡수합니다.
  return {
    source: 'LOCAL_DB',
    tagId: String(tag?.tagId ?? tag?.id ?? ''),
    artworkId: tag?.artworkId ?? null,
    tagName,
    title: tagName,
    label: tagName,
  };
};

const normalizeExternalCandidate = (candidate) => {
  const title = text(candidate?.title);
  if (!title) return null;

  // 외부 후보는 아직 서비스의 "정답 데이터"가 아닙니다.
  // 따라서 tagId 대신 TMDB 원본 메타데이터를 들고 있다가,
  // 사용자가 실제로 선택했을 때만 import -> tag 생성으로 확정합니다.
  return {
    source: 'TMDB',
    title,
    overview: candidate?.overview ?? '',
    posterPath: candidate?.posterPath ?? '',
    posterUrl: candidate?.posterUrl ?? '',
    mediaType: candidate?.mediaType ?? '',
    genreIds: Array.isArray(candidate?.genreIds) ? candidate.genreIds : [],
  };
};

export const loadArtworkTags = async () =>
  // 태그 목록은 서비스에서 "즉시 검색에 써도 되는 정답 집합"입니다.
  // 게시글 검색/루트 저장 모두 이 목록을 우선 추천 기준으로 사용합니다.
  toArray(await FetchJson('/api/v1/tags'))
    .map(normalizeLocalTag)
    .filter(Boolean)
    .sort((left, right) => left.tagName.localeCompare(right.tagName, 'ko'));

export const searchArtworkTagOptions = async (query) => {
  const normalizedQuery = text(query);
  if (!normalizedQuery) return { source: 'LOCAL_DB', items: [] };

  // 정책: 로컬 Tag 우선.
  // 이유:
  // 1) 이미 서비스에 등록된 작품이면 굳이 외부 후보를 볼 필요가 없습니다.
  // 2) 로컬 tagName은 바로 게시글 검색/루트 저장에 써도 안전합니다.
  // 3) 사용자는 "이미 등록된 작품"을 먼저 선택하는 편이 혼란이 적습니다.
  const localTags = await loadArtworkTags();
  const localMatches = localTags.filter((tag) => tag.tagName.toLowerCase().includes(normalizedQuery.toLowerCase()));
  if (localMatches.length > 0) {
    return { source: 'LOCAL_DB', items: localMatches };
  }

  // 로컬에 없을 때만 외부 후보를 제시합니다.
  // 여기서 받은 결과는 아직 임시 후보이며, 이후 ensureLocalArtworkTag를 거쳐야만
  // 실제 서비스의 tagName으로 사용할 수 있습니다.
  return {
    source: 'TMDB',
    items: toArray(await searchMapArtworks(normalizedQuery))
      .map(normalizeExternalCandidate)
      .filter(Boolean),
  };
};

export const ensureLocalArtworkTag = async (candidate) => {
  if (!candidate) throw new Error('선택한 작품 태그 정보가 없습니다.');
  if (candidate.source === 'LOCAL_DB') return candidate;

  // 외부 후보를 서비스 내부 데이터로 승격하는 핵심 단계입니다.
  // 순서:
  // 1) TMDB 후보 1건을 Artwork로 import
  // 2) import된 artworkId로 Tag 생성
  // 3) 최종적으로 "로컬 Tag 객체"를 반환
  // 이 과정을 거쳐야 이후 화면들이 title 문자열이 아니라 tagName 기준으로 동작할 수 있습니다.
  const imported = unwrapObject(
    await importArtwork({
      title: candidate.title,
      overview: candidate.overview,
      posterPath: candidate.posterPath,
      mediaType: candidate.mediaType,
      genreIds: candidate.genreIds,
    }),
  );

  const artworkId = imported?.artworkId ?? imported?.id ?? null;
  if (artworkId == null) {
    throw new Error('작품 import 응답에서 artworkId를 확인하지 못했습니다.');
  }

  try {
    // 정상 케이스:
    // import 직후 태그를 생성해 바로 로컬 Tag 형태로 반환합니다.
    return (
      normalizeLocalTag(
        unwrapObject(
          await FetchJson('/api/v1/tags', {
            method: 'POST',
            body: JSON.stringify({ artworkId }),
          }),
        ),
      ) ?? {
        source: 'LOCAL_DB',
        tagId: '',
        artworkId,
        tagName: imported?.title ?? candidate.title,
        title: imported?.title ?? candidate.title,
        label: imported?.title ?? candidate.title,
      }
    );
  } catch (error) {
    // 동시 요청/중복 생성 경합 허용:
    // 같은 작품을 다른 화면 또는 다른 클릭으로 거의 동시에 확정할 수 있으므로
    // "이미 태그가 만들어진 경우"는 실패로 끝내지 않고 기존 태그를 찾아 재사용합니다.
    const existing = (await loadArtworkTags()).find((tag) => String(tag.artworkId) === String(artworkId));
    if (existing) return existing;
    throw error;
  }
};

export const resolveArtworkSelectionToTag = async (artwork) => {
  if (!artwork) {
    throw new Error('선택한 작품 정보가 없습니다.');
  }

  // 작품 탐색 페이지는 "Artwork 카드"를 누르는 흐름이라,
  // 입력이 이미 로컬 Artwork일 수도 있고 외부 후보일 수도 있습니다.
  // 그래서 candidate가 아니라 artwork라는 이름을 쓰고,
  // 여기서 최종적으로 tagName까지 보장합니다.
  if (artwork.source === 'LOCAL_DB') {
    if (artwork.artworkId == null) {
      throw new Error('로컬 작품 ID를 확인하지 못했습니다.');
    }

    try {
      // 로컬 Artwork가 이미 있어도 Tag가 없을 수 있으므로,
      // "로컬 작품 선택" 역시 태그 생성 보장을 한 번 거칩니다.
      return (
        normalizeLocalTag(
          unwrapObject(
            await FetchJson('/api/v1/tags', {
              method: 'POST',
              body: JSON.stringify({ artworkId: artwork.artworkId }),
            }),
          ),
        ) ?? {
          source: 'LOCAL_DB',
          tagId: '',
          artworkId: artwork.artworkId,
          tagName: artwork.title,
          title: artwork.title,
          label: artwork.title,
        }
      );
    } catch (error) {
      // 이미 태그가 만들어진 경우를 허용해 idempotent하게 처리합니다.
      const existing = (await loadArtworkTags()).find((tag) => String(tag.artworkId) === String(artwork.artworkId));
      if (existing) return existing;
      throw error;
    }
  }

  // 외부 후보는 위의 공통 확정 로직에 그대로 위임합니다.
  return ensureLocalArtworkTag(artwork);
};
