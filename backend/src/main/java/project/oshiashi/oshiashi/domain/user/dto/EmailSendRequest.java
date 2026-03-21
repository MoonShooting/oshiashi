package project.oshiashi.oshiashi.domain.user.dto;

import lombok.Getter;
import lombok.Setter;
import project.oshiashi.oshiashi.security.stmp.EmailAuthType;

@Getter
@Setter
public class EmailSendRequest {
	private String email;
	// 프론트엔드에서 보낸 "SIGNUP", "FIND_ID" 등을 Enum으로 자동 변환해 받습니다.
	private EmailAuthType type;
}