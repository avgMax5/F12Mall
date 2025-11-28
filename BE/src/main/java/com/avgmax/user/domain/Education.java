package com.avgmax.user.domain;

import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Education extends BaseTimeEntity {

    @Builder.Default
    private String educationId = UUID.randomUUID().toString();

    private String userId; 

    private String schoolName;

    private String status;

    private String major;

    private String startDate;

    private String endDate;
    
    private String certificateUrl;
}
