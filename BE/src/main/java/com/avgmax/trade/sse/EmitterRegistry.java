package com.avgmax.trade.sse;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class EmitterRegistry {
    // coinId -> (sessionId -> (streamType -> emitter))
    private final Map<String, Map<String, Map<String, SseEmitter>>> emittersByCoin = new ConcurrentHashMap<>();

    public void add(String sessionId, String coinId, String streamType, SseEmitter emitter) {
        emittersByCoin
            .computeIfAbsent(coinId, k -> new ConcurrentHashMap<>())
            .computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>())
            .put(streamType, emitter);
        
        log.debug("스트림 등록: coinId={}, sessionId={}, streamType={}", coinId, sessionId, streamType);
    }

    public void remove(String sessionId, String coinId, String streamType) {
        Map<String, Map<String, SseEmitter>> sessionMap = emittersByCoin.get(coinId);
        if (sessionMap != null) {
            Map<String, SseEmitter> streamMap = sessionMap.get(sessionId);
            if (streamMap != null) {
                streamMap.remove(streamType);
                if (streamMap.isEmpty()) {
                    sessionMap.remove(sessionId);
                    if (sessionMap.isEmpty()) {
                        emittersByCoin.remove(coinId);
                    }
                }
                log.debug("스트림 제거: coinId={}, sessionId={}, streamType={}", coinId, sessionId, streamType);
            }
        }
    }

    public Set<String> getAllCoinIds() {
        return emittersByCoin.keySet();
    }

    public Map<String, SseEmitter> getEmittersByCoinAndType(String coinId, String streamType) {
        Map<String, Map<String, SseEmitter>> sessionMap = emittersByCoin.getOrDefault(coinId, Collections.emptyMap());
        Map<String, SseEmitter> result = new ConcurrentHashMap<>();
        
        sessionMap.forEach((sessionId, streamMap) -> {
            SseEmitter emitter = streamMap.get(streamType);
            if (emitter != null) {
                result.put(sessionId, emitter);
            }
        });
        
        return result;
    }
}
