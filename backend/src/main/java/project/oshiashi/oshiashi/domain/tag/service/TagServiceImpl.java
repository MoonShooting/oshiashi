package project.oshiashi.oshiashi.domain.tag.service;

import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
@Builder
public class TagServiceImpl implements TagService {
	private final TagRepository tagRepository;
	private final ArtworkRepository artworkRepository;
	
	/**
	 * 태그 등록 (트리거 요구사항 1, 2 반영)
	 */
	public TagResponse createTag(TagRequest request) {
		// 1. artwork_id 유효성 확인 및 객체 조회 (트리거 1번)
		// existsById 대신 findById를 사용해 객체를 직접 가져옵니다.
		ArtworkEntity artwork = artworkRepository.findById(request.getArtworkId())
				.orElseThrow(() -> new IllegalArgumentException("유효하지 않은 작품 ID입니다."));
		
		// 2. tagname Trim 및 대소문자 통일 (트리거 2번)
		// .trim() : 문자열의 앞뒤에 있는 공백(Space, Tab 등)을 제거합니다. (글자 사이의 공백은 유지)
		// .toLowerCase : 모든 영문자를 소문자로 통일합니다.
		String cleanName = request.getTagName().trim().toLowerCase();
		
		//TODO: 3. 중복 태그 체크 (unique 제약조건 및 데이터 중복 방지)
		if (tagRepository.existsByArtwork_ArtworkIdAndTagName(request.getArtworkId(), cleanName)) {
			throw new IllegalStateException("해당 작품에 이미 동일한 태그가 존재합니다.");
		}
		
		TagEntity tagEntity = new TagEntity(artwork, cleanName);
		return TagResponse.fromEntity(tagRepository.save(tagEntity));
	}
	
	/**
	 * 작품 삭제 시 연쇄 정리 또는 체크 (트리거 3번)
	 */
	public void deleteTagsByArtwork(Long artworkId) {
		// 해당 작품의 태그 일괄 삭제
		tagRepository.deleteByArtwork_ArtworkId(artworkId);
	}
	
	
	
}

