import { tradeCoinId } from '/trade/js/trade.js';
import { getOrderbook } from '/hook/trade/getOrderbook.js';

const COLOR = {
    BLUE: '#1376ee',
    RED: '#e01200',
    WHITE: '#FFFFFF'
};

class OrderbookManager {
    constructor() {
        this.elements = null;
        this.currentMode = null;
        this.orderbookStream = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                this.initializeElements();
                this.attachEventListeners();
                this.switchMode('orderbook');
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
            buttons: {
                orderbook: document.querySelector('.orderbook-btn'),
                myorderlist: document.querySelector('.myorderlist-btn')
            },
            contents: {
                orderbook: document.querySelector('.orderbook-content'),
                myorderlist: document.querySelector('.myorderlist-content')
            },
            container: document.querySelector('.container-orderbook')
        };

        this.validateElements();
    }

    validateElements() {
        const requiredElements = [
            this.elements.buttons.orderbook,
            this.elements.buttons.myorderlist,
            this.elements.contents.orderbook,
            this.elements.contents.myorderlist,
            this.elements.container
        ];

        if (requiredElements.some(element => !element)) {
            throw new Error('필요한 DOM 요소를 찾을 수 없습니다.');
        }
    }

    attachEventListeners() {
        this.elements.buttons.orderbook.addEventListener('click', () => {
            if (!this.elements.buttons.orderbook.classList.contains('active')) {
                this.switchMode('orderbook');
            }
        });
        
        this.elements.buttons.myorderlist.addEventListener('click', () => {
            if (!this.elements.buttons.myorderlist.classList.contains('active')) {
                this.switchMode('myorderlist');
            }
        });
    }

    switchMode(newMode) {
        try {
            if (!this.elements || this.currentMode === newMode) return;

            const prevMode = this.currentMode;
            this.currentMode = newMode;
            const otherMode = newMode === 'orderbook' ? 'myorderlist' : 'orderbook';
            
            this.updateUIForMode(newMode, otherMode);
            this.handleStreamForMode(newMode);

            console.log(`모드 전환: ${prevMode || 'none'} -> ${newMode}`);
        } catch (error) {
            console.error('모드 전환 중 오류:', error);
        }
    }

    updateUIForMode(newMode, otherMode) {
        // 버튼 상태 업데이트
        this.elements.buttons[newMode].classList.add('active');
        this.elements.buttons[newMode].classList.remove('deactive');
        this.elements.buttons[otherMode].classList.add('deactive');
        this.elements.buttons[otherMode].classList.remove('active');
        
        // 컨텐츠 상태 업데이트
        this.elements.contents[newMode].classList.add('active');
        this.elements.contents[newMode].classList.remove('deactive');
        this.elements.contents[otherMode].classList.add('deactive');
        this.elements.contents[otherMode].classList.remove('active');
        
        // 컨테이너 모드 업데이트
        this.elements.container.classList.remove(`${otherMode}-mode`);
        this.elements.container.classList.add(`${newMode}-mode`);
    }

    handleStreamForMode(newMode) {
        if (newMode === 'orderbook') {
            this.closeStream();
            this.orderbookStream = getOrderbook(tradeCoinId, this.updateOrderbook.bind(this));
        } else {
            this.closeStream();
        }
    }

    closeStream() {
        if (this.orderbookStream) {
            this.orderbookStream.close();
            this.orderbookStream = null;
        }
    }

    createOrderRow(item, quantityRatio) {
        const row = document.createElement('div');
        row.className = 'orderbook-row';
        
        const quantity = parseInt(item.quantity).toLocaleString();
        const unitPrice = parseInt(item.unit_price).toLocaleString();
        const fluctuationRate = parseFloat(item.fluctuation_rate).toFixed(2);

        const getBackgroundColor = (rate) => {
            if (rate === 0) return COLOR.WHITE;
            return rate < 0 ? COLOR.BLUE : COLOR.RED;
        };
        
        row.innerHTML = `
            <div class="quantity-wrapper">
                <div class="ordered-quantity" style="background-color: ${item.order_type === 'SELL' ? COLOR.BLUE : COLOR.RED}; width: ${quantityRatio}%"></div>
                <span class="quantity-text">${quantity}</span>
            </div>
            <div class="ordered-price" style="color: ${getBackgroundColor(item.fluctuation_rate)}">
                <span>${unitPrice}</span>
            </div>
            <div class="fluctuation-rate" style="color: ${getBackgroundColor(item.fluctuation_rate)}">
                <span>${fluctuationRate >= 0 ? '+' : ''}${fluctuationRate}</span>%
            </div>
        `;
        
        return row;
    }

    validateOrderData(item) {
        return !(typeof item.quantity === 'undefined' || 
                typeof item.unit_price === 'undefined' || 
                typeof item.fluctuation_rate === 'undefined' ||
                !item.order_type);
    }

    updateOrderbook(orderbookData) {
        try {
            if (!this.elements?.contents?.orderbook || this.currentMode !== 'orderbook') {
                return;
            }

            // 데이터 로깅
            console.log('오더북 데이터 수신:', {
                timestamp: new Date().toISOString(),
                dataLength: Array.isArray(orderbookData) ? orderbookData.length : 0,
                data: orderbookData
            });

            const orderbookContent = this.elements.contents.orderbook;
            orderbookContent.innerHTML = '';
            
            if (Array.isArray(orderbookData)) {
                // 최대 quantity 찾기
                const maxQuantity = Math.max(...orderbookData
                    .filter(item => this.validateOrderData(item))
                    .map(item => parseInt(item.quantity)));

                orderbookData
                    .filter(item => this.validateOrderData(item))
                    .forEach(item => {
                        try {
                            const quantityRatio = (parseInt(item.quantity) / maxQuantity) * 100;
                            const row = this.createOrderRow(item, quantityRatio);
                            orderbookContent.appendChild(row);
                        } catch (error) {
                            console.error('주문 행 생성 중 오류:', error);
                        }
                    });
            }
        } catch (error) {
            console.error('오더북 업데이트 중 오류:', error);
        }
    }
}

// 싱글톤 인스턴스 생성
new OrderbookManager();
