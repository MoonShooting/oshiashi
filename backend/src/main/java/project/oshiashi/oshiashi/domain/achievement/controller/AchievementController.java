package project.oshiashi.oshiashi.domain.achievement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;
import project.oshiashi.oshiashi.domain.achievement.service.AchievementService;

import java.util.List;

@RestController
@RequestMapping("/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;

    @GetMapping
    public List<AchievementResponse> getAchievements() {
        return achievementService.getAchievements();
    }
}