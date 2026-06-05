package com.pethome.service;

import com.pethome.model.Product;
import com.pethome.model.User;
import com.pethome.repository.ProductRepository;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final InteractionLogService interactionLogService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Product> getRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Product> history = interactionLogService.getUserInteractionHistory(userId);
        Set<String> viewedTags = history.stream()
                .flatMap(p -> p.getTags().stream())
                .collect(Collectors.toSet());

        // Content-based: recommend products with same tags but not viewed
        List<Product> contentBased = productRepository.findAll().stream()
                .filter(p -> p.getIsActive() && !history.contains(p))
                .filter(p -> !p.getTags().isEmpty() && p.getTags().stream()
                        .anyMatch(viewedTags::contains))
                .limit(limit / 2)
                .collect(Collectors.toList());

        // Popularity-based
        List<Product> popular = interactionLogService.getPopularProducts(limit / 2);

        // Merge and deduplicate
        List<Product> combined = new ArrayList<>(contentBased);
        combined.addAll(popular);
        combined.removeAll(history);
        combined = combined.stream().distinct().collect(Collectors.toList());

        return combined.stream().limit(limit).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Product> getPopularRecommendations(int limit) {
        return interactionLogService.getPopularProducts(limit);
    }
}
