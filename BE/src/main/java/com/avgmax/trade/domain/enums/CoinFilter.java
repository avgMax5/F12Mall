package com.avgmax.trade.domain.enums;

public enum CoinFilter {
    ALL, SURGING, PRICE;

    public static CoinFilter from(String filter) {
        if(filter == null) return ALL;
        try {
            return CoinFilter.valueOf(filter.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ALL;
        }
    }
}