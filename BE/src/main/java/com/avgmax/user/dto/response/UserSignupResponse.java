package com.avgmax.user.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserSignupResponse {
    private boolean success;
    private String message;
    private String userId;

    public static UserSignupResponse of(Boolean success, String message, String userId){
        return UserSignupResponse.builder()
            .success(success)
            .userId(userId)
            .build();
    }
}

