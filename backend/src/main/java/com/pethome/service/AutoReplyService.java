package com.pethome.service;

import com.pethome.dto.CommentRequest;
import com.pethome.model.Comment;
import com.pethome.model.Post;
import com.pethome.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoReplyService {

    private final AIContentAnalyzerService aiAnalyzer;
    private final CommentRepository commentRepository;

    @Transactional
    public void generateAndSaveReply(Post post, CommentRequest request) {
        if (post == null || request == null || !StringUtils.hasText(request.getContent())) {
            return;
        }

        try {
            String reply = aiAnalyzer.generateCommentReply(post.getContent(), request.getContent());
            if (!StringUtils.hasText(reply)) {
                return;
            }

            // Use post owner as the reply author for now to keep schema unchanged.
            Comment aiReply = new Comment();
            aiReply.setPost(post);
            aiReply.setUser(post.getUser());
            aiReply.setContent("[AI自动回复] " + reply.trim());
            aiReply.setCreatedAt(LocalDateTime.now());
            commentRepository.save(aiReply);
        } catch (Exception e) {
            log.warn("Auto reply generation failed: {}", e.getMessage());
        }
    }
}
