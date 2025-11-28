package com.avgmax.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // User
    USER_SIGNUP_FAILED("회원가입 중 오류가 발생했습니다.", HttpStatus.BAD_REQUEST),
    MAX_UPLOAD_SIZE_EXCEEDED("파일 크기가 10MB를 초과했습니다.", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED("파일 업로드 중 오류가 발생했습니다.", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    PASSWORD_MISMATCH("비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),
    INVALID_DEPOSIT_AMOUNT("입금액은 0보다 커야 합니다.", HttpStatus.BAD_REQUEST),
    INVALID_WITHDRAWAL_AMOUNT("출금액은 0보다 커야 합니다.", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE("잔액이 부족합니다.", HttpStatus.BAD_REQUEST),

    // Trade
    ORDER_ALREADY_COMPLETED("이미 체결된 주문입니다.", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_TYPE("잘못된 주문 타입입니다.", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND("주문를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ORDER_USER_MISMATCH("해당 주문에 대한 권한이 없습니다.", HttpStatus.FORBIDDEN),
    ORDER_COIN_MISMATCH("주문와 코인 정보가 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_QUANTITY("잔여 주문 수량이 0보다 작습니다.", HttpStatus.BAD_REQUEST),

    // coin
    COIN_INFO_NOT_FOUND("코인 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INSUFFICIENT_COIN_QUANTITY("보유한 코인 수량이 부족합니다.", HttpStatus.BAD_REQUEST),
    USER_COIN_NOT_FOUND("사용자 코인을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    private final String message;
    private final HttpStatus status;

    ErrorCode(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public int getStatus() { return status.value(); }
}