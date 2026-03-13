package project.oshiashi.oshiashi.domain.artwork.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkImportService;

import java.util.List;

// 임시 테스트로 만들어진 관리자가 정보를 직접 삽입하는 형태의 컨트롤러 입니다. 추후에 자동화 하겠습니다.
@RestController
@RequestMapping("/api/v1/admin/artworks")
@RequiredArgsConstructor
public class ArtworkAdminController {

    private final ArtworkImportService artworkImportService;

    @PostMapping("/import/movie")
    public List<Long> importMovie(@RequestParam String query) {
        return artworkImportService.importMovies(query);
    }

    @PostMapping("/import/tv")
    public List<Long> importTv(@RequestParam String query) {
        return artworkImportService.importTv(query);
    }
}