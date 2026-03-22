package project.oshiashi.oshiashi.domain.post.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InvalidObjectException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileService {
	// application.yml에 설정한 경로를 가져옵니다.
	// 예: C:/oshiashi/uploads
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	public String storeFile(MultipartFile file) {
		// 1. 원본 파일명에서 확장자 추출 (예: .jpg)
		String originalFilename = file.getOriginalFilename();
		String extension = "";
		if (originalFilename != null && originalFilename.contains(".")) {
			extension = originalFilename.substring(originalFilename.lastIndexOf("."));
		}
		
		// 2. 서버에 저장할 겹치지 않는 이름 생성 (UUID 사용)
		String fileName = UUID.randomUUID().toString() + extension;
		
		try {
			// ... (3, 4번 로직 동일) ...
			Path uploadPath = Paths.get(uploadDir);
			if (!Files.exists(uploadPath)) {
				Files.createDirectories(uploadPath);
			}
			
			Path targetLocation = uploadPath.resolve(fileName);
			Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
			
			return "/uploads/" + fileName;
			
		} catch (IOException e) {
			// 파일 생성, 복사 중 발생하는 모든 에러는 여기서 잡힙니다.
			log.error("[FileService] 파일 저장 중 에러 발생: {}", fileName, e);
			throw new RuntimeException("파일 저장에 실패했습니다: " + fileName, e);
		}
	}
}
