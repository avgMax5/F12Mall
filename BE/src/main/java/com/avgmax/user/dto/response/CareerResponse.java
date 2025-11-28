package com.avgmax.user.dto.response;

import com.avgmax.user.domain.Career;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CareerResponse {
    private String companyName;
    private String status;
    private String position;
    private String startDate; 
    private String endDate;

     public static CareerResponse from(Career career) {
        return CareerResponse.builder()
            .companyName(career.getCompanyName())
            .status(career.getStatus())
            .position(career.getPosition())
            .startDate(career.getStartDate())
            .endDate(career.getEndDate())
            .build();
    }
}
