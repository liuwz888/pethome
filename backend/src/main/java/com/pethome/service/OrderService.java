package com.pethome.service;

import com.pethome.dto.OrderRequest;
import com.pethome.dto.OrderResponse;
import com.pethome.model.*;
import com.pethome.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User currentUser = getAuthenticatedUser();
        return orderRepository.findByPetOwnerId(currentUser.getId()).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));
        return new OrderResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setOrderNumber("ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                (int)(Math.random() * 1000));
        order.setAddress(request.getAddress());
        order.setServiceType(request.getServiceType());
        order.setScheduledTime(request.getScheduledTime());
        order.setAmount(request.getAmount());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // 关联当前登录用户作为宠物主
        User currentUser = getAuthenticatedUser();
        order.setPetOwner(currentUser);

        // 如果指定了商品，关联商品
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在: " + request.getProductId()));
            order.setProduct(product);
            order.setType(Order.OrderType.PRODUCT);
        } else {
            order.setType(Order.OrderType.SERVICE);
        }

        Order savedOrder = orderRepository.save(order);

        // 处理订单项
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("商品不存在: " + itemRequest.getProductId()));

                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProduct(product);
                item.setQuantity(itemRequest.getQuantity());
                item.setPrice(product.getPrice());
                item.setProductName(product.getName());

                savedOrder.getItems().add(item);
            }
            orderRepository.save(savedOrder);
        }

        log.info("创建订单成功: {} by user: {}", savedOrder.getOrderNumber(), currentUser.getUsername());

        // 发送订单确认邮件
        try {
            String toEmail = currentUser.getEmail();
            if (toEmail != null && !toEmail.isEmpty()) {
                emailService.sendOrderConfirmation(toEmail, savedOrder.getOrderNumber(),
                        savedOrder.getType() == Order.OrderType.PRODUCT ? "商品订单" : "服务订单");
            }
        } catch (Exception e) {
            log.warn("发送订单确认邮件失败: {}", e.getMessage());
        }

        return new OrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + orderId));
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);
        log.info("更新订单状态: {} -> {}", orderId, status);

        // 发送订单状态更新邮件
        try {
            User user = updated.getPetOwner();
            if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                String statusText = status.getDescription();
                emailService.sendOrderStatusUpdate(user.getEmail(), updated.getOrderNumber(), statusText, "您的订单状态已更新");
            }
        } catch (Exception e) {
            log.warn("发送订单状态更新邮件失败: {}", e.getMessage());
        }

        return new OrderResponse(updated);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + orderId));

        User currentUser = getAuthenticatedUser();
        if (!order.getPetOwner().getId().equals(currentUser.getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("无权取消此订单");
        }

        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("已完成订单不能取消");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("取消订单: {}", orderId);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByPetOwner(Long petOwnerId) {
        return orderRepository.findByPetOwnerId(petOwnerId).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByServiceProvider(Long serviceProviderId) {
        return orderRepository.findByServiceProviderId(serviceProviderId).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String username) {
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
        }
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + userDetails.getUsername()));
        }
        throw new IllegalStateException("Unable to determine authenticated user");
    }
}
