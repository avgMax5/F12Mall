package com.avgmax.user.dto.request;

import com.avgmax.user.domain.Education;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
