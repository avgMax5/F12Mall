package com.avgmax.trade.sse;


import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class EmitterRegistry {

    private final Map<String, Map<String, SseEmitter>> emittersByCoin = new ConcurrentHashMap<>();

    public void add(String sessionId, String coinId, SseEmitter emitter) {
        emittersByCoin
                .computeIfAbsent(coinId, k -> new ConcurrentHashMap<>())
                .put(sessionId, emitter);
    }

    public void remove(String sessionId, String coinId) {
        Map<String, SseEmitter> coinMap = emittersByCoin.get(coinId);
        if (coinMap != null) {
            coinMap.remove(sessionId);
        }
    }

    public Set<String> getAllCoinIds() {
        return emittersByCoin.keySet();
    }

    public Map<String, SseEmitter> getEmittersByCoin(String coinId) {
        return emittersByCoin.getOrDefault(coinId, Collections.emptyMap());
    }
}
