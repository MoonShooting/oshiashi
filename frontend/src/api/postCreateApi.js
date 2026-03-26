import { createRoutePost, loadPostCreateRoutes, updateRoutePost } from '@/api/routePostApi';

/*
[postCreateApi]
- 기존 페이지 import 경로를 유지하기 위한 thin wrapper
- 실제 구현은 routePostApi로 일원화해 중복 로직을 제거
*/
export { loadPostCreateRoutes };

export const submitPostCreate = async (draft) => createRoutePost(draft);
export const submitPostUpdate = async (draft) => updateRoutePost(draft);
