package com.avgmax.user.dto.request;

import com.avgmax.user.domain.Certification;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CertificationRequest {
    private String certificateUrl;

    public Certification toEntity(String userId) {
        return Certification.builder()
            .userId(userId)
            .certificateUrl(certificateUrl)
            .build();
    }
}
