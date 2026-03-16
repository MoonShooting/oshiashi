package project.oshiashi.oshiashi.domain.spot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

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
	
	// 이 메서드를 추가해야 서비스의 request.toEntity(artwork)가 작동
	public SpotEntity toEntity(ArtworkEntity artwork) {
		return SpotEntity.builder()
				.artwork(artwork)
				.name(this.name)
				.latitude(this.latitude)
				.longitude(this.longitude)
				.address(this.address)
				.sceneImgUrl(this.sceneImgUrl)
				.build();
	}
}
