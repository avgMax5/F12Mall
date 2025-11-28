package com.avgmax.user.dto.query;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSkillWithSkillQuery {
    private String userId;
    private String skillId;
    private String stack;
}
