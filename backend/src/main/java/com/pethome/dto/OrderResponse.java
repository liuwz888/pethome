package com.pethome.dto;

import com.pethome.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private String type;
    private String address;
    private String serviceType;
    private LocalDateTime scheduledTime;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime createdAt;

    private Long petOwnerId;
    private String petOwnerUsername;

    private Long serviceProviderId;
    private String serviceProviderUsername;

    private Long productId;
    private String productName;

    private List<OrderItemResponse> items = new ArrayList<>();

    public OrderResponse(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.status = order.getStatus().name();
        this.type = order.getType().name();
        this.address = order.getAddress();
        this.serviceType = order.getServiceType();
        this.scheduledTime = order.getScheduledTime();
        this.amount = order.getAmount();
        this.paymentMethod = order.getPaymentMethod();
        this.createdAt = order.getCreatedAt();

        if (order.getPetOwner() != null) {
            this.petOwnerId = order.getPetOwner().getId();
            this.petOwnerUsername = order.getPetOwner().getUsername();
        }

        if (order.getServiceProvider() != null) {
            this.serviceProviderId = order.getServiceProvider().getId();
            this.serviceProviderUsername = order.getServiceProvider().getUsername();
        }

        if (order.getProduct() != null) {
            this.productId = order.getProduct().getId();
            this.productName = order.getProduct().getName();
        }

        if (order.getItems() != null) {
            this.items = order.getItems().stream()
                    .map(OrderItemResponse::new)
                    .collect(ArrayList::new, List::add, List::addAll);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemResponse(com.pethome.model.OrderItem item) {
            this.id = item.getId();
            this.productId = item.getProduct().getId();
            this.productName = item.getProductName();
            this.quantity = item.getQuantity();
            this.price = item.getPrice();
        }
    }
}
