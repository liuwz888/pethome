package com.pethome;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class PethomeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PethomeBackendApplication.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/health")
    public String health() {
        return "PetHome Backend is running!";
    }
}