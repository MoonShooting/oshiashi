import { FetchClient } from './FetchClient.js';

// 1. 내 정보 상세 조회 (GET)
export const getMyInfoAPI = () => {
  return FetchClient('/api/v1/user/me', {
    method: 'GET',
  });
};

// 2. 회원 프로필 요약 조회 (GET)
export const getUserProfileAPI = () => {
  return FetchClient('/api/v1/user/profile', {
    method: 'GET',
  });
};

// 3. 닉네임 수정 (PATCH)
// 매개변수: 변경할 닉네임 문자열
export const updateProfileAPI = (nickname) => {
  return FetchClient('/api/v1/user/update', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
};

// 4. 내 루트 목록 조회 (GET)
export const getMyRoutesAPI = () => {
  return FetchClient('/api/v1/user/myRoute', {
    method: 'GET',
  });
};

// 5. 내가 쓴 글 목록 조회 (GET)
export const getMyPostsAPI = () => {
  return FetchClient('/api/v1/user/posts', {
    method: 'GET',
  });
};

// 6. 내가 쓴 댓글 목록 조회 (GET)
export const getMyCommentsAPI = () => {
  return FetchClient('/api/v1/user/comments', {
    method: 'GET',
  });
};

// 7. 북마크 목록 조회 (GET)
export const getMyBookmarksAPI = () => {
  return FetchClient('/api/v1/user/myBookmarks', {
    method: 'GET',
  });
};

// 8. 보유 칭호 목록 조회 (GET)
export const getMyAchievementsAPI = () => {
  return FetchClient('/api/v1/user/achievement', {
    method: 'GET',
  });
};

// 9. 대표 칭호 변경 (PATCH)
// 매개변수: 변경할 칭호의 ID (achievementId)
export const updateMainAchievementAPI = (achievementId) => {
  return FetchClient('/api/v1/user/mainAchievement', {
    method: 'PATCH',
    body: JSON.stringify({ achievementId }),
  });
};
