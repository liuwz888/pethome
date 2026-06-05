package com.pethome.service;

import com.pethome.model.InteractionLog;
import com.pethome.model.Product;
import com.pethome.model.User;
import com.pethome.repository.InteractionLogRepository;
import com.pethome.repository.ProductRepository;
import com.pethome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionLogService {

    private final InteractionLogRepository interactionLogRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logInteraction(Long userId, Long productId, InteractionLog.InteractionType type) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Product> productOpt = productRepository.findById(productId);
        if (userOpt.isEmpty() || productOpt.isEmpty()) {
            throw new RuntimeException("User or product not found");
        }

        InteractionLog log = new InteractionLog();
        log.setUser(userOpt.get());
        log.setProduct(productOpt.get());
        log.setType(type);
        interactionLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<Product> getUserInteractionHistory(Long userId) {
        return interactionLogRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(InteractionLog::getProduct)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InteractionLog> findAll() {
        return interactionLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Product> getPopularProducts(int limit) {
        Map<Long, Integer> scoreMap = new HashMap<>();
        List<InteractionLog> logs = interactionLogRepository.findAll();
        for (InteractionLog log : logs) {
            // Weight: purchase=3, comment=2, like=1, view=0.5
            int weight = switch (log.getType()) {
                case PURCHASE -> 3;
                case COMMENT -> 2;
                case LIKE -> 1;
                case VIEW -> 0;
            };
            scoreMap.merge(log.getProduct().getId(), weight, Integer::sum);
        }
        return scoreMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(e -> productRepository.findById(e.getKey()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
