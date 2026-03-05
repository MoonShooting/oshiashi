package project.oshiashi.oshiashi.domain.achievement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;
import project.oshiashi.oshiashi.domain.achievement.repository.AchievementRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepository;

    @Override
    public List<AchievementResponse> getAchievements() {
        return achievementRepository.findAll()
                .stream()
                .map(AchievementResponse::from)
                .toList();
    }
}
