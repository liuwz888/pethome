package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 服务流程环节记录
 * 记录每个服务环节的开始和完成时间
 */
@Entity
@Table(name = "appointment_phase_records")
@Data
public class AppointmentPhaseRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    // 服务环节
    @Enumerated(EnumType.STRING)
    @Column(name = "phase", nullable = false)
    private Appointment.ServicePhase phase;

    // 环节开始时间
    @Column(name = "start_time")
    private LocalDateTime startTime;

    // 环节完成时间
    @Column(name = "end_time")
    private LocalDateTime endTime;

    // 环节备注
    @Column(name = "notes", length = 500)
    private String notes;

    // 执行用户（服务方或需求方）
    @ManyToOne
    @JoinColumn(name = "executed_by")
    private User executedBy;
}
