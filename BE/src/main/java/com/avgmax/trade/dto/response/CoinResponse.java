package com.avgmax.trade.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CoinResponse {
    private String coinId;
    private String image;
    private String coinName;
    private String creatorName;
    private BigDecimal currentPrice;
    private BigDecimal changePrice;
    private BigDecimal changeRate;
}
