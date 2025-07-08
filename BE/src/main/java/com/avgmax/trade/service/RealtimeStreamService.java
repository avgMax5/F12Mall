package com.avgmax.trade.service;

import com.avgmax.trade.sse.EmitterRegistry;
import com.avgmax.trade.dto.query.OrderWithCoinQuery;
import com.avgmax.trade.dto.response.OrderBookResponse;
import com.avgmax.trade.dto.response.CoinFetchResponse;
import com.avgmax.trade.mapper.*;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RealtimeStreamService {
    private final OrderMapper orderMapper;
    private final EmitterRegistry emitterRegistry;
    private final TradeService tradeService;

    private static final String ORDERBOOK_EVENT = "orderbook";
    private static final String COININFO_EVENT = "coininfo";
    private static final int BROADCAST_INTERVAL = 1;

    public SseEmitter connectCoinInfoStream(String sessionId, String coinId) {
        return connectStream(sessionId, coinId, COININFO_EVENT);
    }

    public SseEmitter connectOrderBookStream(String sessionId, String coinId) {
        return connectStream(sessionId, coinId, ORDERBOOK_EVENT);
    }

    private SseEmitter connectStream(String sessionId, String coinId, String streamType) {
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
        } catch (IOException e) {
            log.error("스트림 초기화 실패: {}", e.getMessage());
            emitter.completeWithError(e);
        }

        return emitter;
    }

    @PostConstruct
    public void startBroadcasting() {
        var executor = Executors.newScheduledThreadPool(2);
        executor.scheduleAtFixedRate(this::broadcastOrderBook, 0, BROADCAST_INTERVAL, TimeUnit.SECONDS);
        executor.scheduleAtFixedRate(this::broadcastCoinInfo, 0, BROADCAST_INTERVAL, TimeUnit.SECONDS);
    }

    private void broadcastOrderBook() {
        emitterRegistry.getAllCoinIds().forEach(coinId -> {
            List<OrderWithCoinQuery> orders = orderMapper.selectOrderBookByCoinId(coinId);
            
            if (orders == null || orders.isEmpty()) {
                return;
            }

            List<OrderBookResponse> orderBook = orders.stream()
                .map(OrderBookResponse::from)
                .collect(Collectors.toList());

            broadcast(coinId, ORDERBOOK_EVENT, orderBook);
        });
    }

    private void broadcastCoinInfo() {
        emitterRegistry.getAllCoinIds().forEach(coinId -> {
            CoinFetchResponse coinInfo = tradeService.getCoinFetch(coinId);
            broadcast(coinId, COININFO_EVENT, coinInfo);
        });
    }

    private void broadcast(String coinId, String eventName, Object data) {
        emitterRegistry.getEmittersByCoin(coinId).forEach((sessionId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                log.error("데이터 전송 실패 - {}: {}", eventName, e.getMessage());
                emitter.completeWithError(e);
                emitterRegistry.remove(coinId, sessionId);
            }
        });
    }
}
