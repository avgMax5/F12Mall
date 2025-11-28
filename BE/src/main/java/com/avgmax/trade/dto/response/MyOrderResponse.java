package com.avgmax.trade.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.avgmax.trade.domain.Order;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MyOrderResponse {
    private String tradeId;
    private LocalDateTime orderedAt;
    private String orderType;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal executeAmount;

    public static MyOrderResponse from(Order order) {
        return MyOrderResponse.builder()
            .tradeId(order.getOrderId())
            .orderedAt(order.getCreatedAt())
            .orderType(order.getOrderType().name())
            .quantity(order.getQuantity())
            .unitPrice(order.getUnitPrice())
            .executeAmount(order.getOrderType().calculateExecuteAmount(order.getQuantity(), order.getUnitPrice()))
            .build();
    }
}
