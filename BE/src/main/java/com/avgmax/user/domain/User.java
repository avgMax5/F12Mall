package com.avgmax.user.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class User extends BaseTimeEntity  {
    @Builder.Default
    private String userId = UUID.randomUUID().toString();

    private String name;
    private String email;
    private String username;
    private String password;
    private String imageUrl;

    @Builder.Default
    private BigDecimal money = new BigDecimal(0);

    public void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0 ) {
            throw new IllegalArgumentException("입금액은 0보다 커야 합니다.");
        }
        this.money = this.money.add(amount);
    }

    public void withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("출금액은 0보다 커야 합니다.");
        }
        if (this.money.compareTo(amount) < 0) {
            throw new IllegalStateException("잔액이 부족합니다.");
        }
        this.money = this.money.subtract(amount);
    }
}
