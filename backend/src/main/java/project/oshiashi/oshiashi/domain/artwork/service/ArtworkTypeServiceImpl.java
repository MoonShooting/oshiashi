package project.oshiashi.oshiashi.domain.artwork.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkTypeRepository;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class ArtworkTypeServiceImpl implements ArtworkService{
	private final ArtworkTypeRepository artworkTypeRepository;
}
