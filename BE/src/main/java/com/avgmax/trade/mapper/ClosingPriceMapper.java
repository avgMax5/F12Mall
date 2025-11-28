package com.avgmax.trade.mapper;

import java.util.List;
import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Param;
import com.avgmax.trade.domain.ClosingPrice;
import com.avgmax.trade.dto.query.TradeWithCoinQuery;

public interface ClosingPriceMapper {
    public int insert(ClosingPrice closingPrice);
    public List<ClosingPrice> selectBycoinId(String coinId);
    public List<ClosingPrice> selectBycoinIdDuring180(String coinId);
    public int bulkInsert(@Param("list") List<ClosingPrice> closingPrices);
    List<TradeWithCoinQuery> selectSummaryByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
