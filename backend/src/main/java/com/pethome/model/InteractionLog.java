package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "interaction_logs")
@Data
public class InteractionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    private InteractionType type; // VIEW, LIKE, COMMENT, PURCHASE

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum InteractionType {
        VIEW, LIKE, COMMENT, PURCHASE
    }
}
