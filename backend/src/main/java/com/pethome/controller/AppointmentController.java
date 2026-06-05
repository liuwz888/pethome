package com.pethome.controller;

import com.pethome.dto.AppointmentRequest;
import com.pethome.dto.AppointmentResponse;
import com.pethome.model.Appointment;
import com.pethome.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * 创建预约
     * 状态: BOOKED (待发布)
     */
    @PostMapping
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse appointment = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    /**
     * 发布需求
     * 状态: BOOKED -> PUBLISHED (待接单)
     */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<AppointmentResponse> publishAppointment(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.publishAppointment(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 获取当前用户的所有预约
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getMyAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * 获取所有预约（管理员）
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * 根据ID获取预约详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE', 'ADMIN')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 服务方接单
     */
    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<AppointmentResponse> acceptAppointment(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.acceptAppointment(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 服务方开始上门准备
     */
    @PatchMapping("/{id}/prepare")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<AppointmentResponse> startPreparing(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.startPreparing(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 服务方到达用户地址
     */
    @PatchMapping("/{id}/arrive")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<AppointmentResponse> arrivedAtLocation(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.arrivedAtLocation(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 服务方开始服务
     */
    @PatchMapping("/{id}/start")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<AppointmentResponse> startService(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.startService(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 服务方完成服务
     */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<AppointmentResponse> completeService(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.completeService(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 用户完成支付
     */
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<AppointmentResponse> markAsPaid(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.markAsPaid(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 用户添加服务评价
     */
    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<AppointmentResponse> addReview(
            @PathVariable Long id,
            @RequestBody AppointmentRequest.ReviewRequest request) {
        AppointmentResponse appointment = appointmentService.addReview(id, request);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 更新预约状态
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE', 'ADMIN')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody AppointmentRequest.UpdateStatusRequest request) {
        Appointment.AppointmentStatus status = Appointment.AppointmentStatus.valueOf(request.getStatus());
        AppointmentResponse appointment = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 更新服务流程阶段
     */
    @PatchMapping("/{id}/phase")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE')")
    public ResponseEntity<AppointmentResponse> updatePhase(
            @PathVariable Long id,
            @RequestBody AppointmentRequest.UpdatePhaseRequest request) {
        AppointmentResponse appointment = appointmentService.updatePhase(id, request.getPhase(), request.getNotes());
        return ResponseEntity.ok(appointment);
    }

    /**
     * 取消预约
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 获取用户指定状态的预约
     */
    @GetMapping("/my/{status}")
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByStatus(
            @PathVariable String status) {
        Appointment.AppointmentStatus appointmentStatus = Appointment.AppointmentStatus.valueOf(status);
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByStatus(appointmentStatus);
        return ResponseEntity.ok(appointments);
    }

    /**
     * 获取服务提供商的可用时间段
     */
    @GetMapping("/available/{serviceProviderId}")
    @PreAuthorize("hasRole('PET_OWNER')")
    public ResponseEntity<List<AppointmentResponse>> getAvailableTimeSlots(
            @PathVariable Long serviceProviderId,
            @RequestParam("date") LocalDateTime date) {
        List<AppointmentResponse> slots = appointmentService.getAvailableTimeSlots(serviceProviderId, date);
        return ResponseEntity.ok(slots);
    }
}
