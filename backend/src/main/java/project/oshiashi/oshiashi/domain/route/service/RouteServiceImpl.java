package project.oshiashi.oshiashi.domain.route.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService{
	private final RouteRepository routeRepository;
}
