package project.oshiashi.oshiashi.domain.tag.dto;

import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequest {
	private Long artworkId;
}
