package project.oshiashi.oshiashi.domain.achievement.service;

import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;

import java.util.List;

public interface AchievementService {

    List<AchievementResponse> getAchievements();

}
