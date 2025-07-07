package com.avgmax.user.dto.request;

import com.avgmax.user.domain.Education;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EducationRequest {
    private String schoolName;
    private String status;
    private String major;
    private String certificateUrl;
    private String startDate;
    private String endDate;

    public Education toEntity(String userId) {
        return Education.builder()
            .userId(userId)
            .schoolName(schoolName)
            .status(status)
            .major(major)
            .startDate(startDate)
            .endDate(endDate)
            .certificateUrl(certificateUrl)
            .build();
    }
}
