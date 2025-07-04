package com.avgmax.trade.service;

import com.avgmax.trade.sse.EmitterRegistry;
import com.avgmax.trade.dto.query.OrderWithCoinQuery;
import com.avgmax.trade.dto.response.OrderBookResponse;
import com.avgmax.global.exception.ErrorCode;
import com.avgmax.trade.mapper.*;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.avgmax.trade.exception.TradeException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderBookService {
    private final OrderMapper orderMapper;
    private final TradeMapper tradeMapper;
    private final EmitterRegistry emitterRegistry;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public SseEmitter connectOrderBookSse(String sessionId, String coinId) {
        SseEmitter emitter = new SseEmitter(0L);

        emitter.onTimeout(() -> {
            emitter.complete();
            emitterRegistry.remove(sessionId, coinId);
        });

        emitter.onCompletion(() -> {
            emitterRegistry.remove(sessionId, coinId);
        });

        emitterRegistry.add(sessionId, coinId, emitter);

        return emitter;
    }

    @PostConstruct
    public void startBroadcasting() {
        Executors.newSingleThreadScheduledExecutor()
                .scheduleAtFixedRate(this::broadcastAll, 0, 1, TimeUnit.SECONDS);
    }

    private void broadcastAll() {
        emitterRegistry.getAllCoinIds().forEach(coinId -> {
            List<OrderWithCoinQuery> orders = orderMapper.selectOrderBookByCoinId(coinId)
                .orElseThrow(() -> TradeException.of(ErrorCode.ORDER_COIN_SSE_NOT_FOUND));

            List<OrderBookResponse> list = orders.stream()
                .map(OrderBookResponse::from)
                .collect(Collectors.toList());

            emitterRegistry.getEmittersByCoin(coinId).forEach((sessionId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name("orderbook")
                            .data(list));
                } catch (IOException e) {
                    emitter.completeWithError(e);
                    emitterRegistry.remove(coinId, sessionId);
                }
            });
        });
    }
}
