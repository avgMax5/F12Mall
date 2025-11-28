package com.avgmax.user.mapper;

import com.avgmax.user.domain.UserSkill;
import com.avgmax.user.dto.query.UserSkillWithSkillQuery;

import java.util.List;

public interface UserSkillMapper {
    public int insert(UserSkill userSkill);
    public List<UserSkillWithSkillQuery> selectByUserId(String userId);
    public void deleteByUserId(String userId);
    public List<String> selectByStack(List<String> stacks);
}
