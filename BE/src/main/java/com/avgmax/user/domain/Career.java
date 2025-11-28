package com.avgmax.user.domain;

import java.util.UUID;

import com.avgmax.global.base.BaseTimeEntity;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Career extends BaseTimeEntity {

    @Builder.Default
    private String careerId = UUID.randomUUID().toString();

    private String userId;

    private String companyName;

    private String status;

    private String position;

    private String startDate;

    private String endDate;
    
    private String certificateUrl;
}
