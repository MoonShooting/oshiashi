package project.oshiashi.oshiashi.domain.post.service;

import project.oshiashi.oshiashi.domain.post.dto.PostRequest;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;

import java.util.List;

public interface PostService {
	//List<PostResponse> getAllPost();
	PostResponse getPostById(Long postId);
	
	//  게시글 작성
	PostResponse createPost(PostRequest request);

	//삭제
	void deletePost(Long postId,String userId );
	
	//수정

	PostResponse updatePost(Long postId,String userId , PostRequest request);

	//좋아요
	PostResponse likePost(Long postId, String userId);
	
	List<PostResponse> getAllPost(Boolean routeIdIsNull, String sort, String search, List<String> tags);
}
/*
  인터페이스를 이용함으로써 사용법(Interface)과 실제 기능(Impl) 을 분리
  1. 규격 정의: 서비스가 제공해야 할 기능을 명세하여, 내부 구현이 어떻게 바뀌든 외부(Controller 등)와의 약속을 유지
  2. 가독성 향상: 핵심 기능만 나열되어 있어 서비스의 전체적인 역할을 한눈에 파악하기 좋습니다.
  3. 확장성: 나중에 '인기 게시글 우선순위 로직' 등이 추가된 새로운 구현체로  교체할 때 기존 코드의 수정을 최소화합니다.
 */
