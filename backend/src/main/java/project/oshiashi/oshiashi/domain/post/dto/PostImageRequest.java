package project.oshiashi.oshiashi.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageRequest {
	
	private int sortOrder;
	private BigDecimal exifLatitude;
	private BigDecimal exifLongitude;
	
	// 프론트가 보내는 다양한 이미지 주소 중 '문자열 리스트'로 취합해서 받기
	private List<String> imageUrl;
}
