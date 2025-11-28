package com.avgmax.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileUpdateResponse {
    private boolean success;

    public static UserProfileUpdateResponse of(boolean success){
        return UserProfileUpdateResponse.builder()
            .success(success)
            .build();
    }
}
