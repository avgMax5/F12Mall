package com.avgmax.trade.domain;

import java.math.BigDecimal;
import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;
import com.avgmax.trade.domain.enums.OrderType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trade extends BaseTimeEntity {

    @Builder.Default
    private String tradeId = UUID.randomUUID().toString();

    private String coinId;

    private String sellUserId;

    private String buyUserId;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    public static Trade of(OrderType requestType, Order buyOrder, Order sellOrder, BigDecimal tradableQuantity, BigDecimal executedPrice) {
        Order matchedOrder = (requestType == OrderType.BUY) ? sellOrder : buyOrder;
        return Trade.builder()
            .coinId(matchedOrder.getCoinId())
            .buyUserId(buyOrder.getUserId())
            .sellUserId(sellOrder.getUserId())
            .quantity(tradableQuantity)
            .unitPrice(executedPrice)
            .build();
    }
}
