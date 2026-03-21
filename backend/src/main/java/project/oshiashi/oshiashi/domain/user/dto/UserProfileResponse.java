package project.oshiashi.oshiashi.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String nickname;
    private String email;
    private String joinedAt;
    private String mainAchievement;

    private int routeCount;
    private int postCount;
    private int bookmarkCount;
    private int achievementCount;
}
