package com.avgmax.trade.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.avgmax.trade.dto.request.OrderRequest;
import com.avgmax.trade.dto.response.ChartResponse;
import com.avgmax.trade.dto.response.OrderResponse;
import com.avgmax.trade.dto.response.TradeFetchResponse;
import com.avgmax.trade.dto.response.TradeSurgingResponse;

import com.avgmax.trade.service.OrderBookService;
import com.avgmax.trade.service.TradeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/coins")
@RequiredArgsConstructor
public class TradeController {
    private final TradeService tradeService;
    private final OrderBookService orderBookService;

    // 주문 요청
    @PostMapping("/{coinId}/orders")
    public ResponseEntity<OrderResponse> createOrder(HttpSession session, @PathVariable String coinId, @RequestBody OrderRequest request) {
        String userId = (String) session.getAttribute("user");
        log.info("POST 주문 요청: {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeService.createOrder(userId, coinId, request));
    }

    // 주문 취소
    @DeleteMapping("/{coinId}/orders/{orderId}")
    public ResponseEntity<Void> cancelOrder(HttpSession session, @PathVariable String coinId, @PathVariable String orderId) {
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

    // Top 5 Surging 조회
    @GetMapping("/surging")
    public ResponseEntity<List<TradeSurgingResponse>> getSurgingCoin() {
        return ResponseEntity.ok(tradeService.getSurgingCoins());
    }

    // 차트 조회
    @GetMapping("/{coinId}/chart")
    public ResponseEntity<List<ChartResponse>> getChartData(@PathVariable String coinId) {
        return ResponseEntity.ok(tradeService.getChartData(coinId));
    }

    // 실시간 코인 정보 조회
    @GetMapping("/{coinId}")
    public ResponseEntity<TradeFetchResponse> getTradeFetch(@PathVariable String coinId) {
        return ResponseEntity.ok(tradeService.getTradeFetch(coinId));
    }

    // 현재 거래상황 조회
    @GetMapping(value = "/{coinId}/orders/orderbook", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter  getOrderBook(HttpSession session, @PathVariable String coinId) {
        String sessionId = session.getId();
        log.debug("SSE 연결 요청: session={}, coin={}", sessionId, coinId);
        return orderBookService.connectOrderBookSse(sessionId, coinId);
    }
}
