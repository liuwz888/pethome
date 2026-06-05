package com.pethome.controller;

import com.pethome.dto.PaymentRequest;
import com.pethome.model.Payment;
import com.pethome.model.Payment.PaymentStatus;
import com.pethome.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PET_OWNER', 'SERVICE')")
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Payment> updateStatus(@PathVariable Long id, @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Payment> refund(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.processRefund(id));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PET_OWNER', 'SERVICE')")
    public ResponseEntity<Payment> getByOrderId(@PathVariable Long orderId) {
        return paymentService.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
