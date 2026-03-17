package project.oshiashi.oshiashi.domain.tag.service;

import project.oshiashi.oshiashi.domain.tag.dto.TagRequest;
import project.oshiashi.oshiashi.domain.tag.dto.TagResponse;

import java.util.List;

public interface TagService {
	
	
	TagResponse createTag(TagRequest request);
	
	void deleteTagsByArtwork(Long artworkId);
}
/*
  인터페이스 분리 이유
  1.서비스가 제공해야 할 기능을 명세하고, 가독성 향상이 됨
  2.핵심 기능만 나열되어 있어 서비스의 전체적인 역할을 한눈에 파악하기 좋습니다.
*/
