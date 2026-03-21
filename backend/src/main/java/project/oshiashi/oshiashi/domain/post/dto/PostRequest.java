package project.oshiashi.oshiashi.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity.PostStatus;

import java.util.List;

/**
 * [ 게시글 생성 및 수정 요청 DTO ]
 * - 클라이언트로부터 전달받는 데이터만 정의합니다.
 * - Validation 어노테이션을 통해 입력값의 유효성을 검증합니다.
 */
@Getter
@Setter // 컨트롤러에서 바인딩하기 위해 필요
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {

	/**
	 * 게시글 제목
	 * - 필수 입력값이며, 공백을 허용하지 않습니다.
	 */
	@NotBlank(message = "제목은 필수 입력 사항입니다.")
	private String title;

	/**
	 * 게시글 내용
	 * - 필수 입력값이며, 공백을 허용하지 않습니다.
	 */
	@NotBlank(message = "내용은 필수 입력 사항입니다.")
	private String content;

	/**
	 * 게시글 공개 여부
	 * - 기본값은 PUBLIC으로 설정될 수 있지만, 수정 시에는 선택 가능합니다.
	 */
	private PostStatus status;

	/**
	 * 태그 이름 리스트
	 * - 예: ["맛집", "여행", "부산"]
	 */
	private List<String> tagNames;
	
	/**
	 * 이미지 링크
	 */
	private List<String> imageUrl;

	/**
	 * [현재 미구현/추후 확장]
	 * - userId: 로그인 세션에서 가져올 경우 제외 가능
	 * - routeId: 루트 정보 연결 시 필요
	 */
	private String userId;
	private Long routeId;
}