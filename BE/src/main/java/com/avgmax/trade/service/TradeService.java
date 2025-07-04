package com.avgmax.trade.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.avgmax.trade.dto.query.CoinWithCreatorWithProfileQuery;
import com.avgmax.trade.dto.query.TradeGroupByCoinQuery;
import com.avgmax.trade.dto.response.TradeFetchResponse;
import com.avgmax.trade.dto.response.TradeSurgingResponse;
import com.avgmax.trade.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.avgmax.global.dto.SuccessResponse;
import com.avgmax.global.exception.ErrorCode;
import com.avgmax.trade.domain.Order;
import com.avgmax.trade.domain.Trade;
import com.avgmax.trade.domain.UserCoin;
import com.avgmax.trade.domain.enums.OrderType;
import com.avgmax.trade.dto.request.OrderRequest;
import com.avgmax.trade.dto.response.OrderResponse;
import com.avgmax.trade.exception.TradeException;
import com.avgmax.trade.mapper.CoinMapper;
import com.avgmax.trade.mapper.OrderMapper;
import com.avgmax.trade.mapper.TradeMapper;
import com.avgmax.trade.mapper.UserCoinMapper;
import com.avgmax.user.domain.User;
import com.avgmax.user.exception.UserException;
import com.avgmax.user.mapper.UserMapper;
import com.avgmax.trade.dto.response.ChartResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradeService {
    private final OrderMapper orderMapper;
    private final UserMapper userMapper;
    private final CoinMapper coinMapper;
    private final ClosingPriceMapper closingPriceMapper;
    private final UserCoinMapper userCoinMapper;
    private final TradeMapper tradeMapper;

    @Transactional
    public OrderResponse createOrder(String userId, String coinId, OrderRequest request) {
        Order newOrder = request.toEntity(userId, coinId);
        orderMapper.insert(newOrder);
        switch (newOrder.getOrderType()) {
            case BUY: processBuyOrder(newOrder); break;
            case SELL: processSellOrder(newOrder); break;
            default: throw new TradeException(ErrorCode.INVALID_ORDER_TYPE);
        }
        return OrderResponse.from(newOrder);
    }

    @Transactional
    public SuccessResponse cancelOrder(String userId, String coinId, String orderId) {
        Order order = orderMapper.selectByOrderId(orderId)
            .orElseThrow(() -> TradeException.of(ErrorCode.ORDER_NOT_FOUND));
        order.validateOwnership(userId, coinId);
        orderMapper.delete(orderId);
        return SuccessResponse.of(true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyList(String userId, String coinId) {
        List<Order> orders = orderMapper.selectAllByUserId(userId);
        return orders.stream()
            .map(OrderResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TradeSurgingResponse> getSurgingCoins() {
        return coinMapper.selectAllWithCreator().stream()
                .map(TradeSurgingResponse::from)
                .sorted(Comparator.comparing(TradeSurgingResponse::getFluctuationRate).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChartResponse> getChartData(String coinId) {
        return ChartResponse.from(closingPriceMapper.selectBycoinIdDuring180(coinId));
    }

    @Transactional(readOnly = true)
    public TradeFetchResponse getTradeFetch(String coinId) {
        CoinWithCreatorWithProfileQuery coin = coinMapper.selectWithCreatorWithProfileById(coinId)
                .orElseThrow(() -> UserException.of(ErrorCode.COIN_INFO_NOT_FOUND));

        TradeGroupByCoinQuery tradeByCoin = tradeMapper.selectTradeGroupById(coinId)
                .orElse(TradeGroupByCoinQuery.init(coinId));

        return TradeFetchResponse.from(coin, tradeByCoin);
    }

    private User updateUserMoney(String userId, OrderType orderType, BigDecimal amount) {
        User user = userMapper.selectByUserId(userId)
            .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        user.processOrderAmount(orderType, amount);
        userMapper.updateMoney(user);
        return user;
    }

    private void validateUserCoinQuantity(String userId, String coinId, BigDecimal requestQuantity) {
        Optional<UserCoin> userCoin = userCoinMapper.selectByHolderIdAndCoinId(userId, coinId);
        if (!userCoin.isPresent() || userCoin.get().getHoldQuantity().compareTo(requestQuantity) < 0) {
            throw TradeException.of(ErrorCode.INSUFFICIENT_COIN_QUANTITY);
        }
    }

    private void processBuyOrder(Order buyOrder) {
        updateUserMoney(buyOrder.getUserId(), OrderType.BUY, OrderType.BUY.calculateExecuteAmount(buyOrder.getQuantity(), buyOrder.getUnitPrice()));
        
        BigDecimal remainingQuantity = buyOrder.getQuantity();
        List<Order> sellOrders = orderMapper.selectSellOrdersByCoinId(buyOrder.getCoinId(), buyOrder.getUnitPrice());

        for (Order sellOrder : sellOrders) {
            remainingQuantity = executeMatch(OrderType.BUY, buyOrder, sellOrder, remainingQuantity);
            if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) break;
        }

        updateOrderQuentity(buyOrder, remainingQuantity);
    }

    private void processSellOrder(Order sellOrder) {
        validateUserCoinQuantity(sellOrder.getUserId(), sellOrder.getCoinId(), sellOrder.getQuantity());
        
        BigDecimal remainingQuantity = sellOrder.getQuantity();
        List<Order> matchingBuyOrders = orderMapper.selectBuyOrdersByCoinId(sellOrder.getCoinId(), sellOrder.getUnitPrice());

        for (Order buyOrder : matchingBuyOrders) {
            remainingQuantity = executeMatch(OrderType.SELL, buyOrder, sellOrder, remainingQuantity);
            if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) break;
        }

        updateOrderQuentity(sellOrder, remainingQuantity);
    }

    private BigDecimal executeMatch(OrderType requestType, Order buyOrder, Order sellOrder, BigDecimal remainingQuantity) {
        Order matchedOrder = (requestType == OrderType.BUY) ? sellOrder : buyOrder;
        if (buyOrder.getUserId().equals(sellOrder.getUserId())) {
            log.info("같은 유저 주문은 매칭 불가: userId={}", buyOrder.getUserId());
            return remainingQuantity;
        }
        
        BigDecimal tradableQuantity = remainingQuantity.min(matchedOrder.getQuantity());
        
        // 체결 기록 생성
        Trade trade = Trade.of(requestType, buyOrder, sellOrder, tradableQuantity);
        tradeMapper.insert(trade);

        // 현재가 갱신
        updateCurrentPrice(matchedOrder.getCoinId(), matchedOrder.getUnitPrice());
        
        // 비교 주문 수량 갱신
        updateOrderQuentity(matchedOrder, matchedOrder.getQuantity().subtract(tradableQuantity));

        // 코인 수량 업데이트
        updateUserCoinQuantity(trade);

        // 매도 사용자 money 갱신
        updateUserMoney(sellOrder.getUserId(), OrderType.SELL, OrderType.SELL.calculateExecuteAmount(tradableQuantity, matchedOrder.getUnitPrice()));

        log.info("주문 체결 완료: trade={}, quantity={}, unitPrice={}", trade.getTradeId(), trade.getQuantity(), trade.getUnitPrice());

        return remainingQuantity.subtract(tradableQuantity);
    }

    private void updateOrderQuentity(Order order, BigDecimal remainingQuantity) {
        if (remainingQuantity.compareTo(BigDecimal.ZERO) > 0) {
            order.setQuantity(remainingQuantity);
            orderMapper.updateQuantity(order);
        } else {
            orderMapper.delete(order.getOrderId());
        }
    }

    private void updateCurrentPrice(String coinId, BigDecimal price) {
        coinMapper.updateCurrentPrice(coinId, price);
    }

    private void updateUserCoinQuantity(Trade trade) {
        processUserCoin(OrderType.BUY, trade);
        processUserCoin(OrderType.SELL, trade);
    }

    private void processUserCoin(OrderType orderType, Trade trade) {
        String userId = orderType == OrderType.BUY ? trade.getBuyUserId() : trade.getSellUserId();
        Optional<UserCoin> userCoin = userCoinMapper.selectByHolderIdAndCoinId(userId, trade.getCoinId());
        if (userCoin.isPresent()) {
            userCoin.get().processCoin(orderType, trade.getQuantity(), trade.getUnitPrice());
            userCoinMapper.update(userCoin.get());
        } else if (orderType == OrderType.BUY) {
            userCoinMapper.insert(UserCoin.of(userId, trade.getCoinId(), trade.getQuantity(), trade.getUnitPrice()));
        } else {
            throw TradeException.of(ErrorCode.USER_COIN_NOT_FOUND);
        }
    }
}
