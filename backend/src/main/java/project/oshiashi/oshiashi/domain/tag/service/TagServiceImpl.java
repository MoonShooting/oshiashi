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
	
	// 1. 태그 생성 (작품과 연결 필수)
	@Override
	public TagResponse createTag(TagRequest request) {
		// 1-1 . 중복 체크 - 존재하면 바로 에러 던지기
		tagRepository.findByTagName(request.getTagName())
				.ifPresent(tag -> {
					log.debug("[Tag 생성 중단] 중복된 태그명 발견: {}", tag.getTagName());
					// 여기서 RuntimeException
					throw new RuntimeException("이미 존재하는 태그 이름입니다: " + tag.getTagName());
				});
		
		// 1-2. 연결된 작품 조회
		//TODO: Artwork 연결 (현재는 작품 없어서 임시 주석) ,
		// 1-3의 엔티티에서도 .artwork 부분 검토 필요
		
		/*
		ArtworkEntity artwork = artworkRepository.findById(request.getArtworkId())
				.orElseThrow(() -> {
					log.debug("[Tag 생성 실패] 작품을 찾을 수 없음. ID: {}", request.getArtworkId());
					return new RuntimeException("해당 작품을 찾을 수 없습니다.");
				});
		
		
		 */
		
		// 1-3. 새로운 태그 저장
		TagEntity newTag = TagEntity.builder()
				.tagName(request.getTagName())
				//.artwork(artwork)
				.build();
		
		TagEntity savedTag = tagRepository.save(newTag);
		
		log.debug("[Tag 생성 완료] 생성된 태그명: {}", savedTag.getTagName());
		
		return TagResponse.fromEntity(savedTag);
	}
	
	// 2. 태그 삭제
	@Override
	public void deleteTag(Long tagId) {
		log.debug("[Tag 삭제 요청] 삭제할 ID: {}", tagId);
		tagRepository.deleteById(tagId);
		log.debug("[Tag 삭제 완료]");
	}
	
	// 3. 태그 조회 (자동완성용: '도' 입력 시 도쿄, 도쿄돔, 도쿄타워 등 검색)
	@Override
	public List<TagResponse> searchTags(String keyword) {
		
		log.debug("[Tag 검색] 키워드: '{}'", keyword);
		
		// DB에서 키워드로 시작하는 태그 리스트 조회
		// 태그 이름(tagName)이 입력된 키워드(keyword)로 시작하는지 확인
		// SQL의 'LIKE keyword%'와 동일한 동작?
		List<TagResponse> results = tagRepository.findByTagNameStartingWith(keyword).stream()
				.map(TagResponse::fromEntity)// DB에서 가져온 엔티티(Entity)를 화면에 전달할 응답 객체(DTO)로 변환
				.collect(Collectors.toList()); // 변환된 데이터들을 하나의 리스트 바구니에 담기
		
		log.debug("[Tag 검색 완료] 검색 결과 수: {}건", results.size());
		return results;
	}

	// 4. 작품 기준 태그 조회/생성
	@Override
	public TagEntity getOrCreateArtworkTag(ArtworkEntity artwork) {
		log.debug("[작품 태그 조회/생성] artworkId: {}, title: {}", artwork.getArtworkId(), artwork.getTitle());

		return tagRepository.findByArtwork_ArtworkId(artwork.getArtworkId())
				.orElseGet(() -> {
					log.debug("[작품 태그 없음] 새 태그 생성 진행: {}", artwork.getTitle());

					TagEntity newTag = TagEntity.of(artwork, artwork.getTitle());
					TagEntity savedTag = tagRepository.save(newTag);

					log.debug("[작품 태그 생성 완료] tagId: {}, tagName: {}", savedTag.getTagId(), savedTag.getTagName());
					return savedTag;
				});
	}
	
}

