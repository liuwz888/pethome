package com.pethome.controller;

import com.pethome.dto.OrderRequest;
import com.pethome.dto.OrderResponse;
import com.pethome.model.Order;
import com.pethome.model.Order.OrderStatus;
import com.pethome.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PET_OWNER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PET_OWNER', 'SERVICE')")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SERVICE')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'PET_OWNER')")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PET_OWNER', 'SERVICE')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
}
