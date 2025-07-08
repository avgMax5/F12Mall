package com.avgmax.trade.dto.response;

import java.math.BigDecimal;

import com.avgmax.trade.dto.query.OrderWithCoinQuery;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OrderBookResponse {
    private String coinId;
    private String orderType;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal fluctuationRate;

    public static OrderBookResponse from(OrderWithCoinQuery orderWithCoinQuery) {
        return OrderBookResponse.builder()
                .coinId(orderWithCoinQuery.getCoinId())
                .orderType(orderWithCoinQuery.getOrderType())
                .quantity(orderWithCoinQuery.getQuantity())
                .unitPrice(orderWithCoinQuery.getUnitPrice())
                .fluctuationRate(orderWithCoinQuery.getFluctuationRate())
                .build();
    }
}
