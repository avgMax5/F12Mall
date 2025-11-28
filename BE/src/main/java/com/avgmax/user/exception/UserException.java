package com.avgmax.user.exception;

import com.avgmax.global.exception.BusinessException;
import com.avgmax.global.exception.ErrorCode;

public class UserException extends BusinessException {
    public UserException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static UserException of(ErrorCode errorCode) {
        return new UserException(errorCode);
    }
}
