import { tradeCoinId } from '/trade/js/trade.js';
import { getMyProfile } from '/hook/user/getMyProfile.js';
import { getUserCoins } from '/hook/user/getUserCoins.js';
import { createOrder } from '/hook/trade/postOrder.js';
import { updateMyOrderList } from '/trade/js/orderbook.js';
import { showFailAlert, showSuccessAlert, showConfirmModal } from '/common/js/modal.js';

// 사용자 정보 상태
let userMoney = 0;
let userCoins = [];

// DOM 요소
let containerInterface = null;
let availableAmount = null;
let quantityInput = null;
let orderPriceInput = null;
let totalPriceInput = null;
let orderPriceLabel = null;
let quantityUnit = null;
let buyButton = null;
let sellButton = null;
let orderButton = null;
let resetBtn = null;
let quickOrderBtns = null;
let orderErrorMessage = null;
let toggleBtn = null;

// 숫자 처리 유틸리티 함수
const formatNumber = value => {
  return value.toLocaleString('ko-KR');
};

// DOM 요소 초기화
const initializeDOMElements = () => {
  containerInterface = document.querySelector('.container-interface');
  availableAmount = document.querySelector('.available span');
  quantityInput = document.querySelector('.quantity input');
  orderPriceInput = document.querySelector('.order-price input');
  totalPriceInput = document.querySelector('.total-price input');
  orderPriceLabel = document.querySelector('.order-price label');
  quantityUnit = document.querySelector('.quantity .input-group span');
  buyButton = document.querySelector('.sell-type-btn');
  sellButton = document.querySelector('.buy-type-btn');
  orderButton = document.querySelector('.order-btn span');
  resetBtn = document.querySelector('.reset-btn');
  quickOrderBtns = document.querySelectorAll('.quick-orders button');
  orderErrorMessage = document.querySelector('.box-order-error-message span');
  toggleBtn = document.querySelector('.box-toggle');
};

// 현재 코인의 보유 수량 가져오기
const getCurrentCoinHoldQuantity = () => {
  const currentCoin = userCoins.find(coin => coin.coin_id === tradeCoinId);
  return currentCoin ? currentCoin.hold_quantity : 0;
};

// 사용 가능 금액/수량 업데이트
export const updateAvailableAmount = () => {
  if (!containerInterface || !availableAmount) {
    initializeDOMElements();
  }
  
  if (!containerInterface || !availableAmount) return;

  if (containerInterface.classList.contains('buy-mode')) {
    availableAmount.textContent = `₩ ${formatNumber(userMoney)}`;
  } else {
    const holdQuantity = getCurrentCoinHoldQuantity();
    availableAmount.textContent = `${holdQuantity} FIS`;
  }
};

// 사용자 정보 가져오기
export const fetchUserInform = async () => {
  try {
    const userInfo = await getMyProfile();
    userMoney = userInfo.money;
    updateAvailableAmount();
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    showFailAlert('사용자 정보를 불러오는데 실패했습니다.');
  }
};

// 사용자 코인 정보 가져오기
export const fetchUserCoins = async () => {
  try {
    userCoins = await getUserCoins();
    updateAvailableAmount();
  } catch (error) {
    console.error('사용자 코인 정보 조회 실패:', error);
    showFailAlert('사용자 코인 정보를 불러오는데 실패했습니다.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 초기화
  initializeDOMElements();

  // 상수
  const FEE_RATE = 1;
  const MAX_ORDER_QUANTITY = 1000;
  const PRICE_UNIT = 100;

  // totalPriceInput을 읽기 전용으로 설정
  totalPriceInput.readOnly = true;

  // 입력 필드 포맷팅
  const formatInputValue = inputElement => {
    const value = inputElement.valueAsNumber || 0;

    // 수량 입력 필드인 경우
    if (inputElement === quantityInput && value > MAX_ORDER_QUANTITY) {
      orderErrorMessage.textContent = `구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY} FIS 입니다.`;
      inputElement.value = MAX_ORDER_QUANTITY;
      return;
    }

    // NaN 체크
    if (isNaN(value)) {
      inputElement.value = 0;
    }
    
    orderErrorMessage.textContent = '';
  };

  // 주문 유효성 검사
  const validateOrder = (orderFis, orderPrice) => {
    if (isNaN(orderFis) || orderFis <= 0) {
      orderErrorMessage.textContent = '유효한 주문 수량을 입력해주세요.';
      throw new Error('유효한 주문 수량을 입력해주세요.');
    }
    if (orderFis > MAX_ORDER_QUANTITY) {
      orderErrorMessage.textContent = `구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY} FIS 입니다.`;
      throw new Error(`구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY} FIS 입니다.`);
    }
    if (isNaN(orderPrice) || orderPrice <= 0) {
      orderErrorMessage.textContent = '유효한 주문 가격을 입력해주세요.';
      throw new Error('유효한 주문 가격을 입력해주세요.');
    }
    if (orderPrice % PRICE_UNIT !== 0) {
      orderErrorMessage.textContent = '가격은 100원 단위로만 입력 가능합니다.';
      throw new Error('가격은 100원 단위로만 입력 가능합니다.');
    }
    
    const totalPrice = orderFis * orderPrice;
    if (containerInterface.classList.contains('buy-mode') && totalPrice > userMoney) {
      orderErrorMessage.textContent = '주문 가능 금액을 초과했습니다.';
      throw new Error('주문 가능 금액을 초과했습니다.');
    }
    
    orderErrorMessage.textContent = '';
    return true;
  };

  // 입력 필드 초기화
  const resetInputs = () => {
    quantityInput.value = 0;
    orderPriceInput.value = 0;
    totalPriceInput.value = 0;
    orderErrorMessage.textContent = '';
  };

  // 총액 계산
  const calculateTotalPrice = () => {
    const quantity = quantityInput.valueAsNumber || 0;
    const orderPrice = orderPriceInput.valueAsNumber || 0;
    const isBuyMode = containerInterface.classList.contains('buy-mode');

    const totalPrice = isBuyMode
      ? quantity * orderPrice * (1 + FEE_RATE / 100)
      : quantity * orderPrice;

    totalPriceInput.value = formatNumber(totalPrice);
  };

  // 주문 모드 전환
  const switchOrderMode = isBuyMode => {
    containerInterface.classList.toggle('buy-mode', isBuyMode);
    containerInterface.classList.toggle('sell-mode', !isBuyMode);
    buyButton.classList.toggle('active', isBuyMode);
    buyButton.classList.toggle('deactive', !isBuyMode);
    sellButton.classList.toggle('active', !isBuyMode);
    sellButton.classList.toggle('deactive', isBuyMode);

    orderPriceLabel.textContent = isBuyMode ? '매수 가격' : '매도 가격';
    quantityUnit.textContent = !isBuyMode ? 'FIS' : '개';
    orderButton.textContent = isBuyMode ? '매수' : '매도';

    updateAvailableAmount();
    resetInputs();
  };

  // 주문 처리
  const processOrder = async (orderFis, orderPrice) => {
    try {
      validateOrder(orderFis, orderPrice);

      const orderType = containerInterface.classList.contains('buy-mode')
        ? 'BUY'
        : 'SELL';
      const response = await createOrder(
        tradeCoinId,
        orderType,
        orderFis,
        orderPrice
      );

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || '주문 처리에 실패했습니다.',
      };
    }
  };

  // 퀵 오더 처리
  const handleQuickOrder = increment => {
    const currentPrice = orderPriceInput.valueAsNumber || 0;
    const newPrice = currentPrice + increment;
    const roundedPrice = Math.floor(newPrice / PRICE_UNIT) * PRICE_UNIT;
    if (roundedPrice > 0) {
      orderPriceInput.value = roundedPrice;
      calculateTotalPrice();
    }
  };

  // 이벤트 리스너 설정
  const initializeEventListeners = () => {
    // 입력 필드 이벤트
    [quantityInput, orderPriceInput].forEach(input => {
      input?.addEventListener('input', () => {
        formatInputValue(input);
        calculateTotalPrice();
        try {
          validateOrder(quantityInput.valueAsNumber || 0, orderPriceInput.valueAsNumber || 0);
        } catch (error) {
          // 유효성 검사 실패 시 에러 메시지는 validateOrder에서 설정됨
        }
      });

      // 포커스 아웃 시 추가 검증
      input?.addEventListener('blur', () => {
        if (input === orderPriceInput && input.value) {
          const price = input.valueAsNumber || 0;
          const roundedPrice = Math.floor(price / PRICE_UNIT) * PRICE_UNIT;
          input.value = roundedPrice;
          calculateTotalPrice();
          orderErrorMessage.textContent = '';
        } else if (input === quantityInput && input.value) {
          input.value = input.valueAsNumber || 0;
          calculateTotalPrice();
        }
      });
    });

    // 주문 타입 전환 버튼
    buyButton?.addEventListener('click', () => switchOrderMode(true));
    sellButton?.addEventListener('click', () => switchOrderMode(false));

    // 주문 버튼
    orderButton?.parentElement?.addEventListener('click', async () => {
      const orderFis = quantityInput.valueAsNumber || 0;
      const orderPrice = orderPriceInput.valueAsNumber || 0;

      // 먼저 유효성 검사
      try {
        validateOrder(orderFis, orderPrice);
      } catch (error) {
        showFailAlert(error.message);
        return;
      }

      // 주문 타입 결정
      const isBuyMode = containerInterface.classList.contains('buy-mode');
      const action = isBuyMode ? '매수' : '매도';
      
      // confirm 모달 띄우기
      showConfirmModal(`${orderFis}`, action, 
        async () => {
          // 확인 버튼 클릭 시 기존 주문 처리 로직 실행
          const result = await processOrder(orderFis, orderPrice);
          
          if (result.success) {
            console.log('주문이 성공적으로 처리되었습니다:', result.data);
            showSuccessAlert('주문이 성공적으로 처리되었습니다.');
            resetInputs();
            // 주문 성공 후 주문 목록, 사용자 정보, 코인 정보 갱신
            await Promise.all([
              updateMyOrderList(),
              fetchUserInform(),
              fetchUserCoins()
            ]);
            // interface 영역 초기화
            updateAvailableAmount();
            calculateTotalPrice();
          } else {
            console.error('주문 처리 실패:', result.error);
            showFailAlert(result.error);
          }
        }
      );
    });

    // 초기화 버튼
    resetBtn?.addEventListener('click', resetInputs);

    // 퀵 오더 버튼
    quickOrderBtns.forEach(btn => {
      btn.addEventListener('click', () =>
        handleQuickOrder(parseInt(btn.value))
      );
    });

    // 토글 버튼 이벤트 리스너
    toggleBtn?.addEventListener('click', () => {
      containerInterface?.classList.toggle('show');
    });

    // 모바일에서 interface 영역 외 클릭 시 닫기
    document.addEventListener('click', (event) => {
      const isMobile = window.innerWidth <= 767;
      if (!isMobile) return;

      const isInterfaceClick = containerInterface?.contains(event.target);
      const isToggleClick = toggleBtn?.contains(event.target);

      if (!isInterfaceClick && !isToggleClick && containerInterface?.classList.contains('show')) {
        containerInterface.classList.remove('show');
      }
    });

    // 화면 크기 변경 시 모바일 아닐 때는 show 클래스 제거
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) {
        containerInterface?.classList.remove('show');
      }
    });
  };

  // 초기화
  const initialize = async () => {
    await Promise.all([fetchUserInform(), fetchUserCoins()]);
    initializeEventListeners();
    switchOrderMode(true);
  };

  initialize();
});
