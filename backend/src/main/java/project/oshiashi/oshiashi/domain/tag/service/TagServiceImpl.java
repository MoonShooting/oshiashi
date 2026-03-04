package project.oshiashi.oshiashi.domain.tag.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class TagServiceImpl implements TagService{
	private final TagRepository tagRepository;
}
