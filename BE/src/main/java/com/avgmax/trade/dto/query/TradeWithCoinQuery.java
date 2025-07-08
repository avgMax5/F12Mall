package com.avgmax.trade.dto.query;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TradeWithCoinQuery {
    private String coinId;
    private BigDecimal unitPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal buyQuantity;
    private BigDecimal sellQuantity;
}