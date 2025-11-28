package com.avgmax.user.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.avgmax.global.base.BaseTimeEntity;
import com.avgmax.global.exception.ErrorCode;
import com.avgmax.user.exception.UserException;
import com.avgmax.trade.domain.enums.OrderType;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseTimeEntity  {

    @Builder.Default
    private String userId = UUID.randomUUID().toString();

    private String name;

    private String email;

    private String username;

    private String pwd;
    
    private String image;

    @Builder.Default
    private BigDecimal money = new BigDecimal(120000);

    public void validatePassword(String rawPassword, PasswordEncoder encoder) {
        if (!encoder.matches(rawPassword, this.pwd)) {
            throw UserException.of(ErrorCode.PASSWORD_MISMATCH);
        }
    }

    private void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0 ) {
            throw UserException.of(ErrorCode.INVALID_DEPOSIT_AMOUNT);
        }
        this.money = this.money.add(amount);
    }

    private void withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw UserException.of(ErrorCode.INVALID_WITHDRAWAL_AMOUNT);
        }
        if (this.money.compareTo(amount) < 0) {
            throw UserException.of(ErrorCode.INSUFFICIENT_BALANCE);
        }
        this.money = this.money.subtract(amount);
    }

    public void processOrderAmount(OrderType orderType, BigDecimal amount) {
        if (orderType == OrderType.SELL) {
            deposit(amount);
        } else if (orderType == OrderType.BUY) {
            withdraw(amount);
        } else {
            throw UserException.of(ErrorCode.INVALID_ORDER_TYPE);
        }
    }

    public void updateIfChanged(String name, String email, String username, String rawPassword, String image, PasswordEncoder encoder){
        if (!Objects.equals(this.name, name)) {
            this.name = name;
        }
        if (!Objects.equals(this.email, email)) {
            this.email = email;
        }
        if (!Objects.equals(this.username, username)) {
            this.username = username;
        }
        if (rawPassword != null && !rawPassword.isBlank() && !rawPassword.equals("undefined")) {
            if (this.pwd == null || !encoder.matches(rawPassword, this.pwd)) {
                this.pwd = encoder.encode(rawPassword);
            }
        }
        if (!Objects.equals(this.image, image)) {
            this.image = image;
        }
    }
}
