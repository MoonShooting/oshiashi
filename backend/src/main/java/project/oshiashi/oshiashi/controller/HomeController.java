package project.oshiashi.oshiashi.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Slf4j
public class HomeController {
    @GetMapping("home")
    public String home() {
        log.debug("테스트");
        return "home";
    }
}
