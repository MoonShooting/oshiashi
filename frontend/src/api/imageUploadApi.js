import { API_BASE_URL, FetchMultipart } from '@/api/FetchClient';

// 백엔드가 data/result 래퍼를 붙여도 이 계층에서 흡수해
// 화면 코드는 "업로드 결과 객체"만 신경 쓰도록 맞춥니다.
const unwrapPayload = (response) => {
  if (!response || typeof response !== 'object') return response;
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.result && typeof response.result === 'object') return response.result;
  return response;
};

// 업로드 API는 절대 URL 또는 /uploads/... 같은 상대 경로를 줄 수 있으므로
// 여기서 최종적으로 브라우저가 바로 쓸 수 있는 공개 URL 형태로 통일합니다.
const resolveUploadedUrl = (payload) => {
  const rawUrl =
    payload?.url ??
    payload?.imageUrl ??
    payload?.fileUrl ??
    payload?.publicUrl ??
    payload?.path ??
    '';

  if (!rawUrl) {
    throw new Error('업로드 응답에서 이미지 URL을 확인하지 못했습니다.');
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return new URL(rawUrl, API_BASE_URL).toString();
};

export const uploadPostImage = async (file, { purpose = 'post-image' } = {}) => {
  // 작성 화면은 "파일 선택 즉시 업로드" 전략을 사용하므로
  // 게시글 생성 시점에는 file이 아니라 업로드된 URL만 JSON에 포함합니다.
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  const response = await FetchMultipart('/api/v1/uploads/images', {
    method: 'POST',
    body: formData,
  });

  const payload = unwrapPayload(response);

  return {
    imageId: payload?.imageId ?? payload?.uploadId ?? payload?.id ?? null,
    url: resolveUploadedUrl(payload),
    originalName: payload?.originalName ?? payload?.fileName ?? file.name,
    contentType: payload?.contentType ?? file.type,
    size: Number(payload?.size ?? file.size),
  };
};
