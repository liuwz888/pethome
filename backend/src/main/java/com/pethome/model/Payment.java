package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method; // WECHAT, ALIPAY, OFFLINE

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private BigDecimal amount;
    private String transactionId; // 第三方交易号

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PaymentMethod {
        WECHAT, ALIPAY, OFFLINE
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDING, REFUNDED
    }
}
