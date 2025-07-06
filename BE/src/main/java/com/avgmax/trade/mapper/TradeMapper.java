package com.avgmax.trade.mapper;

import java.util.List;
import java.util.Optional;

import com.avgmax.trade.domain.Trade;
import com.avgmax.trade.dto.query.TradeGroupByCoinQuery;

public interface TradeMapper {
    void insert(Trade trade);
    List<Trade> selectAllByUserId(String userId);
    Optional<Trade> selectByTradeId(String tradeId);
    Optional<Trade> selectByTradeIdWithUserAndCoin(String tradeId);
    List<Trade> selectByUserId(String userId);
    void delete(String tradeId);
    Optional<TradeGroupByCoinQuery> selectTradeGroupById(String coinId);
    List<TradeGroupByCoinQuery> selectAllTradeGroupByCoin();
}
