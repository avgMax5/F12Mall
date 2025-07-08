package com.avgmax.trade.domain;

import java.math.BigDecimal;
import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;
import com.avgmax.global.exception.ErrorCode;
import com.avgmax.trade.exception.TradeException;

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
public class UserCoin extends BaseTimeEntity {
    
    @Builder.Default
    private String userCoinId = UUID.randomUUID().toString();

    private String holderId;

    private String coinId;

    @Builder.Default
    private BigDecimal holdQuantity = new BigDecimal(1000);

    @Builder.Default
    private BigDecimal totalBuyAmount = new BigDecimal(1000000);

    public void plusUserCoin(BigDecimal quantity, BigDecimal unitPrice) {
        this.holdQuantity = this.holdQuantity.add(quantity);
        this.totalBuyAmount = this.totalBuyAmount.add(unitPrice.multiply(quantity));
    }

    public void minusUserCoin(BigDecimal quantity, BigDecimal unitPrice) {
        if (this.holdQuantity.compareTo(quantity) < 0) {
            throw TradeException.of(ErrorCode.INSUFFICIENT_COIN_QUANTITY);
        }
        this.holdQuantity = this.holdQuantity.subtract(quantity);
        this.totalBuyAmount = this.totalBuyAmount.subtract(unitPrice.multiply(quantity));
    }

    public static UserCoin init(String holderId, String coinId) {
        return UserCoin.builder()
            .holderId(holderId)
            .coinId(coinId)
            .holdQuantity(BigDecimal.ZERO)
            .totalBuyAmount(BigDecimal.ZERO)
            .build();
    }
}