package com.pethome.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "appointment_items")
@Data
public class AppointmentItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
}
