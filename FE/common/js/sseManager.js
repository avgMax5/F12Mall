import { getCoinRealtime } from '/hook/trade/getCoinRealtime.js';

class SSEManager {
    constructor() {
        this.evtSource = null;
        this.subscribers = {
            coininfo: new Set(),  // 'coinInfo' -> 'coininfo'로 변경
            orderbook: new Set(), // 'orderBook' -> 'orderbook'으로 변경
            allcoin: new Set()    // 'allCoin' -> 'allcoin'으로 변경
        };
    }

    connect(coinId) {
        if (this.evtSource) {
            return;
        }

        this.evtSource = getCoinRealtime(coinId, {
            onCoinInfo: (data) => this.notifySubscribers('coininfo', data),
            onOrderBook: (data) => this.notifySubscribers('orderbook', data),
            onAllCoin: (data) => this.notifySubscribers('allcoin', data)
        });
    }

    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            throw new Error(`지원하지 않는 이벤트 타입입니다: ${eventType}`);
        }

        this.subscribers[eventType].add(callback);
    }

    notifySubscribers(eventType, data) {
        this.subscribers[eventType].forEach(callback => callback(data));
    }

    closeStream() {
        if (this.evtSource) {
            this.evtSource.close();
            this.evtSource = null;
        }

        // 모든 구독자 제거
        Object.values(this.subscribers).forEach(set => set.clear());
    }
}

// 싱글톤 인스턴스 생성
export const sseManager = new SSEManager();