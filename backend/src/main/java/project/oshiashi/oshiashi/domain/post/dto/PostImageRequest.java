package project.oshiashi.oshiashi.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageRequest {
	private String imageUrl;
	private int sortOrder;
	private BigDecimal exifLatitude;
	private BigDecimal exifLongitude;
}
