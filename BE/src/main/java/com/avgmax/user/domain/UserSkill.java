package com.avgmax.user.domain;

import com.avgmax.global.base.BaseTimeEntity;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserSkill extends BaseTimeEntity {

    private String skillId;
    
    private String userId;

    public static UserSkill of(String userId, String skillId){
        return UserSkill.builder()
            .skillId(skillId)
            .userId(userId)
            .build();
    }
}
