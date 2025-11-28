package com.avgmax.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:application.yml", factory = YamlPropertySourceFactory.class)
public class TradeConfig {

    private static double feeRate;

    @Value("${app.trade.fee-rate}")
    public void setFeeRate(double feeRate) {
        TradeConfig.feeRate = feeRate;
    }

    public static BigDecimal getFeeRate() {
        return BigDecimal.valueOf(feeRate);
    }
} 