package project.oshiashi.oshiashi.domain.tag.service;

import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.util.List;

public interface TagService {
	
	
	TagResponse createTag(TagRequest request);
	
	void deleteTag(Long tagId);
	
	List<TagResponse> searchTags(String keyword);

	// 작품 기준 태그가 있으면 재사용하고, 없으면 생성
	TagEntity getOrCreateArtworkTag(ArtworkEntity artwork);
}
/*
  인터페이스 분리 이유
  1.서비스가 제공해야 할 기능을 명세하고, 가독성 향상이 됨
  2.핵심 기능만 나열되어 있어 서비스의 전체적인 역할을 한눈에 파악하기 좋습니다.
*/
