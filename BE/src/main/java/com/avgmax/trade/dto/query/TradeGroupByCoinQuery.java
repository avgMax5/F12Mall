package com.avgmax.trade.dto.query;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TradeGroupByCoinQuery {
    private String coinId;
    private BigDecimal tradeVolume;
    private BigDecimal lowestPrice;
    private BigDecimal highestPrice;

    public static TradeGroupByCoinQuery init(String coinId) {
        return TradeGroupByCoinQuery.builder()
                .coinId(coinId)
                .tradeVolume(BigDecimal.ZERO)
                .lowestPrice(BigDecimal.valueOf(1000))
                .highestPrice(BigDecimal.valueOf(1000))
                .build();
    }
}