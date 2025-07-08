package com.avgmax.trade.dto.data;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class OrderMatchResult {
    private BigDecimal remainingQuantity;
    private BigDecimal executedAmount;
} 