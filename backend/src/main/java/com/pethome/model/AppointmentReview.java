package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 服务评价
 */
@Entity
@Table(name = "appointment_reviews")
@Data
public class AppointmentReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    // 评分（1-5星）
    @Column(name = "rating", nullable = false)
    private Integer rating;

    // 评价内容
    @Column(name = "content", length = 1000)
    private String content;

    // 评价图片
    @Column(name = "images", length = 1000)
    private String images;

    // 服务态度评分
    @Column(name = "service_attitude_rating")
    private Integer serviceAttitudeRating;

    // 专业水平评分
    @Column(name = "professional_rating")
    private Integer professionalRating;

    // 服务速度评分
    @Column(name = "speed_rating")
    private Integer speedRating;

    // 是否匿名评价
    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
