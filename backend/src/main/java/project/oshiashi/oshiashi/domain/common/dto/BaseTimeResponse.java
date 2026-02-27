package project.oshiashi.oshiashi.domain.common.dto;

import lombok.Getter;
import project.oshiashi.oshiashi.domain.common.entity.BaseTimeEntity;

import java.time.LocalDateTime;

@Getter
public class BaseTimeResponse {
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	// 생성자나 빌더를 통해 데이터를 채움
	protected BaseTimeResponse(BaseTimeEntity entity) {
		this.createdAt = entity.getTimecreatedAt();
		this.updatedAt = entity.getTimeupdatedAt();
	}
	
}
// ex)
// DB: created_at, updated_at 컬럼에 시간이 저장되어 있음.
// Entity: PostEntity가 BaseTimeEntity를 상속받아 그 값을 들고 있음.
// Service: DB에서 꺼낸 엔티티를 PostResponse.from(post)로 변환. 이때 부모인 BaseTimeResponse의 생성자가 실행되면서 시간 데이터가 DTO 상자에 담김.
// Controller: 이 DTO를 JSON 형태로 변환해서 웹/앱으로 전송.
// Frontend: JSON에서 createdAt을 꺼내 화면에 "2026.02.26"이라고 출력.
