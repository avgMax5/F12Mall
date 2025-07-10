package com.avgmax.trade.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import com.avgmax.trade.domain.enums.CoinFilter;
import com.avgmax.trade.dto.response.CoinFetchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.avgmax.trade.dto.request.OrderRequest;
import com.avgmax.trade.dto.response.ChartResponse;
import com.avgmax.trade.dto.response.OrderResponse;

import com.avgmax.trade.service.RealtimeStreamService;
import com.avgmax.trade.service.TradeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/coins")
@RequiredArgsConstructor
public class TradeController {
    private final TradeService tradeService;
    private final RealtimeStreamService realtimeStreamService;

    // 주문 요청
    @PostMapping("/{coinId}/orders")
    public ResponseEntity<OrderResponse> createOrder(HttpSession session, @PathVariable String coinId,
            @RequestBody OrderRequest request) {
        String userId = (String) session.getAttribute("user");
        log.info("POST 주문 요청: {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeService.createOrder(userId, coinId, request));
    }

    // 주문 취소
    @DeleteMapping("/{coinId}/orders/{orderId}")
    public ResponseEntity<Void> cancelOrder(HttpSession session, @PathVariable String coinId,
            @PathVariable String orderId) {
        String userId = (String) session.getAttribute("user");
        log.info("DELETE 주문 취소: {}", userId);
        tradeService.cancelOrder(userId, coinId, orderId);
        return ResponseEntity.noContent().build();
    }

    // 내 주문 목록 조회
    @GetMapping("/{coinId}/orders/mylist")
    public ResponseEntity<List<OrderResponse>> getMyList(HttpSession session, @PathVariable String coinId) {
        String userId = (String) session.getAttribute("user");
        log.info("GET 내 주문 목록: {}", userId);
        return ResponseEntity.ok(tradeService.getMyList(userId, coinId));
    }

    // 차트 조회
    @GetMapping("/{coinId}/chart")
    public ResponseEntity<List<ChartResponse>> getChartData(@PathVariable String coinId) {
        log.info("GET 차트 조회: {}", coinId);
        return ResponseEntity.ok(tradeService.getChartData(coinId));
    }

    // 메인 페이지 특정 코인 DB 조회
    @GetMapping("/{coinId}")
    public ResponseEntity<CoinFetchResponse> getCoinFetch(@PathVariable String coinId) {
        log.info("GET 특정 코인 DB 조회: {}", coinId);
        return ResponseEntity.ok(tradeService.getCoinFetch(coinId));
    }

    // 메인 페이지 코인 DB 조회
    @GetMapping
    public ResponseEntity<List<CoinFetchResponse>> getCoinFetchList(
            @RequestParam(required = false, defaultValue = "all") String filter) {
        log.info("GET 코인 DB 조회");
        CoinFilter coinFilter = CoinFilter.from(filter);
        return ResponseEntity.ok(tradeService.getCoinFetchList(coinFilter));
    }

    // 실시간 코인 정보 조회
    @GetMapping(value = "/{coinId}/realtime", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getRealtimeCoinInfo(HttpSession session, @PathVariable String coinId) {
        String sessionId = session.getId();
        log.debug("SSE 연결 요청: session={}, coin={}", sessionId, coinId);
        return realtimeStreamService.connectStream(sessionId, coinId);
    }
}