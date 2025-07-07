package com.avgmax.trade.dto.response;

import com.avgmax.trade.dto.query.CoinWithCreatorWithProfileQuery;
import com.avgmax.trade.dto.query.TradeGroupByCoinQuery;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CoinFetchResponse {

    private String coinId; //coin
    private String coinName; //user
    private String userName; //user
    private BigDecimal currentPrice; //coin
    private BigDecimal closingPrice; //coin
    private BigDecimal changePrice; //coin
    private BigDecimal fluctuationRate; //coin
    private BigDecimal tradeVolume; //trade
    private BigDecimal lowestPrice; //trade
    private BigDecimal highestPrice; //trade
    private String profileImage; //user
    private String position; //profile
    private String bio; //profile

    public static CoinFetchResponse from(CoinWithCreatorWithProfileQuery coin, TradeGroupByCoinQuery trade) {
        return CoinFetchResponse.builder()
                .coinId(coin.getCoinId())
                .coinName(coin.getCreatorUsername())
                .userName(coin.getCreatorName())
                .currentPrice(coin.getCurrentPrice())
                .changePrice(coin.getChangePrice())
                .fluctuationRate(coin.getFluctuationRate())
                .tradeVolume(trade.getTradeVolume())
                .lowestPrice(trade.getLowestPrice())
                .highestPrice(trade.getHighestPrice())
                .profileImage(coin.getCreatorImage())
                .position(coin.getProfilePosition())
                .bio(coin.getProfileBio())
                .build();
    }
}