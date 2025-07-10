import { tradeCoinId } from '/trade/js/trade.js';
import { getCoinRealtime } from '/hook/trade/getCoinRealtime.js';

class LivePriceManager {
    constructor() {
        this.evtSource = null;
        this.elements = null;
        this.coinInfo = null;
        this.subscribers = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                this.initializeElements();
                this.connectStream();
            } catch (error) {
                console.error('초기화 중 오류:', error);
            }
        });

        window.addEventListener('beforeunload', () => {
            this.closeStream();
        });
    }

    initializeElements() {
        this.elements = {
            currentPrice: document.getElementById('current-price'),
            dailyChange: document.getElementById('daily-change'),
            fluctuationRate: document.getElementById('fluctuation-rate'),
            priceDirection: document.querySelector('.price-direction'),
            boxPriceChange: document.querySelector('.box-price-change')
        };

        this.validateElements();
    }

    validateElements() {
        const missingElements = Object.entries(this.elements)
            .filter(([_, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            throw new Error(`필수 DOM 요소를 찾을 수 없습니다: ${missingElements.join(', ')}`);
        }
    }

    connectStream() {
        this.closeStream();
        this.evtSource = getCoinRealtime(tradeCoinId, {
            onCoinInfo: this.updateCoinInfo.bind(this),
            onOrderBook: this.handleOrderBook.bind(this),
        });
    }

    subscribeOrderbook(callback) {
        this.orderbookSubscribers ??= [];
        this.orderbookSubscribers.push(callback);
        if (this.latestOrderbook) {
            callback(this.latestOrderbook);
        }
    }

    handleOrderBook(data) {
        this.latestOrderbook = data;
        this.orderbookSubscribers?.forEach(fn => fn(data));
    }

    closeStream() {
        if (this.evtSource) {
            this.evtSource.close();
            this.evtSource = null;
        }
    }

    updateCoinInfo(coinInfo) {
        try {
            if (!this.validateCoinInfo(coinInfo)) {
                throw new Error('잘못된 코인 정보 데이터');
            }

            this.updatePrice(coinInfo);
            this.updateDailyChange(coinInfo);
            this.updateFluctuationRate(coinInfo);
            this.updatePriceDirection(coinInfo.change_price);

        } catch (error) {
            console.error('코인 정보 업데이트 중 오류:', error);
        }
    }

    validateCoinInfo(coinInfo) {
        return coinInfo &&
            typeof coinInfo.current_price !== 'undefined' &&
            typeof coinInfo.change_price !== 'undefined' &&
            typeof coinInfo.fluctuation_rate !== 'undefined';
    }

    updatePrice(coinInfo) {
        this.elements.currentPrice.textContent = this.formatNumberWithCommas(
            parseInt(coinInfo.current_price)
        );
    }

    updateDailyChange(coinInfo) {
        this.elements.dailyChange.textContent = this.formatNumberWithCommas(
            parseInt(coinInfo.change_price)
        );
    }

    updateFluctuationRate(coinInfo) {
        this.elements.fluctuationRate.textContent = 
            `${coinInfo.fluctuation_rate.toFixed(2)}%`;
    }

    updatePriceDirection(dailyChange) {
        if (dailyChange > 0) {
            this.elements.boxPriceChange.classList.remove('down');
            this.elements.boxPriceChange.classList.add('up');
            this.elements.priceDirection.innerHTML = '▲';
        } else if (dailyChange < 0) {
            this.elements.boxPriceChange.classList.remove('up');
            this.elements.boxPriceChange.classList.add('down');
            this.elements.priceDirection.innerHTML = '▼';
        }
    }

    formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// 싱글톤 인스턴스 생성
export const priceManager = new LivePriceManager();