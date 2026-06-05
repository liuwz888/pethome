package com.pethome.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class AppointmentResponse {
    private Long id;
    private String appointmentNumber;
    private UserResponse petOwner;
    private UserResponse serviceProvider;
    private AppointmentStatus status;
    private ServicePhase phase;
    private AppointmentType type;
    private String title;
    private String description;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String address;
    private String phoneNumber;
    private String petInfo;
    private BigDecimal amount;
    private String paymentMethod;
    private String serviceNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AppointmentItemResponse> items = new ArrayList<>();
    private List<PhaseRecordResponse> phaseRecords = new ArrayList<>();
    private ReviewResponse review;

    public AppointmentResponse() {}

    public AppointmentResponse(com.pethome.model.Appointment appointment) {
        this.id = appointment.getId();
        this.appointmentNumber = appointment.getAppointmentNumber();
        if (appointment.getPetOwner() != null) {
            this.petOwner = new UserResponse(appointment.getPetOwner());
        }
        if (appointment.getServiceProvider() != null) {
            this.serviceProvider = new UserResponse(appointment.getServiceProvider());
        }
        this.status = AppointmentStatus.valueOf(appointment.getStatus().name());
        this.phase = ServicePhase.valueOf(appointment.getPhase().name());
        this.type = AppointmentType.valueOf(appointment.getType().name());
        this.title = appointment.getTitle();
        this.description = appointment.getDescription();
        this.scheduledTime = appointment.getScheduledTime();
        this.durationMinutes = appointment.getDurationMinutes();
        this.address = appointment.getAddress();
        this.phoneNumber = appointment.getPhoneNumber();
        this.petInfo = appointment.getPetInfo();
        this.amount = appointment.getAmount();
        this.paymentMethod = appointment.getPaymentMethod();
        this.serviceNotes = appointment.getServiceNotes();
        this.createdAt = appointment.getCreatedAt();
        this.updatedAt = appointment.getUpdatedAt();

        if (appointment.getItems() != null) {
            this.items = appointment.getItems().stream()
                .map(AppointmentItemResponse::new)
                .collect(java.util.stream.Collectors.toList());
        }

        if (appointment.getPhaseRecords() != null) {
            this.phaseRecords = appointment.getPhaseRecords().stream()
                .map(PhaseRecordResponse::new)
                .collect(java.util.stream.Collectors.toList());
        }

        if (appointment.getReview() != null) {
            this.review = new ReviewResponse(appointment.getReview());
        }
    }

    public enum AppointmentType {
        GROOMING, VETERINARY, BOARDING, TRAINING, WALKING, SITTING
    }

    public enum AppointmentStatus {
        BOOKED, ACCEPTED, ON_WAY, STARTED, COMPLETED, PAID, CANCELLED, NO_SHOW
    }

    public enum ServicePhase {
        BOOKED, ACCEPTED, PREPARING, ARRIVED, IN_PROGRESS, COMPLETED, CLOSED
    }

    @Data
    public static class AppointmentItemResponse {
        private Long id;
        private String serviceName;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal totalPrice;

        public AppointmentItemResponse(com.pethome.model.AppointmentItem item) {
            this.id = item.getId();
            this.serviceName = item.getServiceName();
            this.price = item.getPrice();
            this.quantity = item.getQuantity();
            this.totalPrice = item.getTotalPrice();
        }
    }

    @Data
    public static class PhaseRecordResponse {
        private Long id;
        private ServicePhase phase;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String notes;
        private UserResponse executedBy;

        public PhaseRecordResponse(com.pethome.model.AppointmentPhaseRecord record) {
            this.id = record.getId();
            this.phase = ServicePhase.valueOf(record.getPhase().name());
            this.startTime = record.getStartTime();
            this.endTime = record.getEndTime();
            this.notes = record.getNotes();
            if (record.getExecutedBy() != null) {
                this.executedBy = new UserResponse(record.getExecutedBy());
            }
        }
    }

    @Data
    public static class ReviewResponse {
        private Long id;
        private Integer rating;
        private String content;
        private String images;
        private Integer serviceAttitudeRating;
        private Integer professionalRating;
        private Integer speedRating;
        private Boolean isAnonymous;
        private LocalDateTime createdAt;

        public ReviewResponse(com.pethome.model.AppointmentReview review) {
            this.id = review.getId();
            this.rating = review.getRating();
            this.content = review.getContent();
            this.images = review.getImages();
            this.serviceAttitudeRating = review.getServiceAttitudeRating();
            this.professionalRating = review.getProfessionalRating();
            this.speedRating = review.getSpeedRating();
            this.isAnonymous = review.getIsAnonymous();
            this.createdAt = review.getCreatedAt();
        }
    }
}
