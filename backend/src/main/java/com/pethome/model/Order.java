package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @ManyToOne
    @JoinColumn(name = "pet_owner_id")
    private User petOwner;

    @ManyToOne
    @JoinColumn(name = "service_provider_id")
    private User serviceProvider;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    private OrderType type; // SERVICE, PRODUCT

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private String address;
    private String serviceType;
    private LocalDateTime scheduledTime;
    private BigDecimal amount;

    @Column(length = 500)
    private String paymentMethod;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Order items for product orders
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderType {
        SERVICE, PRODUCT
    }

    public enum OrderStatus {
        PENDING("待支付"),
        CONFIRMED("已确认"),
        IN_PROGRESS("服务中"),
        COMPLETED("已完成"),
        CANCELLED("已取消"),
        REFUNGING("退款中"),
        REFUNDED("已退款");

        private final String description;

        OrderStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
