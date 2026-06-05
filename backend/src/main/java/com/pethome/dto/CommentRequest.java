package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 500, message = "评论内容最多500字")
    private String content;
}