package com.avgmax.trade.service;

import com.avgmax.trade.dto.response.OrderBookResponse;
import com.avgmax.trade.mapper.OrderMapper;
import com.avgmax.trade.sse.EmitterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RealtimeStreamService {
    private final OrderMapper orderMapper;
    private final EmitterRegistry emitterRegistry;
    private final TradeService tradeService;

    private static final int BROADCAST_INTERVAL = 1;

    @PostConstruct
    public void startUnifiedBroadcasting() {
        Executors.newSingleThreadScheduledExecutor()
                .scheduleAtFixedRate(this::broadcastAll, 0, BROADCAST_INTERVAL, TimeUnit.SECONDS);
    }

    public SseEmitter connectStream(String sessionId, String coinId) {
        SseEmitter emitter = new SseEmitter(0L);

        emitter.onTimeout(() -> {
            emitter.complete();
            emitterRegistry.remove(sessionId, coinId);
        });

        emitter.onCompletion(() -> emitterRegistry.remove(sessionId, coinId));

        try {
            emitterRegistry.add(sessionId, coinId, emitter);
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data("connected"));
            log.debug("스트림 연결 성공: sessionId={}, coinId={}", sessionId, coinId);
        } catch (IOException e) {
            log.error("스트림 초기화 실패: {}", e.getMessage());
            emitter.completeWithError(e);
        }

        return emitter;
    }

    private void broadcastAll() {
        emitterRegistry.getAllCoinIds().forEach(coinId -> {
            try {
                var coinInfo = tradeService.getCoinFetch(coinId);
                var orders = orderMapper.selectOrderBookByCoinId(coinId);
                if (orders == null || orders.isEmpty()) return;

                var orderBook = orders.stream()
                        .map(OrderBookResponse::from)
                        .collect(Collectors.toList());

                emitterRegistry.getEmittersByCoin(coinId).forEach((sessionId, emitter) -> {
                    try {
                        emitter.send(SseEmitter.event().name("coininfo").data(coinInfo));
                        emitter.send(SseEmitter.event().name("orderbook").data(orderBook));
                    } catch (IOException e) {
                        log.error("데이터 전송 실패 - coinId={}, sessionId={}, error={}", coinId, sessionId, e.getMessage());
                        emitter.completeWithError(e);
                        emitterRegistry.remove(sessionId, coinId);
                    }
                });

            } catch (Exception e) {
                log.error("broadcast 실패 - coinId={}, error={}", coinId, e.getMessage());
            }
        });
    }

}
