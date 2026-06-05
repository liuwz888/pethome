package com.pethome.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "订单ID不能为空")
    private Long orderId;
    @NotBlank(message = "支付方式不能为空")
    private String method; // WECHAT, ALIPAY, OFFLINE
    private String transactionId; // optional external transaction id
}
