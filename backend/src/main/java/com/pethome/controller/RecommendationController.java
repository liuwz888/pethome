package com.pethome.controller;

import com.pethome.dto.ProductResponse;
import com.pethome.model.User;
import com.pethome.service.RecommendationService;
import com.pethome.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserService userService;

    @GetMapping("/personalized/{userId}")
    public ResponseEntity<?> getPersonalized(@PathVariable Long userId, @RequestParam(defaultValue = "10") int limit) {
        try {
            User user = userService.findByUsername("admin").orElseThrow(() -> new RuntimeException("用户未找到")); // Placeholder
            List<ProductResponse> recommendations = recommendationService.getRecommendations(
                    user.getId(), limit).stream()
                    .map(ProductResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopular(@RequestParam(defaultValue = "10") int limit) {
        List<ProductResponse> products = recommendationService.getPopularRecommendations(limit).stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }
}
