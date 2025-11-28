package com.avgmax.user.mapper;

import com.avgmax.user.domain.Career;
import java.util.List;

public interface CareerMapper {
    public int insert(Career career);
    public List<Career> selectByUserId(String userId);
    public void deleteByUserId(String userId);
}
