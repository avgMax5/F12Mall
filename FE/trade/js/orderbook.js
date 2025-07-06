document.addEventListener('DOMContentLoaded', () => {
  // OrderBook 행 클릭 이벤트 처리
  const orderBookRows = document.querySelectorAll('.orderbook-row');
  orderBookRows.forEach(row => {
    row.addEventListener('click', () => {
      const price = row.querySelector('.price').textContent;
      const orderPriceInput = document.querySelector('.order-price input');
      if (orderPriceInput) {
        orderPriceInput.value = price;
        // 가격 입력 후 총액 재계산을 위해 input 이벤트 발생
        const event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        orderPriceInput.dispatchEvent(event);
      }
    });
  });

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('ko-KR');
  };

  // 초기 가격 포맷팅
  const priceElements = document.querySelectorAll('.orderbook-row .price');
  priceElements.forEach(element => {
    element.textContent = formatPrice(element.textContent);
  });
}); 