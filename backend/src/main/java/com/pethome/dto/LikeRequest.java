package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LikeRequest {
    @NotNull(message = "动态ID不能为空")
    private Long postId;
}