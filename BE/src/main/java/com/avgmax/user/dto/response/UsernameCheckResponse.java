package com.avgmax.user.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UsernameCheckResponse {
    private Boolean isDuplicate;
    private String message;

    public static UsernameCheckResponse of(Boolean isDuplicate) {
        String message = isDuplicate ? "중복된 사용자명입니다." : "사용 가능한 사용자명입니다.";
        return UsernameCheckResponse.builder()
            .isDuplicate(isDuplicate)
            .message(message)
            .build();
    }
} 