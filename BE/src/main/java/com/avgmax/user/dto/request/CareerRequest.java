package com.avgmax.user.dto.request;

import com.avgmax.user.domain.Career;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerRequest {
    private String companyName;
    private String status;
    private String position;
    private String certificateUrl;
    private String startDate; 
    private String endDate;

    public Career toEntity(String userId) {
        return Career.builder()
            .userId(userId)
            .companyName(companyName)
            .status(status)
            .position(position)
            .startDate(startDate)
            .endDate(endDate)
            .certificateUrl(certificateUrl)
            .build();
    }
}
