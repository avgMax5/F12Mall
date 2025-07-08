import { tradeCoinId } from '/trade/js/trade.js';
import { getOrderbook } from '/hook/trade/getOrderbook.js';
import { getMyOrderList } from '/hook/trade/getMyOrderList.js';

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

    /////////////  Orderbook  //////////////

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
            this.updateMyOrderList();
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

    /////////////  MyOrderList  //////////////

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    createMyOrderRow(order) {
        const row = document.createElement('div');
        row.className = `myorderlist-row ${order.order_type.toLowerCase()}`;
        
        row.innerHTML = `
            <div class="ordered-time-row">
                <span class="order-date">${this.formatDate(order.ordered_at)}</span>
                <span class="order-time">${this.formatTime(order.ordered_at)}</span>
            </div>
            <div class="order-type-row">
                <span class="order-type">${order.order_type}</span>
            </div>
            <div class="ordered-quantity-row">
                <span class="ordered-quantity">${order.quantity}</span>
            </div>
            <div class="ordered-price-row">
                <span class="ordered-price">${this.formatNumber(order.unit_price)}</span>
            </div>
            <div class="order-total-row">
                <span class="order-total">${order.order_type === 'SELL' ? '+' : '-'}${this.formatNumber(order.execute_amount)}</span>
                <button class="cancel-btn">주문취소</button>
            </div>
        `;

        return row;
    }

    async updateMyOrderList() {
        try {
            console.log('내 주문 목록 업데이트 시작');
            if (!this.elements?.contents?.myorderlist || this.currentMode !== 'myorderlist') {
                return;
            }

            const myorderlistContent = this.elements.contents.myorderlist.querySelector('.myorderlist-data');
            if (!myorderlistContent) {
                console.error('주문 목록을 표시할 컨테이너를 찾을 수 없습니다.');
                return;
            }

            const orderData = await getMyOrderList(tradeCoinId);
            myorderlistContent.innerHTML = '';
            console.log('내 주문 목록 데이터:', orderData);

            if (Array.isArray(orderData)) {
                orderData.forEach(order => {
                    try {
                        const row = this.createMyOrderRow(order);
                        myorderlistContent.appendChild(row);
                    } catch (error) {
                        console.error('주문 행 생성 중 오류:', error);
                    }
                });
            }

            console.log('내 주문 목록 업데이트 완료:', {
                timestamp: new Date().toISOString(),
                dataLength: Array.isArray(orderData) ? orderData.length : 0
            });
        } catch (error) {
            console.error('내 주문 목록 업데이트 중 오류:', error);
        }
    }
}

// 싱글톤 인스턴스 생성
new OrderbookManager();

// 정렬 관련 코드 추가
function initializeSorting() {
  const sortableColumns = document.querySelectorAll('.sortable');
  
  sortableColumns.forEach(column => {
    column.addEventListener('click', () => {
      // 다른 컬럼의 정렬 상태 초기화
      sortableColumns.forEach(col => {
        if (col !== column) {
          col.classList.remove('asc', 'desc');
          col.querySelector('.sort-icon').textContent = '';
        }
      });

      // 현재 컬럼의 정렬 상태 변경
      if (!column.classList.contains('asc') && !column.classList.contains('desc')) {
        column.classList.add('asc');
        column.querySelector('.sort-icon').textContent = '▲';
      } else if (column.classList.contains('asc')) {
        column.classList.remove('asc');
        column.classList.add('desc');
        column.querySelector('.sort-icon').textContent = '▼';
      } else {
        column.classList.remove('desc');
        column.querySelector('.sort-icon').textContent = '';
      }

      sortOrders(column);
    });
  });
}

function sortOrders(column) {
  const orderList = document.querySelector('.myorderlist-data');
  const orders = Array.from(orderList.children);
  
  const columnIndex = Array.from(column.parentElement.children).indexOf(column);
  const isAsc = column.classList.contains('asc');
  const isDesc = column.classList.contains('desc');
  
  if (!isAsc && !isDesc) {
    // 정렬 해제 - 원래 순서로 복원
    orders.sort((a, b) => {
      return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
    });
  } else {
    orders.sort((a, b) => {
      let aValue = a.children[columnIndex].textContent.trim();
      let bValue = b.children[columnIndex].textContent.trim();
      
      // 숫자 값인 경우 숫자로 변환
      if (columnIndex === 2 || columnIndex === 3 || columnIndex === 4) {
        aValue = parseFloat(aValue.replace(/[^0-9.-]+/g, ""));
        bValue = parseFloat(bValue.replace(/[^0-9.-]+/g, ""));
      }
      // 날짜인 경우
      else if (columnIndex === 0) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (isAsc) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
  
  // DOM 업데이트
  orders.forEach(order => orderList.appendChild(order));
}

// 주문 목록이 업데이트될 때마다 원래 순서 저장
function saveOriginalOrder() {
  const orders = document.querySelectorAll('.myorderlist-data > div');
  orders.forEach((order, index) => {
    order.dataset.originalIndex = index;
  });
}

// 기존 주문 목록 업데이트 함수 수정
function updateOrderList(orders) {
  const orderListContainer = document.querySelector('.myorderlist-data');
  // 기존 코드...
  
  // 원래 순서 저장
  saveOriginalOrder();
}

// 페이지 로드 시 정렬 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
  initializeSorting();
});
