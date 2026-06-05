package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class ProductRequest {
    @NotBlank(message = "商品名称不能为空")
    private String name;
    @NotBlank(message = "商品描述不能为空")
    private String description;
    @NotNull(message = "价格不能为空")
    @Positive(message = "价格必须大于0")
    private BigDecimal price;
    @NotEmpty(message = "标签不能为空")
    private Set<String> tags;
    private String category;
    private String imageUrl;
}