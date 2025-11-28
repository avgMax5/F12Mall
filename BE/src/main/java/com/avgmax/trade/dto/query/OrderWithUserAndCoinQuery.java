package com.avgmax.trade.dto.query;

import com.avgmax.trade.domain.enums.OrderType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class OrderWithUserAndCoinQuery {
    // Order 정보
    private String orderId;
    private OrderType orderType;
    private Integer quantity;
    private Double unitPrice;
    private Double orderTotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User 정보
    private String userId;
    private String userName;
    private String userEmail;
    private String userUsername;
    private String userPwd;
    private String userImage;
    private Double userMoney;

    // Coin 정보
    private String coinId;
    private String coinCreatorId;
}
