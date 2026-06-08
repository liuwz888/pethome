package com.pethome.service;

import com.pethome.dto.AppointmentRequest;
import com.pethome.dto.AppointmentResponse;
import com.pethome.model.*;
import com.pethome.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentPhaseRecordRepository phaseRecordRepository;
    private final AppointmentReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments() {
        User currentUser = getAuthenticatedUser();
        return appointmentRepository.findByPetOwnerId(currentUser.getId()).stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByStatus(Appointment.AppointmentStatus status) {
        return appointmentRepository.findByStatus(status).stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("预约不存在: " + id));
        return new AppointmentResponse(appointment);
    }

    /**
     * 创建预约
     * 状态: BOOKED (待发布)
     * 流程阶段: BOOKED (需求创建)
     */
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentNumber("APT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                (int)(Math.random() * 1000));
        appointment.setStatus(Appointment.AppointmentStatus.BOOKED);
        appointment.setPhase(Appointment.ServicePhase.BOOKED);
        appointment.setType(Appointment.AppointmentType.valueOf(request.getType().name()));
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());
        appointment.setScheduledTime(request.getScheduledTime());
        appointment.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60);
        appointment.setAddress(request.getAddress());
        appointment.setLatitude(request.getLatitude());
        appointment.setLongitude(request.getLongitude());
        appointment.setPhoneNumber(request.getPhoneNumber());
        appointment.setPetInfo(request.getPetInfo());
        appointment.setAmount(request.getAmount());
        appointment.setPaymentMethod(request.getPaymentMethod());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        // 关联当前登录用户作为宠物主
        User currentUser = getAuthenticatedUser();
        appointment.setPetOwner(currentUser);

        // 如果指定了服务提供商，关联服务提供商
        if (request.getServiceProviderId() != null) {
            User serviceProvider = userRepository.findById(request.getServiceProviderId())
                    .orElseThrow(() -> new RuntimeException("服务提供商不存在: " + request.getServiceProviderId()));
            appointment.setServiceProvider(serviceProvider);
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 处理预约项
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (AppointmentRequest.AppointmentItemRequest itemRequest : request.getItems()) {
                AppointmentItem item = new AppointmentItem();
                item.setAppointment(savedAppointment);
                item.setServiceName(itemRequest.getServiceName());
                item.setPrice(itemRequest.getPrice());
                item.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1);
                item.setTotalPrice(itemRequest.getPrice().multiply(
                        BigDecimal.valueOf(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1)));

                savedAppointment.getItems().add(item);
            }
            appointmentRepository.save(savedAppointment);
        }

        // 记录创建环节（在保存后，确保 appointment 有 ID）
        recordPhase(savedAppointment, Appointment.ServicePhase.BOOKED, "需求创建成功", currentUser);

        log.info("创建需求成功: {} by user: {}", savedAppointment.getAppointmentNumber(), currentUser.getUsername());

        // 发送预约确认邮件
        try {
            String toEmail = currentUser.getEmail();
            if (toEmail != null && !toEmail.isEmpty()) {
                emailService.sendAppointmentConfirmation(toEmail, savedAppointment.getAppointmentNumber(),
                        savedAppointment.getType().getDescription(), savedAppointment.getScheduledTime());
            }
        } catch (Exception e) {
            log.warn("发送预约确认邮件失败: {}", e.getMessage());
        }

        return new AppointmentResponse(savedAppointment);
    }

    /**
     * 发布需求
     * 状态: BOOKED -> PUBLISHED (待接单)
     * 流程阶段: BOOKED -> PUBLISHED
     */
    @Transactional
    public AppointmentResponse publishAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("需求不存在: " + appointmentId));

        // 检查是否是需求方操作
        User currentUser = getAuthenticatedUser();
        if (!appointment.getPetOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("只有需求方才能发布需求");
        }

        // 检查当前状态
        if (appointment.getStatus() != Appointment.AppointmentStatus.BOOKED) {
            throw new RuntimeException("只有待发布的需求才能发布");
        }

        // 更新状态为已发布
        appointment.setStatus(Appointment.AppointmentStatus.PUBLISHED);
        appointment.setPhase(Appointment.ServicePhase.PUBLISHED);
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);

        // 记录发布环节
        recordPhase(updated, Appointment.ServicePhase.PUBLISHED, "需求已发布，等待服务方接单", currentUser);

        log.info("发布需求成功: {} by user: {}", appointmentId, currentUser.getUsername());

        return new AppointmentResponse(updated);
    }

    /**
     * 更新预约状态
     * 状态流转: BOOKED -> ACCEPTED -> ON_WAY -> STARTED -> COMPLETED -> PAID
     */
    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, Appointment.AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在: " + appointmentId));

        // 检查状态流转合法性
        validateStatusTransition(appointment.getStatus(), status);

        // 更新状态
        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());

        // 根据新状态更新服务流程阶段
        Appointment.ServicePhase newPhase = mapStatusToPhase(status);
        appointment.setPhase(newPhase);

        // 记录服务流程环节
        User currentUser = getAuthenticatedUser();
        recordPhase(appointment, newPhase, null, currentUser);

        Appointment updated = appointmentRepository.save(appointment);
        log.info("更新预约状态: {} -> {}, 阶段: {} -> {}", appointmentId, status, appointment.getPhase(), newPhase);

        // 发送状态更新邮件
        try {
            User user = updated.getPetOwner();
            if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                String statusText = status.getDescription();
                emailService.sendAppointmentStatusUpdate(user.getEmail(), updated.getAppointmentNumber(),
                        statusText, "您的预约状态已更新");
            }
        } catch (Exception e) {
            log.warn("发送预约状态更新邮件失败: {}", e.getMessage());
        }

        return new AppointmentResponse(updated);
    }

    /**
     * 更新服务流程阶段
     * 用于服务方记录每个环节的开始和完成
     */
    @Transactional
    public AppointmentResponse updatePhase(Long appointmentId, String phase, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在: " + appointmentId));

        Appointment.ServicePhase newPhase = Appointment.ServicePhase.valueOf(phase);
        appointment.setPhase(newPhase);
        appointment.setUpdatedAt(LocalDateTime.now());

        // 记录服务流程环节
        User currentUser = getAuthenticatedUser();
        recordPhase(appointment, newPhase, notes, currentUser);

        Appointment updated = appointmentRepository.save(appointment);
        log.info("更新预约阶段: {} -> {}, 备注: {}", appointmentId, newPhase, notes);

        return new AppointmentResponse(updated);
    }

    /**
     * 服务方接单
     */
    @Transactional
    public AppointmentResponse acceptAppointment(Long appointmentId) {
        return updateStatus(appointmentId, Appointment.AppointmentStatus.ACCEPTED);
    }

    /**
     * 服务方开始上门准备
     */
    @Transactional
    public AppointmentResponse startPreparing(Long appointmentId) {
        return updatePhase(appointmentId, "PREPARING", "服务方开始准备上门");
    }

    /**
     * 服务方到达用户地址
     */
    @Transactional
    public AppointmentResponse arrivedAtLocation(Long appointmentId) {
        return updatePhase(appointmentId, "ARRIVED", "服务方已到达用户地址");
    }

    /**
     * 服务方开始服务
     */
    @Transactional
    public AppointmentResponse startService(Long appointmentId) {
        return updateStatus(appointmentId, Appointment.AppointmentStatus.STARTED);
    }

    /**
     * 服务方完成服务
     */
    @Transactional
    public AppointmentResponse completeService(Long appointmentId) {
        return updateStatus(appointmentId, Appointment.AppointmentStatus.COMPLETED);
    }

    /**
     * 用户完成支付
     */
    @Transactional
    public AppointmentResponse markAsPaid(Long appointmentId) {
        return updateStatus(appointmentId, Appointment.AppointmentStatus.PAID);
    }

    /**
     * 添加服务评价
     */
    @Transactional
    public AppointmentResponse addReview(Long appointmentId, AppointmentRequest.ReviewRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在: " + appointmentId));

        // 检查是否已完成服务
        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED &&
            appointment.getStatus() != Appointment.AppointmentStatus.PAID) {
            throw new RuntimeException("只有已完成的服务才能评价");
        }

        // 检查是否已评价
        if (appointment.getReview() != null) {
            throw new RuntimeException("该服务已评价");
        }

        AppointmentReview review = new AppointmentReview();
        review.setAppointment(appointment);
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setImages(request.getImages());
        review.setServiceAttitudeRating(request.getServiceAttitudeRating());
        review.setProfessionalRating(request.getProfessionalRating());
        review.setSpeedRating(request.getSpeedRating());
        review.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        AppointmentReview savedReview = reviewRepository.save(review);

        // 更新服务流程阶段为已完成
        appointment.setPhase(Appointment.ServicePhase.CLOSED);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment.setReview(review);

        recordPhase(appointment, Appointment.ServicePhase.CLOSED, "用户已完成评价", getAuthenticatedUser());

        Appointment updated = appointmentRepository.save(appointment);
        log.info("添加服务评价: {}, 评分: {}", appointmentId, request.getRating());

        return new AppointmentResponse(updated);
    }

    /**
     * 取消预约
     */
    @Transactional
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在: " + appointmentId));

        User currentUser = getAuthenticatedUser();
        if (!appointment.getPetOwner().getId().equals(currentUser.getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("无权取消此预约");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED ||
            appointment.getStatus() == Appointment.AppointmentStatus.PAID) {
            throw new RuntimeException("已完成或已支付的预约不能取消");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setPhase(Appointment.ServicePhase.CLOSED);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
        log.info("取消预约: {}", appointmentId);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPetOwner(Long petOwnerId) {
        return appointmentRepository.findByPetOwnerId(petOwnerId).stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByServiceProvider(Long serviceProviderId) {
        return appointmentRepository.findByServiceProviderId(serviceProviderId).stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAvailableTimeSlots(Long serviceProviderId, LocalDateTime date) {
        User serviceProvider = userRepository.findById(serviceProviderId)
                .orElseThrow(() -> new RuntimeException("服务提供商不存在: " + serviceProviderId));

        LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);

        List<Appointment> appointments = appointmentRepository.findByServiceProviderIdAndScheduledTimeBetween(
                serviceProviderId, startOfDay, endOfDay);

        return appointments.stream()
                .map(AppointmentResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 记录服务流程环节
     */
    private void recordPhase(Appointment appointment, Appointment.ServicePhase phase, String notes, User user) {
        AppointmentPhaseRecord record = new AppointmentPhaseRecord();
        record.setAppointment(appointment);
        record.setPhase(phase);
        record.setStartTime(LocalDateTime.now());
        record.setNotes(notes);
        record.setExecutedBy(user);
        phaseRecordRepository.save(record);
    }

    /**
     * 验证状态流转合法性
     */
    private void validateStatusTransition(Appointment.AppointmentStatus current, Appointment.AppointmentStatus target) {
        boolean isValid = false;
        switch (current) {
            case BOOKED:
                isValid = target == Appointment.AppointmentStatus.PUBLISHED ||
                         target == Appointment.AppointmentStatus.CANCELLED ||
                         target == Appointment.AppointmentStatus.NO_SHOW;
                break;
            case PUBLISHED:
                isValid = target == Appointment.AppointmentStatus.ACCEPTED ||
                         target == Appointment.AppointmentStatus.CANCELLED ||
                         target == Appointment.AppointmentStatus.NO_SHOW;
                break;
            case ACCEPTED:
                isValid = target == Appointment.AppointmentStatus.ON_WAY ||
                         target == Appointment.AppointmentStatus.STARTED ||
                         target == Appointment.AppointmentStatus.CANCELLED;
                break;
            case ON_WAY:
                isValid = target == Appointment.AppointmentStatus.STARTED ||
                         target == Appointment.AppointmentStatus.CANCELLED;
                break;
            case STARTED:
                isValid = target == Appointment.AppointmentStatus.COMPLETED ||
                         target == Appointment.AppointmentStatus.CANCELLED;
                break;
            case COMPLETED:
                isValid = target == Appointment.AppointmentStatus.PAID;
                break;
            case PAID:
                isValid = false; // 已支付不能改变状态
                break;
            case CANCELLED:
            case NO_SHOW:
                isValid = false; // 已取消或爽约不能改变状态
                break;
        }

        if (!isValid) {
            throw new RuntimeException("不允许的状态流转: " + current + " -> " + target);
        }
    }

    /**
     * 将状态映射到服务流程阶段
     */
    private Appointment.ServicePhase mapStatusToPhase(Appointment.AppointmentStatus status) {
        switch (status) {
            case BOOKED: return Appointment.ServicePhase.BOOKED;
            case PUBLISHED: return Appointment.ServicePhase.PUBLISHED;
            case ACCEPTED: return Appointment.ServicePhase.ACCEPTED;
            case ON_WAY: return Appointment.ServicePhase.PREPARING;
            case STARTED: return Appointment.ServicePhase.IN_PROGRESS;
            case COMPLETED: return Appointment.ServicePhase.COMPLETED;
            case PAID: return Appointment.ServicePhase.CLOSED;
            case CANCELLED: return Appointment.ServicePhase.CLOSED;
            case NO_SHOW: return Appointment.ServicePhase.CLOSED;
            default: return Appointment.ServicePhase.BOOKED;
        }
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String username) {
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
        }
        if (principal instanceof com.pethome.model.User user) {
            return user;
        }
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + userDetails.getUsername()));
        }
        throw new IllegalStateException("Unable to determine authenticated user");
    }
}
