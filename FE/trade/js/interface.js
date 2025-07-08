import { tradeCoinId } from '/trade/js/trade.js';
import { getMyProfile } from '/hook/user/getMyProfile.js';
import { getUserCoins } from '/hook/user/getUserCoins.js';
import { createOrder } from '/hook/trade/postOrder.js';


document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소
  const containerInterface = document.querySelector('.container-interface');
  const quantityInput = document.querySelector('.quantity input');
  const orderPriceInput = document.querySelector('.order-price input');
  const totalPriceInput = document.querySelector('.total-price input');
  const orderPriceLabel = document.querySelector('.order-price label');
  const availableAmount = document.querySelector('.available span');
  const quantityUnit = document.querySelector('.quantity .input-group span');
  const buyButton = document.querySelector('.sell-type-btn');
  const sellButton = document.querySelector('.buy-type-btn');
  const orderButton = document.querySelector('.order-btn span');
  const resetBtn = document.querySelector('.reset-btn');
  const quickOrderBtns = document.querySelectorAll('.quick-orders button');
  const orderErrorMessage = document.querySelector('.box-order-error-message span');

  // 상수
  const FEE_RATE = 1;
  const MAX_ORDER_QUANTITY = 1000;
  const PRICE_UNIT = 100;

  // 사용자 정보 상태
  let userMoney = 0;
  let userCoins = [];

  // 사용자 코인 정보 가져오기
  const fetchUserCoins = async () => {
    try {
      userCoins = await getUserCoins();
      console.log('사용자 코인 정보:', userCoins);
    } catch (error) {
      console.error('사용자 코인 정보 조회 실패:', error);
      alert('사용자 코인 정보를 불러오는데 실패했습니다.');
    }
  };

  // 현재 코인의 보유 수량 가져오기
  const getCurrentCoinHoldQuantity = () => {
    console.log('현재 거래 코인 ID:', tradeCoinId);
    const currentCoin = userCoins.find(coin => coin.coin_id === tradeCoinId);
    console.log('현재 거래 코인 정보:', currentCoin);
    return currentCoin ? currentCoin.hold_quantity : 0;
  };

  // 사용자 정보 가져오기
  const fetchUserInform = async () => {
    try {
      const userInfo = await getMyProfile();
      userMoney = userInfo.money;
      updateAvailableAmount();
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      alert('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  // 사용 가능 금액/수량 업데이트
  const updateAvailableAmount = () => {
    if (containerInterface.classList.contains('buy-mode')) {
      availableAmount.textContent = `₩ ${formatNumber(userMoney)}`;
    } else {
      const holdQuantity = getCurrentCoinHoldQuantity();
      availableAmount.textContent = `${holdQuantity} 개`;
    }
  };

  // totalPriceInput을 읽기 전용으로 설정
  totalPriceInput.readOnly = true;

  // 숫자 처리 유틸리티 함수
  const parseNumberFromString = str => {
    const cleanStr = (str || '').toString().replace(/[^0-9]/g, '');
    return cleanStr === '' ? 0 : parseInt(cleanStr, 10);
  };

  const formatNumber = value => {
    return parseNumberFromString(value).toLocaleString('ko-KR');
  };

  // 입력 필드 포맷팅
  const formatInputValue = inputElement => {
    const value = parseNumberFromString(inputElement.value);
    
    // 수량 입력 필드인 경우
    if (inputElement === quantityInput && value > MAX_ORDER_QUANTITY) {
      orderErrorMessage.textContent = `구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY}개입니다.`;
      inputElement.value = formatNumber(MAX_ORDER_QUANTITY);
      return;
    }
    
    // 가격 입력 필드인 경우
    if (inputElement === orderPriceInput) {
      // 입력 중에는 100원 단위 체크를 하지 않음
      inputElement.value = value === 0 ? '' : formatNumber(value);
      return;
    }

    inputElement.value = value === 0 ? '' : formatNumber(value);
    orderErrorMessage.textContent = '';
  };

  // 주문 유효성 검사
  const validateOrder = (orderFis, orderPrice) => {
    const parsedFis = parseNumberFromString(orderFis);
    const parsedPrice = parseNumberFromString(orderPrice);
    const totalPrice = parsedFis * parsedPrice;

    if (!parsedFis || parsedFis <= 0) {
      orderErrorMessage.textContent = '유효한 주문 수량을 입력해주세요.';
      throw new Error('유효한 주문 수량을 입력해주세요.');
    }
    if (parsedFis > MAX_ORDER_QUANTITY) {
      orderErrorMessage.textContent = `구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY}개입니다.`;
      throw new Error(`구매할 수 있는 코인은 최대 ${MAX_ORDER_QUANTITY}개입니다.`);
    }
    if (!parsedPrice || parsedPrice <= 0) {
      orderErrorMessage.textContent = '유효한 주문 가격을 입력해주세요.';
      throw new Error('유효한 주문 가격을 입력해주세요.');
    }
    if (parsedPrice % PRICE_UNIT !== 0) {
      orderErrorMessage.textContent = '가격은 100원 단위로만 입력 가능합니다.';
      throw new Error('가격은 100원 단위로만 입력 가능합니다.');
    }
    if (containerInterface.classList.contains('buy-mode') && totalPrice > userMoney) {
      orderErrorMessage.textContent = '주문 가능 금액을 초과했습니다.';
      throw new Error('주문 가능 금액을 초과했습니다.');
    }
    orderErrorMessage.textContent = '';
    return true;
  };

  // 입력 필드 초기화
  const resetInputs = () => {
    quantityInput.value = '0';
    orderPriceInput.value = '0';
    totalPriceInput.value = '0';
    orderErrorMessage.textContent = '';
  };

  // 총액 계산
  const calculateTotalPrice = () => {
    const quantity = parseNumberFromString(quantityInput.value);
    const orderPrice = parseNumberFromString(orderPriceInput.value);
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
    quantityUnit.textContent = isBuyMode ? 'FIS' : '개';
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
    const currentPrice = parseNumberFromString(orderPriceInput.value);
    const newPrice = currentPrice + parseInt(increment);
    const roundedPrice = Math.floor(newPrice / PRICE_UNIT) * PRICE_UNIT;
    if (roundedPrice > 0) {
      orderPriceInput.value = formatNumber(roundedPrice);
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
          validateOrder(quantityInput.value, orderPriceInput.value);
        } catch (error) {
          // 유효성 검사 실패 시 에러 메시지는 validateOrder에서 설정됨
        }
      });

      // 포커스 아웃 시 추가 검증
      input?.addEventListener('blur', () => {
        if (input === orderPriceInput && input.value) {
          const price = parseNumberFromString(input.value);
          const roundedPrice = Math.floor(price / PRICE_UNIT) * PRICE_UNIT;
          input.value = formatNumber(roundedPrice);
          calculateTotalPrice();
          orderErrorMessage.textContent = '';
        }
      });
    });

    // 주문 타입 전환 버튼
    buyButton?.addEventListener('click', () => switchOrderMode(true));
    sellButton?.addEventListener('click', () => switchOrderMode(false));

    // 주문 버튼
    orderButton?.parentElement?.addEventListener('click', async () => {
      const orderFis = parseNumberFromString(quantityInput.value);
      const orderPrice = parseNumberFromString(orderPriceInput.value);

      const result = await processOrder(orderFis, orderPrice);
      
      if (result.success) {
        console.log('주문이 성공적으로 처리되었습니다:', result.data);
        alert('주문이 성공적으로 처리되었습니다.');
        resetInputs();
        // 주문 성공 후 사용자 정보와 코인 정보 갱신
        await Promise.all([
          fetchUserInform(),
          fetchUserCoins()
        ]);
      } else {
        console.error('주문 처리 실패:', result.error);
        alert(result.error);
      }
    });

    // 초기화 버튼
    resetBtn?.addEventListener('click', resetInputs);

    // 퀵 오더 버튼
    quickOrderBtns.forEach(btn => {
      btn.addEventListener('click', () =>
        handleQuickOrder(parseInt(btn.value))
      );
    });
  };

  // 초기화
  const initialize = async () => {
    await Promise.all([
      fetchUserInform(),
      fetchUserCoins()
    ]); // 사용자 정보와 코인 정보를 동시에 가져오기
    initializeEventListeners();
    switchOrderMode(true);
  };

  initialize();
});
