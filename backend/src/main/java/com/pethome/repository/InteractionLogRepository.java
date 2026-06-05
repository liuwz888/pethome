package com.pethome.repository;

import com.pethome.model.InteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionLogRepository extends JpaRepository<InteractionLog, Long> {
    List<InteractionLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<InteractionLog> findByProductIdAndType(Long productId, InteractionLog.InteractionType type);
}