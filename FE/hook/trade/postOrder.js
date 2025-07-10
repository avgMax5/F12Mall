import { CONFIG } from '/config.js';

export const createOrder = async (coinId, orderType, orderFis, orderPrice) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/coins/${coinId}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        order_type: orderType,
        order_fis: orderFis,
        order_price: orderPrice
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/__unauthorized__";
      }
      throw new Error('주문 요청에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('주문 API 호출 중 오류 발생:', error);
    throw error;
  }
};