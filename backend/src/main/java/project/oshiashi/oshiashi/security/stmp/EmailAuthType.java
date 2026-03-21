package project.oshiashi.oshiashi.security.stmp;

public enum EmailAuthType {
	SIGNUP("회원가입"),     // "회원가입"이 description에 들어갑니다.
	FIND_ID("아이디 찾기"),   // "아이디 찾기"가 description에 들어갑니다.
	FIND_PW("비밀번호 찾기"); // "비밀번호 찾기"가 description에 들어갑니다.

	// 1. 주머니(변수) 만들기
	private final String description;

	// 2. 생성자: Enum이 만들어질 때 괄호 안의 글자("회원가입")를 주머니에 넣습니다.
	EmailAuthType(String description) {
		this.description = description;
	}

	// 3. 꺼내 쓰기: 나중에 이 한국어 이름이 필요할 때 호출하는 메서드입니다.
	public String getDescription() {
		return description;
	}
}