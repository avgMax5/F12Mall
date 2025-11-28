package com.avgmax.user.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserLoginResponse {
    private boolean success;
    private String userId;

    public static UserLoginResponse of(Boolean success, String userId){
        return UserLoginResponse.builder()
            .success(success)
            .userId(userId)
            .build();
    }
}
