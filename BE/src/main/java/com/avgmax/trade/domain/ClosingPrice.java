package com.avgmax.trade.domain;

import com.avgmax.global.base.BaseTimeEntity;
import com.avgmax.trade.dto.query.TradeWithCoinQuery;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ClosingPrice extends BaseTimeEntity {

    @Builder.Default
    private String closingPriceId = UUID.randomUUID().toString();

    private String coinId;

    private BigDecimal unitPrice;

    private LocalDate tradeDate;

    private BigDecimal highPrice;

    private BigDecimal lowPrice;

    private BigDecimal buyQuantity;

    private BigDecimal sellQuantity;

    public static ClosingPrice init(String coinId) {
        return ClosingPrice.builder()
                .coinId(coinId)
                .unitPrice(BigDecimal.valueOf(1000))
                .tradeDate(LocalDate.now().minusDays(1))
                .highPrice(BigDecimal.valueOf(1000))
                .lowPrice(BigDecimal.ZERO)
                .buyQuantity(BigDecimal.ZERO)
                .sellQuantity(BigDecimal.ZERO)
                .build();
    }

    public static ClosingPrice toEntity(TradeWithCoinQuery tradeWithCoinQuery) {
        return ClosingPrice.builder()
                .coinId(tradeWithCoinQuery.getCoinId())
                .unitPrice(tradeWithCoinQuery.getUnitPrice())
                .tradeDate(LocalDate.now().minusDays(1)) // 자정에 실행되므로 날짜가 바뀜
                .highPrice(tradeWithCoinQuery.getHighPrice())
                .lowPrice(tradeWithCoinQuery.getLowPrice())
                .buyQuantity(tradeWithCoinQuery.getBuyQuantity())
                .sellQuantity(tradeWithCoinQuery.getSellQuantity())
                .build();
    }
}
