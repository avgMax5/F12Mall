document.addEventListener('DOMContentLoaded', () => {
  const quantityInput = document.querySelector('.quantity input');
  const orderPriceInput = document.querySelector('.order-price input');
  const totalPriceInput = document.querySelector('.total-price input');

  // 수수료 상수
  const FEE_RATE = 0.05;

  // input 값을 가져올 때 빈 값이면 0을 반환하는 함수
  const getInputValue = inputElement => {
    const value = inputElement.value.trim();
    return value === '' ? '0' : value;
  };

  // 숫자 문자열에서 쉼표 제거하고 숫자로 변환하는 함수
  const parseNumberFromString = str => {
    const cleanStr = str.replace(/,/g, '');
    return cleanStr === '' ? 0 : parseInt(cleanStr, 10);
  };

  // 총액 자동 계산 함수
  const calculateTotalPrice = () => {
    const quantity = parseNumberFromString(quantityInput.value);
    const orderPrice = parseNumberFromString(orderPriceInput.value);

    const totalPrice = quantity * orderPrice * (1 + FEE_RATE);

    // 총액을 포맷팅하여 표시
    totalPriceInput.value = totalPrice.toLocaleString('ko-KR');
  };

  // 주문 요청 시 모든 input 값을 검증하고 기본값 적용
  const validateAndPrepareOrderData = () => {
    const quantity = getInputValue(quantityInput);
    const orderPrice = getInputValue(orderPriceInput);
    const totalPrice = getInputValue(totalPriceInput);

    // 빈 값이면 0으로 설정
    if (quantityInput.value.trim() === '') {
      quantityInput.value = '0';
    }
    if (orderPriceInput.value.trim() === '') {
      orderPriceInput.value = '0';
    }
    if (totalPriceInput.value.trim() === '') {
      totalPriceInput.value = '0';
    }

    return {
      quantity: quantity,
      orderPrice: orderPrice,
      totalPrice: totalPrice,
    };
  };

  const formatNumber = inputElement => {
    // 1. 숫자 이외의 문자 제거하고 숫자로 변환
    let value = inputElement.value.replace(/[^0-9]/g, '');

    // 2. 빈 문자열이면 0으로 처리
    if (value === '') {
      inputElement.value = '0';
      return;
    }

    // 3. 숫자로 변환
    const numberValue = parseInt(value, 10);

    // 4. 세 자리마다 쉼표 추가
    inputElement.value = numberValue.toLocaleString('ko-KR');
  };

  if (orderPriceInput) {
    orderPriceInput.addEventListener('input', () => {
      formatNumber(orderPriceInput);
      calculateTotalPrice(); // 총액 재계산
    });
    // 초기 로딩 시에도 포맷팅 적용
    formatNumber(orderPriceInput);
  }

  if (totalPriceInput) {
    // 주문 총액은 자동 계산되므로 readonly 상태 유지
    formatNumber(totalPriceInput);
  }

  if (quantityInput) {
    quantityInput.addEventListener('input', () => {
      formatNumber(quantityInput);
      calculateTotalPrice(); // 총액 재계산
    });
    // 초기 로딩 시에도 포맷팅 적용
    formatNumber(quantityInput);
  }

  // 초기 총액 계산
  calculateTotalPrice();

  // TODO: 주문 수량과 매수 가격에 따라 주문 총액을 계산하고 포맷팅하는 로직 추가 필요

  // Order type switching
  const containerInterface = document.querySelector('.container-interface');
  const buyButton = document.querySelector('.sell-type-btn'); // 매수 버튼
  const sellButton = document.querySelector('.buy-type-btn'); // 매도 버튼
  const orderButton = document.querySelector('.order-btn span');
  const orderPriceLabel = document.querySelector('.order-price label');
  const availableAmount = document.querySelector('.available span');
  const quantityUnit = document.querySelector('.quantity .input-group span');

  const switchToBuyMode = () => {
    containerInterface.classList.add('buy-mode');
    containerInterface.classList.remove('sell-mode');
    buyButton.classList.add('active');
    buyButton.classList.remove('deactive');
    sellButton.classList.remove('active');
    sellButton.classList.add('deactive');

    orderPriceLabel.textContent = '매수 가격';
    availableAmount.textContent = '₩ 1,311,000'; // 예시 데이터
    quantityUnit.textContent = 'FIS';
    orderButton.textContent = '매수';
  };

  const switchToSellMode = () => {
    containerInterface.classList.remove('buy-mode');
    containerInterface.classList.add('sell-mode');
    buyButton.classList.remove('active');
    buyButton.classList.add('deactive');
    sellButton.classList.add('active');
    sellButton.classList.remove('deactive');

    orderPriceLabel.textContent = '매도 가격';
    availableAmount.textContent = '17 개'; // 예시 데이터
    quantityUnit.textContent = '개';
    orderButton.textContent = '매도';
  };

  buyButton.addEventListener('click', switchToBuyMode);
  sellButton.addEventListener('click', switchToSellMode);

  // 주문 버튼 클릭 이벤트
  const orderBtn = document.querySelector('.order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const orderData = validateAndPrepareOrderData();
      console.log('주문 데이터:', orderData);

      // 여기에 실제 주문 API 호출 로직을 추가할 수 있습니다
      // 예: sendOrderRequest(orderData);
    });
  }

  // 초기화 버튼 클릭 이벤트
  const resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (quantityInput) quantityInput.value = '';
      if (orderPriceInput) orderPriceInput.value = '';
      if (totalPriceInput) totalPriceInput.value = '';
      calculateTotalPrice(); // 초기화 후 총액 재계산
    });
  }

  // 초기 상태 설정 (buy-mode가 기본이라고 가정)
  switchToBuyMode();
});
