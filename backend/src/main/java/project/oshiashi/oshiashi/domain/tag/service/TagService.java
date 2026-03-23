package project.oshiashi.oshiashi.domain.tag.service;

import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;

import java.util.List;

public interface TagService {

	TagResponse createTag(TagRequest request);

	// 태그 목록 조회 기능
	List<TagResponse> getTags();

	// 작품 기준 태그 삭제
	void deleteTagByArtwork(Long artworkId);
}
