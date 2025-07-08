package com.avgmax.user.dto.response;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.avgmax.trade.dto.query.UserCoinWithCoinWithCreatorQuery;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserCoinResponse {
    private String coinId; // coinId
    private String creatorId; // userId
    private String coinName; // creatorUsername
    private String creatorName; // creatorName
    private String creatorImage;
    private BigDecimal holdQuantity; // 보유 수량 => holdQuantity
    private BigDecimal currentBuyAmount; // 평가금액 => holdQuantity * coinCurrentPrice
    private BigDecimal sellableQuantity; // 매도 가능 수량 => holdQuantity - SUM(ORDER QUANTITY) WHERE ORDER_TYPE = SELL
    private BigDecimal buyPrice; // 매수 단가 => totalBuyAmount / holdQuantity
    private BigDecimal totalBuyAmount; // 매수 금액 => totalBuyAmount
    private BigDecimal currentPrice; // 현재가 => coinCurrentPrice
    private BigDecimal valuationRate; // 수익률 => (currentPrice - buyPrice) / buyPrice * 100

    public static UserCoinResponse from(UserCoinWithCoinWithCreatorQuery userCoin, BigDecimal sellingQuantity) {
        BigDecimal buyPrice = userCoin.getHoldQuantity().compareTo(BigDecimal.ZERO) == 0 
            ? BigDecimal.ZERO 
            : userCoin.getTotalBuyAmount().divide(userCoin.getHoldQuantity(), 6, RoundingMode.HALF_UP);
    
        BigDecimal valuationRate = buyPrice.compareTo(BigDecimal.ZERO) == 0
            ? BigDecimal.ZERO
            : userCoin.getCoinCurrentPrice()
                .subtract(buyPrice)
                .divide(buyPrice, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    
        return UserCoinResponse.builder()
            .coinId(userCoin.getCoinId())
            .creatorId(userCoin.getCreatorId())
            .coinName(userCoin.getCreatorUsername())
            .creatorId(userCoin.getCreatorId())
            .creatorName(userCoin.getCreatorName())
            .creatorImage(userCoin.getCreatorImage())
            .holdQuantity(userCoin.getHoldQuantity())
            .currentBuyAmount(userCoin.getHoldQuantity().multiply(userCoin.getCoinCurrentPrice())) // SSE
            .sellableQuantity(userCoin.getHoldQuantity().subtract(sellingQuantity))
            .buyPrice(buyPrice)
            .totalBuyAmount(userCoin.getTotalBuyAmount())
            .currentPrice(userCoin.getCoinCurrentPrice()) // SSE
            .valuationRate(valuationRate) // SSE
            .build();
    }    
}
