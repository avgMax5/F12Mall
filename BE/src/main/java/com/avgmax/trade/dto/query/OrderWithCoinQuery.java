package com.avgmax.trade.dto.query;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderWithCoinQuery {
    private BigDecimal quantity;
    private String orderType;
    private BigDecimal unitPrice;
    private BigDecimal fluctuationRate;
}
