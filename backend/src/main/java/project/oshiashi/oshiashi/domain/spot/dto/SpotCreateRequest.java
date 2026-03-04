package project.oshiashi.oshiashi.domain.spot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpotCreateRequest {
	
	private Long artworkId;
	private String name; //장소 이름
	
	private BigDecimal latitude; // 위도
	private BigDecimal longitude; // 경도
	
	private String address; // 주소
	private String sceneImgUrl; // 장면 사진
}
