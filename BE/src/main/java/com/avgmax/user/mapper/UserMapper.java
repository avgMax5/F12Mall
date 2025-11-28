package com.avgmax.user.mapper;

import com.avgmax.user.domain.User;
import java.util.Optional;

public interface UserMapper {
    public int insert(User user);
    public Optional<User> selectByUserId(String userId);
    public Optional<User> selectByUsername(String username);
    public int updateMoney(User user);
    public void update(User user);
}
