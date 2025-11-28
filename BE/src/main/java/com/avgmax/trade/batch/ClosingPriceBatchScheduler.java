package com.avgmax.trade.batch;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.avgmax.trade.service.TradeService;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClosingPriceBatchScheduler {
    private final TradeService tradeService;

    @Scheduled(cron = "0 0 0 * * *")
    public void updateClosingPriceBatch() {
        log.info("종가 DB 갱신 스케줄 시작");
        int result = tradeService.updateClosingPriceAtMidnight();
        log.info("종가 DB 갱신 완료 : {}", result);
    }
}