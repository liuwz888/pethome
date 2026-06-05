package com.pethome.service;

import com.pethome.dto.PaymentRequest;
import com.pethome.model.Payment;
import com.pethome.model.Payment.PaymentStatus;
import com.pethome.model.Payment.PaymentMethod;
import com.pethome.model.Order;
import com.pethome.repository.PaymentRepository;
import com.pethome.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Payment createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("订单不存在: " + request.getOrderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(PaymentMethod.valueOf(request.getMethod()));
        payment.setAmount(order.getAmount());
        payment.setTransactionId(request.getTransactionId());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(java.time.LocalDateTime.now());
        payment.setUpdatedAt(java.time.LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentId));
        payment.setStatus(status);
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processRefund(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("当前状态不允许退款");
        }

        payment.setStatus(PaymentStatus.REFUNDING);
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        // Simulate refund process
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setUpdatedAt(java.time.LocalDateTime.now());

        // Update order status
        Order order = payment.getOrder();
        order.setStatus(Order.OrderStatus.REFUNDED);
        orderRepository.save(order);

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public Optional<Payment> findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream().findFirst();
    }
}
