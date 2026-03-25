package project.oshiashi.oshiashi.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.oshiashi.oshiashi.domain.post.dto.PostImageResponse;
import project.oshiashi.oshiashi.domain.post.service.ImageService;

@RestController
@RequestMapping("/api/v1/uploads") // 보고서의 베이스 경로와 일치
@RequiredArgsConstructor
public class UploadController {
	
	private final ImageService imageService;
	
	@PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<PostImageResponse> uploadImage(@RequestParam("file") MultipartFile file) {
		PostImageResponse response = imageService.uploadImage(file);
		return ResponseEntity.ok(response);
	}
}
