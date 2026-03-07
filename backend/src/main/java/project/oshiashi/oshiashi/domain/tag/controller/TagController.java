package project.oshiashi.oshiashi.domain.tag.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.service.TagService;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
	
	private final TagService tagService;
	
	// 전체 조회
	@GetMapping
	public List<TagResponse> findAllTags() {
		return tagService.findAllTags();
	}
	
	// 하나 조회
	@GetMapping("/{tagId}")
	public TagResponse getTagById(@PathVariable Long tagId) {
		return tagService.getTagById(tagId);
	}
	
	// 테스트용
	
	/*
    @GetMapping("/test")
    public List<TagResponse> test() {
        return List.of(
                TagResponse.builder()
                        .tagId(1L)
                        .tagName("성지")
                        .artworkId(1L)
                        .build()
        );
    }
    */
	 
}
