package project.oshiashi.oshiashi.domain.tag.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.service.TagService;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {
	
	private final TagService tagService;
	
	// 태그 생성
	//ResponseEntity<TagResponse>: 성공/실패 여부(HTTP 상태 코드)와 데이터(TagResponse)를 함께 담아서 응답하겠다는 뜻입니다.
	//@RequestBody TagRequest request: 사용자가 보낸 JSON 데이터(작품 ID, 태그 이름 등)를 자바 객체(TagRequest)로 변환해서 가져옵니다.
	// TagResponse response = tagService.createTag(request);
	// 실제 핵심 로직(유효성 검사, 중복 체크, 저장 등)은 tagService에 맡기고, 그 결과를 받아옵니다.
	@PostMapping
	public ResponseEntity<TagResponse> createTag(@RequestBody TagRequest request) {
		return ResponseEntity.ok(tagService.createTag(request));
	}
	
	// 특정 작품의 태그 삭제 (또는 작품 삭제 API 호출 시 내부적으로 사용)
	// tagName 기준 태그 삭제
	@DeleteMapping("/artwork/{artworkId}")
	public ResponseEntity<Void> deleteTagByArtwork(@PathVariable Long artworkId) {
		tagService.deleteTagByArtwork(artworkId);
		return ResponseEntity.noContent().build();
	}

	// 전체 태그 목록 조회
	// 현재 태그 목록은 일반 장르 태그가 아니라, 작품 제목을 태그 형식으로 저장한 목록입니다.
	@GetMapping
	public ResponseEntity<List<TagResponse>> getTags() {
		return ResponseEntity.ok(tagService.getTags());
	}
}
    

	

