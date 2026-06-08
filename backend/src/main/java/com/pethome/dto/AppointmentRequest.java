package com.pethome.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AppointmentRequest {
    private Long serviceProviderId;
    private AppointmentType type;
    private String title;
    private String description;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phoneNumber;
    private String petInfo;
    private BigDecimal amount;
    private String paymentMethod;
    private List<AppointmentItemRequest> items;

    public enum AppointmentType {
        GROOMING, VETERINARY, BOARDING, TRAINING, WALKING, SITTING
    }

    @Data
    public static class AppointmentItemRequest {
        private String serviceName;
        private BigDecimal price;
        private Integer quantity;
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }

    @Data
    public static class UpdatePhaseRequest {
        private String phase;
        private String notes;
    }

    @Data
    public static class ReviewRequest {
        private Integer rating; // 1-5
        private String content;
        private String images;
        private Integer serviceAttitudeRating;
        private Integer professionalRating;
        private Integer speedRating;
        private Boolean isAnonymous;
    }
}
