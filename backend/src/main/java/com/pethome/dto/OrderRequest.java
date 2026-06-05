package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRequest {
    private Long productId;

    @NotBlank(message = "服务地址不能为空")
    private String address;

    @NotBlank(message = "服务类型不能为空")
    private String serviceType;

    @FutureOrPresent(message = "预约时间必须是当前或未来时间")
    private LocalDateTime scheduledTime;

    @NotNull(message = "金额不能为空")
    @Positive(message = "金额必须大于0")
    private BigDecimal amount;

    private String paymentMethod;

    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "商品ID不能为空")
        private Long productId;

        @Min(value = 1, message = "数量至少为1")
        private Integer quantity;
    }
}
