package com.avgmax.trade.dto.request;

import java.math.BigDecimal;

import com.avgmax.trade.domain.Order;
import com.avgmax.trade.domain.enums.OrderType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OrderRequest {
    private OrderType orderType;
    private BigDecimal orderFis;
    private BigDecimal orderPrice;

    public Order toEntity(String userId, String coinId) {
        return Order.builder()
            .userId(userId)
            .coinId(coinId)
            .orderType(this.orderType)
            .quantity(this.orderFis)
            .unitPrice(this.orderPrice)
            .build();
    }
}
