package com.pethome.dto;

import com.pethome.model.Comment;
import com.pethome.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private Long userId;
    private String username;
    private String avatar;
    private String content;
    private LocalDateTime createdAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        User user = comment.getUser();
        if (user != null) {
            this.userId = user.getId();
            this.username = user.getUsername();
            this.avatar = user.getAvatar();
        }
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
    }
}
