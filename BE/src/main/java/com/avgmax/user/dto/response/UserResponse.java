package com.avgmax.user.dto.response;

import java.math.BigDecimal;

import com.avgmax.user.domain.User;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserResponse {
    private String userId;
    private String name;
    private String email;
    private String image;
    private BigDecimal money;

    public static UserResponse from(User user) {
        return UserResponse.builder()
            .userId(user.getUserId())
            .name(user.getName())
            .email(user.getEmail())
            .image(user.getImage())
            .money(user.getMoney())
            .build();
    }
}
