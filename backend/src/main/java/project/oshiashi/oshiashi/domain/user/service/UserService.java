package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	/*
	 * [UserService의 역할]
	 * 1. 마이페이지 관리: 유저 본인의 프로필 요약 정보 조회 및 업데이트 (GET/PATCH /api/v1/user/profile)
	 * 2. 회원 상태 관리: 회원 탈퇴 처리, 휴면 계정 전환 등
	 * 3. 유저 활동 연동: 본인이 작성한 게시글, 댓글 목록 등을 불러오는 기능의 중심점
	 * * * 참고: 회원가입, 로그인, 중복 확인 등 '인증' 관련 로직은 모두 AuthService에서 담당함.
	 */

}