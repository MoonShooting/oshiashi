package project.oshiashi.oshiashi.domain.tag.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TagServiceImpl implements TagService {

	private final TagRepository tagRepository;
	private final ArtworkRepository artworkRepository;

	/**
	 * 태그 생성
	 * - 현재 태그는 장르/분위기 공통 태그가 아니라 작품 제목을 태그 형식으로 저장하는 구조입니다.
	 * - 따라서 요청으로 받은 artworkId를 기준으로 작품을 조회한 뒤, 작품 제목을 tagName으로 저장합니다.
	 * - 같은 작품에 대해 태그는 1개만 생성되도록 제한합니다.
	 */
	@Override
	public TagResponse createTag(TagRequest request) {
		if (request.getArtworkId() == null) {
			throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "작품 ID는 필수입니다.");
		}

		ArtworkEntity artwork = artworkRepository.findById(request.getArtworkId())
				.orElseThrow(() -> new BusinessException(
						ErrorCode.RESOURCE_NOT_FOUND,
						"작품을 찾을 수 없습니다."
				));

		String tagName = artwork.getTitle().trim();

		if (tagName.isBlank()) {
			throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "작품 제목이 비어 있어 태그를 생성할 수 없습니다.");
		}

		if (tagRepository.existsByArtwork_ArtworkId(artwork.getArtworkId())) {
			throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 해당 작품의 태그가 존재합니다.");
		}

		if (tagRepository.existsByTagName(tagName)) {
			throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 같은 이름의 태그가 존재합니다.");
		}

		TagEntity tagEntity = TagEntity.builder()
				.artwork(artwork)
				.tagName(tagName)
				.build();

		return TagResponse.fromEntity(tagRepository.save(tagEntity));
	}

	@Override
	public List<TagResponse> getTags() {
		// ── 성능 최적화: JOIN FETCH로 Artwork N+1 방지 ──
		return tagRepository.findAllWithArtworkOrderByTagNameAsc().stream()
				.map(TagResponse::fromEntity)
				.toList();
	}

	/**
	 * 작품 기준 태그 삭제
	 * - 현재 태그는 작품과 1:1로 연결된 작품 제목 태그이므로,
	 *   tagName이 아니라 artworkId 기준으로 삭제하는 방식이 더 안전합니다.
	 */
	@Override
	public void deleteTagByArtwork(Long artworkId) {
		if (artworkId == null) {
			throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "작품 ID는 필수입니다.");
		}

		TagEntity tag = tagRepository.findByArtwork_ArtworkId(artworkId)
				.orElseThrow(() -> new BusinessException(
						ErrorCode.RESOURCE_NOT_FOUND,
						"삭제할 태그를 찾을 수 없습니다."
				));

		tagRepository.delete(tag);
	}
}
