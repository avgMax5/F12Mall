package com.avgmax.user.mapper;

import com.avgmax.user.domain.Profile;

public interface ProfileMapper {
    public int insert(Profile user);
    public Profile selectByUserId(String userId);
    public void update(Profile user);
}
