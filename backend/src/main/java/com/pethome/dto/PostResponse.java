package com.pethome.dto;

import com.pethome.model.Comment;
import com.pethome.model.Post;
import com.pethome.model.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class PostResponse {
    private Long id;
    private Long userId;
    private String username;
    private String avatar;
    private String content;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private List<CommentResponse> comments;

    public PostResponse(Post post) {
        this.id = post.getId();
        User user = post.getUser();
        if (user != null) {
            this.userId = user.getId();
            this.username = user.getUsername();
            this.avatar = user.getAvatar();
        }
        this.content = post.getContent();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.createdAt = post.getCreatedAt();
    }

    public PostResponse(Long id, Long userId, String username, String avatar,
                        String content, int likeCount, int commentCount, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.content = content;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.createdAt = createdAt;
    }
}
