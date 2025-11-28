package com.avgmax.trade.domain.enums;

import java.math.BigDecimal;

import com.avgmax.config.TradeConfig;

public enum OrderType {
    BUY {
        @Override
        public BigDecimal calculateExecuteAmount(BigDecimal quantity, BigDecimal unitPrice) {
            BigDecimal amount = quantity.multiply(unitPrice);
            BigDecimal feeRate = BigDecimal.ONE.add(TradeConfig.getFeeRate().divide(BigDecimal.valueOf(100)));
            return amount.multiply(feeRate);
        }
    },
    SELL {
        @Override
        public BigDecimal calculateExecuteAmount(BigDecimal quantity, BigDecimal unitPrice) {
            return quantity.multiply(unitPrice);
        }
    };

    public abstract BigDecimal calculateExecuteAmount(BigDecimal quantity, BigDecimal unitPrice);
}
