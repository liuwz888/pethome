package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_number", unique = true, nullable = false)
    private String appointmentNumber;

    @ManyToOne
    @JoinColumn(name = "pet_owner_id", nullable = false)
    private User petOwner;

    @ManyToOne
    @JoinColumn(name = "service_provider_id")
    private User serviceProvider;

    // 服务状态：待预约 -> 已接单 -> 服务中 -> 已完成
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    // 服务流程环节：需求方预约 -> 服务方接单 -> 上门准备 -> 入户 -> 服务中 -> 离场
    @Enumerated(EnumType.STRING)
    @Column(name = "service_phase", nullable = false)
    private ServicePhase phase = ServicePhase.BOOKED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentType type;

    private String title;
    private String description;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 60;

    private String address;
    private String phoneNumber;

    @Column(name = "pet_info", length = 500)
    private String petInfo;

    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // 服务备注
    @Column(name = "service_notes", length = 1000)
    private String serviceNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AppointmentItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AppointmentPhaseRecord> phaseRecords = new ArrayList<>();

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private AppointmentReview review;

    public enum AppointmentType {
        GROOMING("美容护理"),
        VETERINARY("医疗健康"),
        BOARDING("寄养托管"),
        TRAINING("行为训练"),
        WALKING("遛狗服务"),
        SITTING("上门喂养");

        private final String description;

        AppointmentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum AppointmentStatus {
        BOOKED("待发布"),       // 需求方已创建，待发布
        PUBLISHED("待接单"),    // 需求已发布，等待服务方接单
        ACCEPTED("已接单"),     // 服务方已接单
        ON_WAY("服务中"),       // 服务方已出发，正在上门
        STARTED("服务中"),      // 服务方已入户，开始服务
        COMPLETED("已完成"),    // 服务已完成，待支付
        PAID("已支付"),         // 用户已支付
        CANCELLED("已取消"),
        NO_SHOW("用户爽约");    // 用户未到场

        private final String description;

        AppointmentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum ServicePhase {
        BOOKED("需求创建"),              // 阶段1: 需求创建
        PUBLISHED("需求发布"),            // 阶段2: 需求已发布
        ACCEPTED("服务方接单"),          // 阶段3: 服务方接单
        PREPARING("上门准备"),           // 阶段4: 服务方准备中
        ARRIVED("已入户"),              // 阶段5: 服务方已到达
        IN_PROGRESS("服务中"),           // 阶段6: 正在服务
        COMPLETED("服务完成"),           // 阶段7: 服务完成，待离场
        CLOSED("已完成");               // 阶段8: 完成评价，流程结束

        private final String description;

        ServicePhase(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
