package com.avgmax.trade.domain;

import java.math.BigDecimal;
import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;

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
public class Coin extends BaseTimeEntity {
    @Builder.Default
    private String coinId = UUID.randomUUID().toString();

    private String creatorId;

    @Builder.Default
    private BigDecimal currentPrice = new BigDecimal(1000);

    @Builder.Default
    private BigDecimal closingPrice = new BigDecimal(1000);
}