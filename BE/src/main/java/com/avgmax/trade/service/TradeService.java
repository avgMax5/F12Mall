package com.avgmax.trade.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.avgmax.trade.domain.ClosingPrice;
import com.avgmax.trade.domain.enums.CoinFilter;
import com.avgmax.trade.dto.query.CoinWithCreatorWithProfileQuery;
import com.avgmax.trade.dto.query.TradeGroupByCoinQuery;
import com.avgmax.trade.dto.query.TradeWithCoinQuery;
import com.avgmax.trade.dto.response.CoinFetchResponse;
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
        }
        return OrderResponse.from(newOrder);
    }

    @Transactional
    public SuccessResponse cancelOrder(String userId, String coinId, String orderId) {
        Order order = orderMapper.selectByOrderId(orderId)
                .orElseThrow(() -> TradeException.of(ErrorCode.ORDER_NOT_FOUND));
        order.validateOwnership(userId, coinId);

        switch (order.getOrderType()) {
            // 매수 주문 취소: 주문 금액 환불
            case BUY:
                BigDecimal refundAmount = OrderType.BUY.calculateExecuteAmount(order.getQuantity(), order.getUnitPrice());
                updateUserMoney(userId, OrderType.SELL, refundAmount);
                break;
            // 매도 주문 취소: 코인 수량 환불
            case SELL:
                UserCoin userCoin = findOrCreateUserCoin(userId, coinId);
                userCoin.plusUserCoin(order.getQuantity(), order.getUnitPrice());
                userCoinMapper.update(userCoin);
                break;
            default:
                throw TradeException.of(ErrorCode.INVALID_ORDER_TYPE);
        }

        orderMapper.delete(orderId);
        return SuccessResponse.of(true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyList(String userId, String coinId) {
        return orderMapper.selectAllByUserIdAndCoinId(userId, coinId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChartResponse> getChartData(String coinId) {
        return ChartResponse.from(closingPriceMapper.selectBycoinIdDuring180(coinId));
    }

    @Transactional
    public int updateClosingPriceAtMidnight() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(1).toLocalDate().atStartOfDay();
        LocalDateTime endDate = LocalDateTime.now().toLocalDate().atStartOfDay();

        List<TradeWithCoinQuery> tradeWithCoinQuery = closingPriceMapper.selectSummaryByDateRange(startDate, endDate);
        if (tradeWithCoinQuery.isEmpty()) {
            log.warn("거래 데이터가 없습니다.");
            return 0;
        }

        return closingPriceMapper.bulkInsert(tradeWithCoinQuery.stream()
                .map(ClosingPrice::toEntity)
                .collect(Collectors.toList()));
    }

    private User updateUserMoney(String userId, OrderType orderType, BigDecimal amount) {
        User user = userMapper.selectByUserId(userId)
                .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        user.processOrderAmount(orderType, amount);
        userMapper.updateMoney(user);
        log.info("사용자 자산 업데이트: {} 주문 타입: {} 금액: {}", userId, orderType, amount);
        return user;
    }

    private UserCoin findOrCreateUserCoin(String userId, String coinId) {
        return userCoinMapper.selectByHolderIdAndCoinId(userId, coinId)
                .orElseGet(() -> {
                    UserCoin newUserCoin = UserCoin.init(userId, coinId);
                    userCoinMapper.insert(newUserCoin);
                    return newUserCoin;
                });
    }

    private void processBuyOrder(Order buyOrder) {
        // 전처리: 최대 필요 금액 차감
        BigDecimal maxAmount = OrderType.BUY.calculateExecuteAmount(buyOrder.getQuantity(), buyOrder.getUnitPrice());
        updateUserMoney(buyOrder.getUserId(), OrderType.BUY, maxAmount);
        
        // 매수 주문 처리
        List<Order> matchingOrders = orderMapper.selectSellOrdersByCoinId(buyOrder.getCoinId(), buyOrder.getUnitPrice());
        processMatchingOrders(buyOrder, matchingOrders);
    }

    private void processSellOrder(Order sellOrder) {
        // 전처리: 코인 수량 차감
        UserCoin userCoin = userCoinMapper.selectByHolderIdAndCoinId(sellOrder.getUserId(), sellOrder.getCoinId())
                .orElseThrow(() -> TradeException.of(ErrorCode.USER_COIN_NOT_FOUND));
        userCoin.minusUserCoin(sellOrder.getQuantity(), sellOrder.getUnitPrice());
        userCoinMapper.update(userCoin);

        // 매도 주문 처리
        List<Order> matchingOrders = orderMapper.selectBuyOrdersByCoinId(sellOrder.getCoinId(), sellOrder.getUnitPrice());
        processMatchingOrders(sellOrder, matchingOrders);
    }

    private void processMatchingOrders(Order order, List<Order> matchingOrders) {
        for (Order matchingOrder : matchingOrders) {
            executeMatch(
                order.getOrderType() == OrderType.BUY ? order : matchingOrder,
                order.getOrderType() == OrderType.SELL ? order : matchingOrder
            );
            
            if (matchingOrder.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                orderMapper.delete(matchingOrder.getOrderId());
            }
            if (order.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                orderMapper.delete(order.getOrderId());
                break;
            }
        }
    }

    private void executeMatch(Order buyOrder, Order sellOrder) {
        BigDecimal tradableQuantity = buyOrder.getQuantity().min(sellOrder.getQuantity());
        // 체결 기록 생성
        Trade trade = Trade.of(buyOrder, sellOrder, tradableQuantity);
        tradeMapper.insert(trade);

        // 현재가 갱신
        updateCurrentPrice(trade.getCoinId(), trade.getUnitPrice());

        // 매수 Order quantity 갱신
        updateOrderQuentity(buyOrder, buyOrder.getQuantity().subtract(tradableQuantity));

        // 매도 Order quantity 갱신
        updateOrderQuentity(sellOrder, sellOrder.getQuantity().subtract(tradableQuantity));

        // 매수자 코인 지급
        processBuyCoin(trade);

        // 매도자 금액 지급
        updateUserMoney(sellOrder.getUserId(), OrderType.SELL, OrderType.SELL.calculateExecuteAmount(tradableQuantity, trade.getUnitPrice()));

        // 매수자 차액 환불
        BigDecimal refundAmount = OrderType.BUY.calculateExecuteAmount(tradableQuantity, buyOrder.getUnitPrice()).subtract(OrderType.BUY.calculateExecuteAmount(tradableQuantity, trade.getUnitPrice()));
        if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            updateUserMoney(buyOrder.getUserId(), OrderType.SELL, refundAmount);
        }
    }

    private void updateCurrentPrice(String coinId, BigDecimal price) {
        coinMapper.updateCurrentPrice(coinId, price);
    }

    private void updateOrderQuentity(Order order, BigDecimal remainingQuantity) {
        if (remainingQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw TradeException.of(ErrorCode.INVALID_ORDER_QUANTITY);
        }
        log.info("주문의 코인 수량 갱신: {} {}원 {} -> {}", order.getOrderType(), order.getUnitPrice(), order.getQuantity(), remainingQuantity);
        order.setQuantity(remainingQuantity);
        orderMapper.updateQuantity(order);
    }

    private void processBuyCoin(Trade trade) {
        UserCoin userCoin = findOrCreateUserCoin(trade.getBuyUserId(), trade.getCoinId());
        userCoin.plusUserCoin(trade.getQuantity(), trade.getUnitPrice());
        userCoinMapper.update(userCoin);
    }

    @Transactional(readOnly = true)
    public CoinFetchResponse getCoinFetch(String coinId) {
        CoinWithCreatorWithProfileQuery coin = coinMapper.selectWithCreatorWithProfileById(coinId)
                .orElseThrow(() -> UserException.of(ErrorCode.COIN_INFO_NOT_FOUND));

        TradeGroupByCoinQuery trade = tradeMapper.selectTradeGroupById(coinId)
                .orElse(TradeGroupByCoinQuery.init(coinId));

        return CoinFetchResponse.from(coin, trade);
    }

    @Transactional(readOnly = true)
    public List<CoinFetchResponse> getCoinFetchList(CoinFilter filter) {
        List<CoinWithCreatorWithProfileQuery> coins = coinMapper.selectAllWithCreatorWithProfile();
        Map<String, TradeGroupByCoinQuery> tradeMap = tradeMapper.selectAllTradeGroupByCoin().stream()
                .collect(Collectors.toMap(TradeGroupByCoinQuery::getCoinId,t -> t));

        List<CoinFetchResponse> responseList = coins.stream()
                .map(coin -> {
                    TradeGroupByCoinQuery trade = tradeMap.getOrDefault(
                            coin.getCoinId(),
                            TradeGroupByCoinQuery.init(coin.getCoinId())
                    );
                    return CoinFetchResponse.from(coin, trade);
                })
                .collect(Collectors.toList());

        switch (filter) {
            case SURGING:
                return responseList.stream()
                        .sorted(Comparator.comparing(CoinFetchResponse::getFluctuationRate).reversed())
                        .limit(5)
                        .collect(Collectors.toList());
            case PRICE:
                return responseList.stream()
                        .sorted(Comparator.comparing(CoinFetchResponse::getCurrentPrice).reversed())
                        .limit(5)
                        .collect(Collectors.toList());
            case ALL:
            default:
                return responseList;
        }
    }
}