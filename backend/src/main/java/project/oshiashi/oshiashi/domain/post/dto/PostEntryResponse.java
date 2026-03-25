package project.oshiashi.oshiashi.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class PostEntryResponse {
	private String userImageUrl;
	private String referenceImageUrl;
	private String name;
	private String address;
	private String note;
	private int sortOrder;
	
	private BigDecimal latitude;
	private BigDecimal longitude;
	private String artworkTitle;
}
