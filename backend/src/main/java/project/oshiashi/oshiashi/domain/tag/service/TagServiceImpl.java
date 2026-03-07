package project.oshiashi.oshiashi.domain.tag.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
	private final TagRepository tagRepository;
	
	@Override
	public List<TagResponse> findAllTags() {
		return tagRepository.findAll().stream()
				.map(TagResponse::fromEntity)    // 2. 엔티티를 DTO로 변환
				.collect(Collectors.toList());   // 3. 변환된 것들을 다시 List에 수집
	}
	
	//전달받은 ID로 태그를 조회하며, 존재하지 않을 경우 예외를 던집니다.
	@Override
	public TagResponse getTagById(Long tagId) {
		TagEntity tag = tagRepository.findById(tagId)
				.orElseThrow(() -> new RuntimeException("태그를 찾을 수 없습니다."));
		return TagResponse.fromEntity(tag);
	}
}
