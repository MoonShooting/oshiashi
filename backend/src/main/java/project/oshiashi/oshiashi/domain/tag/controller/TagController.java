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
	@PostMapping
	public ResponseEntity<TagResponse> createTag(@RequestBody TagRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)// 1. HTTP 상태 코드를 201(Created)로 설정 (성공적으로 생성됨을 명시)
				.body(tagService.createTag(request)); // 2. 서비스 로직을 실행하여 DB에 저장된 실제 데이터(DTO)를 응답 본문에 담음
	}
	
	// 태그 삭제하기
	@DeleteMapping("/{tagId}")
	public ResponseEntity<Void> deleteTag(@PathVariable Long tagId) {
		tagService.deleteTag(tagId);
		return ResponseEntity.noContent().build();
	}
	
	
	// 태그 조회하기
	@GetMapping
	public ResponseEntity<List<TagResponse>> searchTags(@RequestParam String keyword) {
		return ResponseEntity.ok(tagService.searchTags(keyword));
	}
	
	
	
}
    

	

