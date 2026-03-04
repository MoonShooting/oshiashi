package project.oshiashi.oshiashi.domain.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequest {
	private Long artworkId;
	private String tagName;
}
