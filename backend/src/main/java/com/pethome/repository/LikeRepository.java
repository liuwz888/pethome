package com.pethome.repository;

import com.pethome.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Like findByUserIdAndPostId(Long userId, Long postId);
    long countByPostId(Long postId);
    boolean existsByUserIdAndPostId(Long userId, Long postId);
}