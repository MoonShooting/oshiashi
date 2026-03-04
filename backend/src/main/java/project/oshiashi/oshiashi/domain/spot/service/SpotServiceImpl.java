package project.oshiashi.oshiashi.domain.spot.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class SpotServiceImpl implements SpotService{
	private final SpotRepository spotRepository;
}
