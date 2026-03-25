package project.oshiashi.oshiashi.domain.post.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import project.oshiashi.oshiashi.domain.post.dto.PostImageResponse;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class ImageService {
	
	// 설정하신 board.uploadPath 값을 가져옵니다 (c:/MyProject/util/uploads)
	@Value("${board.uploadPath}")
	private String uploadPath;
	
	// 프론트엔드에게 알려줄 서버 주소 (운영 시에는 실제 도메인으로 변경)
	private final String baseUrl = "http://localhost:9933";
	
	public PostImageResponse uploadImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		
		// 1. 확장자 체크 로직 추가
		String originalName = file.getOriginalFilename();
		String extension = "";
		if (originalName != null && originalName.contains(".")) {
			extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
		}
		
		// [핵심] jpg, jpeg, png 만 허용 (소문자로 변환해서 비교)
		if (!(extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png"))) {
			log.warn("허용되지 않는 파일 확장자 시도: {}", extension);
			throw new RuntimeException("jpg, jpeg, png 파일만 업로드 가능합니다.");
		}
		
		try {
			// 1. 날짜별 서브 디렉토리 생성 (예: 2026-03-23)
			// File.separator 대신 "/"를 쓰는 것이 URL 생성 시 더 안전합니다.
			String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
			
			// 실제 물리적 저장 경로
			File targetDir = new File(uploadPath + File.separator + "posts" + File.separator + datePath);
			
			if (!targetDir.exists()) {
				targetDir.mkdirs();
			}
			
			// 2. 파일명 중복 방지 (UUID 사용)
			originalName = file.getOriginalFilename();
			// 확장자가 없는 파일에 대비한 안전장치 추가
			extension = "";
			if (originalName != null && originalName.contains(".")) {
				extension = originalName.substring(originalName.lastIndexOf("."));
			}
			String savedName = UUID.randomUUID().toString() + extension;
			
			// 3. 최종 목적지로 파일 이동
			File targetFile = new File(targetDir, savedName);
			file.transferTo(targetFile);
			
			// 4. URL 생성 (중요!)
			// 윈도우 환경에서 File.separator가 '\'가 될 수 있으므로 URL은 항상 "/"로 고정합니다.
			String fileUrl = String.format("%s/uploads/posts/%s/%s", baseUrl, datePath, savedName);
			
			log.info("파일 업로드 성공: {}", fileUrl);
			
			return PostImageResponse.builder()
					.imageUrl(fileUrl)
					.createdAt(LocalDateTime.now())
					.sortOrder(0)
					.build();
			
		} catch (IOException e) {
			log.error("파일 저장 중 에러 발생", e);
			throw new RuntimeException("파일 저장 실패: " + e.getMessage());
		}
	}
}
