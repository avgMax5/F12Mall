package com.avgmax.global.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SuccessResponse {
    private Boolean success;

    public static SuccessResponse of(Boolean success) {
        return SuccessResponse.builder()
            .success(success)
            .build();
    }
}
