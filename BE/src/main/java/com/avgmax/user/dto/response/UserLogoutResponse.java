package com.avgmax.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserLogoutResponse {
    private boolean success;

    public static UserLogoutResponse of(Boolean success){
        return UserLogoutResponse.builder()
            .success(success)
            .build();
    }
}
