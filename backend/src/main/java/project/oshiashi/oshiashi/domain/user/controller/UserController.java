package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.oshiashi.oshiashi.domain.user.service.UserService;

/**
 * [사용자 정보 관리 컨트롤러]
 * 설계서 경로: /api/v1/user/**
 * 담당 기능: 마이페이지 조회, 정보 수정, 회원 탈퇴 등 (인증된 유저 전용)
 */
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	/*
	 * TODO: 마이페이지 프로필 조회 (GET /api/v1/user/profile)
	 */
}