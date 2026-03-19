package project.oshiashi.oshiashi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ArtworkTestController {

    @GetMapping("/artwork-demo")
        public String artworkTagDemo() {
            return "artwork-demo";
    }
}

