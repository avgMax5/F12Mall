package com.avgmax.trade.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.avgmax.trade.domain.enums.CoinFilter;
import com.avgmax.trade.dto.query.CoinWithCreatorWithProfileQuery;
import com.avgmax.trade.dto.query.TradeGroupByCoinQuery;
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
import com.avgmax.trade.dto.data.OrderMatchResult;

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
        
        // 주문 전처리: 자산 확보
        preProcessOrder(newOrder);
        
        // 주문 실행
        processOrder(newOrder);
        
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

    private User updateUserMoney(String userId, OrderType orderType, BigDecimal amount) {
        User user = userMapper.selectByUserId(userId)
                .orElseThrow(() -> UserException.of(ErrorCode.USER_NOT_FOUND));
        user.processOrderAmount(orderType, amount);
        userMapper.updateMoney(user);
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

    private void preProcessOrder(Order order) {
        switch (order.getOrderType()) {
            case BUY:
                // 매수 주문: 최대 필요 금액 차감
                BigDecimal maxAmount = OrderType.BUY.calculateExecuteAmount(order.getQuantity(), order.getUnitPrice());
                updateUserMoney(order.getUserId(), OrderType.BUY, maxAmount);
                break;
            case SELL:
                // 매도 주문: 코인 수량 차감
                UserCoin userCoin = userCoinMapper.selectByHolderIdAndCoinId(order.getUserId(), order.getCoinId())
                        .orElseThrow(() -> TradeException.of(ErrorCode.USER_COIN_NOT_FOUND));
                userCoin.minusUserCoin(order.getQuantity(), order.getUnitPrice());
                userCoinMapper.update(userCoin);
                break;
            default:
                throw TradeException.of(ErrorCode.INVALID_ORDER_TYPE);
        }
    }

    private void processOrder(Order order) {
        BigDecimal remainingQuantity = order.getQuantity();
        BigDecimal totalExecutedAmount = BigDecimal.ZERO;
        
        // 매칭 가능한 주문 조회
        List<Order> matchingOrders = (order.getOrderType() == OrderType.BUY) 
            ? orderMapper.selectSellOrdersByCoinId(order.getCoinId(), order.getUnitPrice())
            : orderMapper.selectBuyOrdersByCoinId(order.getCoinId(), order.getUnitPrice());

        // 주문 매칭 및 체결
        for (Order matchingOrder : matchingOrders) {
            OrderMatchResult result = executeMatch(order, matchingOrder, remainingQuantity);
            remainingQuantity = result.getRemainingQuantity();
            totalExecutedAmount = totalExecutedAmount.add(result.getExecutedAmount());
            
            if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) break;
        }

        // 후처리: 잔액 정산
        postProcessOrder(order, totalExecutedAmount, remainingQuantity);
    }

    private OrderMatchResult executeMatch(Order order, Order matchingOrder, BigDecimal remainingQuantity) {
        BigDecimal executedPrice = matchingOrder.getUnitPrice();
        BigDecimal tradableQuantity = remainingQuantity.min(matchingOrder.getQuantity());
        
        if (tradableQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return new OrderMatchResult(remainingQuantity, BigDecimal.ZERO);
        }

        // 체결 기록 생성
        Trade trade = (order.getOrderType() == OrderType.BUY)
            ? Trade.of(order.getOrderType(), order, matchingOrder, tradableQuantity, executedPrice)
            : Trade.of(order.getOrderType(), matchingOrder, order, tradableQuantity, executedPrice);
        
        tradeMapper.insert(trade);

        // 현재가 갱신
        updateCurrentPrice(matchingOrder.getCoinId(), executedPrice);

        // 매칭된 주문 수량 갱신
        updateOrderQuentity(matchingOrder, matchingOrder.getQuantity().subtract(tradableQuantity));

        // 매수자에게 코인 지급
        if (order.getOrderType() == OrderType.BUY) {
            processBuyCoin(trade);
        }

        BigDecimal executedAmount = OrderType.BUY.calculateExecuteAmount(tradableQuantity, executedPrice);
        return new OrderMatchResult(
            remainingQuantity.subtract(tradableQuantity),
            executedAmount
        );
    }

    private void postProcessOrder(Order order, BigDecimal totalExecutedAmount, BigDecimal remainingQuantity) {
        switch (order.getOrderType()) {
            case BUY:
                // 매수 주문: 미체결 금액 환불
                BigDecimal maxAmount = OrderType.BUY.calculateExecuteAmount(order.getQuantity(), order.getUnitPrice());
                BigDecimal refundAmount = maxAmount.subtract(totalExecutedAmount);
                if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                    updateUserMoney(order.getUserId(), OrderType.SELL, refundAmount);
                } break;
            case SELL:
                // 매도 주문: 체결된 금액 지급
                if (totalExecutedAmount.compareTo(BigDecimal.ZERO) > 0) {
                    updateUserMoney(order.getUserId(), OrderType.SELL, totalExecutedAmount);
                } break;
            default:
                throw TradeException.of(ErrorCode.INVALID_ORDER_TYPE);
        }
        // 주문 수량 갱신
        updateOrderQuentity(order, remainingQuantity);
    }

    private void updateCurrentPrice(String coinId, BigDecimal price) {
        coinMapper.updateCurrentPrice(coinId, price);
    }

    private void updateOrderQuentity(Order order, BigDecimal remainingQuantity) {
        if (remainingQuantity.compareTo(BigDecimal.ZERO) > 0) {
            order.setQuantity(remainingQuantity);
            orderMapper.updateQuantity(order);
        } else {
            orderMapper.delete(order.getOrderId());
        }
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