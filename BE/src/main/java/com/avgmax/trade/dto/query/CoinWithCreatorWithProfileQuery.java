package com.avgmax.trade.dto.query;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class CoinWithCreatorWithProfileQuery {

    //coin 정보
    private String coinId;
    private String creatorId;
    private BigDecimal currentPrice;
    private BigDecimal closingPrice;
    private BigDecimal changePrice;
    private BigDecimal fluctuationRate;
    private LocalDateTime createdAt;

    //user 정보
    private String creatorName;
    private String creatorUsername;
    private String creatorImage;

    //profile 정보
    private String profilePosition;
    private String profileBio;
}
