package com.avgmax.trade.exception;

import com.avgmax.global.exception.BusinessException;
import com.avgmax.global.exception.ErrorCode;

public class TradeException extends BusinessException {
    public TradeException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static TradeException of(ErrorCode errorCode) {
        return new TradeException(errorCode);
    }
}
