package com.avgmax.trade.service;

import com.avgmax.trade.sse.EmitterRegistry;
import com.avgmax.trade.dto.query.OrderWithCoinQuery;
import com.avgmax.trade.dto.response.OrderBookResponse;
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
public class OrderBookService {
    private final OrderMapper orderMapper;
    private final EmitterRegistry emitterRegistry;

    public SseEmitter connectOrderBookSse(String sessionId, String coinId) {
        log.debug("sessionId = {} SSE 연결 시도 -> coinId = {}", sessionId, coinId); 
        SseEmitter emitter = new SseEmitter(0L);

        emitter.onTimeout(() -> {
            emitter.complete();
            emitterRegistry.remove(sessionId, coinId);
        });

        emitter.onCompletion(() -> {
            emitterRegistry.remove(sessionId, coinId);
        });

        emitterRegistry.add(sessionId, coinId, emitter);
        log.debug("sessionId = {}, coinId = {} : 등록 완료", sessionId, coinId); 

        try {
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data("connected"));
            log.debug("초기 연결 메시지 전송 완료");
        } catch (IOException e) {
            log.warn("초기 연결 메시지 전송 실패: {}", e.getMessage());
        }

        return emitter;
    }

    @PostConstruct
    public void startBroadcasting() {
        Executors.newSingleThreadScheduledExecutor()
                .scheduleAtFixedRate(this::broadcastAll, 0, 1, TimeUnit.SECONDS);
    }

    private void broadcastAll() {
        emitterRegistry.getAllCoinIds().forEach(coinId -> {
            List<OrderWithCoinQuery> orders = orderMapper.selectOrderBookByCoinId(coinId);
            log.debug("조회된 주문 수: {}, coinId={}", orders.size(), coinId);

            if (orders == null || orders.isEmpty()) {
                log.warn("조회 결과 없음: coinId={}", coinId);
                return;
            }

            if (!orders.isEmpty()) {
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
            }
        });
    }
}
