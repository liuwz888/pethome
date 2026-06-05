package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PostRequest {
    @Size(max = 2000, message = "动态内容最多2000字")
    private String content;
}
