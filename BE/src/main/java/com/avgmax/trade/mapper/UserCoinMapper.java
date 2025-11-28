package com.avgmax.trade.mapper;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;

import com.avgmax.trade.domain.UserCoin;
import com.avgmax.trade.dto.query.UserCoinWithCoinWithCreatorQuery;

public interface UserCoinMapper {
    public int insert(UserCoin userCoin);
    public int update(UserCoin userCoin);
    public Optional<UserCoin> selectByHolderIdAndCoinId(@Param("holderId") String holderId, @Param("coinId") String coinId);
    public List<UserCoinWithCoinWithCreatorQuery> selectAllByHolderId(String holderId);
}
