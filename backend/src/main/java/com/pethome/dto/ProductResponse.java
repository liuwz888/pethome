package com.pethome.dto;

import com.pethome.model.Product;
import com.pethome.model.User;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Set<String> tags;
    private User supplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.tags = product.getTags();
        this.supplier = product.getSupplier();
        this.createdAt = product.getCreatedAt();
        this.updatedAt = product.getUpdatedAt();
    }
}
