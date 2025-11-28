package com.avgmax.user.dto.response;

import com.avgmax.user.domain.Education;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EducationResponse {
    private String schoolName;
    private String status;
    private String major;
    private String startDate;
    private String endDate;

    public static EducationResponse from(Education education) {
        return EducationResponse.builder()
            .schoolName(education.getSchoolName())
            .status(education.getStatus())
            .major(education.getMajor())
            .startDate(education.getStartDate())
            .endDate(education.getEndDate())
            .build();
    }
}
