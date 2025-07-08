package com.avgmax.trade.dto.response;

import com.avgmax.trade.domain.Order;
import com.avgmax.trade.domain.enums.OrderType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OrderResponse {
    private String orderId;
    private String userId;
    private String coinId;
    private String orderedAt;
    private OrderType orderType;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal executeAmount;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
            .orderId(order.getOrderId())
            .userId(order.getUserId())
            .coinId(order.getCoinId())
            .orderedAt(order.getCreatedAt().toString())
            .orderType(order.getOrderType())
            .quantity(order.getQuantity())
            .unitPrice(order.getUnitPrice())
            .executeAmount(order.getOrderType().calculateExecuteAmount(order.getQuantity(), order.getUnitPrice()))
            .build();
    }
}