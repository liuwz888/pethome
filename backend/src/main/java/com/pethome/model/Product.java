package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private boolean isActive = true;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private User supplier;

    @ElementCollection
    @CollectionTable(name = "product_tags",
                      joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    // 商品分类
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ProductCategory category;

    // 商品图片
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // 活动相关字段（后续扩展）
    @JsonIgnore
    private BigDecimal discountAmount;
    @JsonIgnore
    private LocalDate startDate;
    @JsonIgnore
    private LocalDate endDate;

    // Enum for product categories
    public enum ProductCategory {
        FOOD("宠物食品"),
        TOYS("玩具用品"),
        ACCESSORIES("配件装备"),
        HEALTHCARE("医疗保健"),
        SERVICES("服务项目");

        private final String displayName;

        ProductCategory(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Explicit getters/setters for isActive to match service usage
    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean active) {
        this.isActive = active;
    }
}
