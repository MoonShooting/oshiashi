package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteCreateRequest {
	private String title;
	private Boolean isPublic;
	private List<Long> spotIds; // 장소 ID 리스트 (리스트의 인덱스가 순서가 된다고 하네요)
}
