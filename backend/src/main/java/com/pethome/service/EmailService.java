package com.pethome.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private static final String FROM_EMAIL = "noreply@pethome.com";

    public void sendOrderConfirmation(String toEmail, String orderNumber, String serviceName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("订单确认 - PetHome宠物服务平台");
            message.setText(buildOrderConfirmationToken(orderNumber, serviceName));
            javaMailSender.send(message);
            log.info("发送订单确认邮件成功: {} to {}", orderNumber, toEmail);
        } catch (Exception e) {
            log.error("发送订单确认邮件失败: {}", e.getMessage());
        }
    }

    public void sendOrderStatusUpdate(String toEmail, String orderNumber, String status, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(FROM_EMAIL);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject("订单状态更新 - PetHome宠物服务平台");
            mailMessage.setText(buildOrderStatusUpdateContent(orderNumber, status, message));
            javaMailSender.send(mailMessage);
            log.info("发送订单状态更新邮件成功: {} to {}", orderNumber, toEmail);
        } catch (Exception e) {
            log.error("发送订单状态更新邮件失败: {}", e.getMessage());
        }
    }

    public void sendServiceAssignment(String toEmail, String orderNumber, String serviceName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("服务分配通知 - PetHome宠物服务平台");
            message.setText(buildServiceAssignmentContent(orderNumber, serviceName));
            javaMailSender.send(message);
            log.info("发送服务分配邮件成功: {} to {}", orderNumber, toEmail);
        } catch (Exception e) {
            log.error("发送服务分配邮件失败: {}", e.getMessage());
        }
    }

    public void sendAppointmentConfirmation(String toEmail, String appointmentNumber, String serviceName, LocalDateTime scheduledTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("预约确认 - PetHome宠物服务平台");
            message.setText(buildAppointmentConfirmationToken(appointmentNumber, serviceName, scheduledTime));
            javaMailSender.send(message);
            log.info("发送预约确认邮件成功: {} to {}", appointmentNumber, toEmail);
        } catch (Exception e) {
            log.error("发送预约确认邮件失败: {}", e.getMessage());
        }
    }

    public void sendAppointmentStatusUpdate(String toEmail, String appointmentNumber, String status, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(FROM_EMAIL);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject("预约状态更新 - PetHome宠物服务平台");
            mailMessage.setText(buildAppointmentStatusUpdateContent(appointmentNumber, status, message));
            javaMailSender.send(mailMessage);
            log.info("发送预约状态更新邮件成功: {} to {}", appointmentNumber, toEmail);
        } catch (Exception e) {
            log.error("发送预约状态更新邮件失败: {}", e.getMessage());
        }
    }

    private String buildOrderConfirmationToken(String orderNumber, String serviceName) {
        return String.format(
                "尊敬的用户，您好！\n\n" +
                "您的订单已成功创建！\n\n" +
                "订单号: %s\n" +
                "服务类型: %s\n\n" +
                "我们会尽快处理您的订单，并通过电话或短信与您联系确认具体服务时间。\n\n" +
                "如有任何问题，请联系我们的客服热线：400-123-4567\n\n" +
                "感谢您选择PetHome宠物服务平台！",
                orderNumber, serviceName
        );
    }

    private String buildOrderStatusUpdateContent(String orderNumber, String status, String message) {
        return String.format(
                "尊敬的用户，您好！\n\n" +
                "您的订单状态已更新！\n\n" +
                "订单号: %s\n" +
                "新状态: %s\n\n" +
                "%s\n\n" +
                "感谢您对PetHome宠物服务平台的支持！",
                orderNumber, status, message
        );
    }

    private String buildServiceAssignmentContent(String orderNumber, String serviceName) {
        return String.format(
                "尊敬的用户，您好！\n\n" +
                "您的订单 %s 已分配服务人员！\n" +
                "服务类型: %s\n\n" +
                "服务人员将尽快与您联系确认具体服务时间。\n\n" +
                "感谢您选择PetHome宠物服务平台！",
                orderNumber, serviceName
        );
    }

    private String buildAppointmentConfirmationToken(String appointmentNumber, String serviceName, LocalDateTime scheduledTime) {
        return String.format(
                "尊敬的用户，您好！\n\n" +
                "您的预约已成功创建！\n\n" +
                "预约号: %s\n" +
                "服务类型: %s\n" +
                "预约时间: %s\n\n" +
                "我们会按时为您提供服务。如有任何问题，请联系我们的客服热线：400-123-4567\n\n" +
                "感谢您选择PetHome宠物服务平台！",
                appointmentNumber, serviceName, scheduledTime
        );
    }

    private String buildAppointmentStatusUpdateContent(String appointmentNumber, String status, String message) {
        return String.format(
                "尊敬的用户，您好！\n\n" +
                "您的预约状态已更新！\n\n" +
                "预约号: %s\n" +
                "新状态: %s\n\n" +
                "%s\n\n" +
                "感谢您对PetHome宠物服务平台的支持！",
                appointmentNumber, status, message
        );
    }
}
