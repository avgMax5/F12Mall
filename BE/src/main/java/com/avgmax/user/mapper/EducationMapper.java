package com.avgmax.user.mapper;

import com.avgmax.user.domain.Education;
import java.util.List;

public interface EducationMapper {
    public int insert(Education education);
    public List<Education> selectByUserId(String userId);
    public void deleteByUserId(String userId);
}
