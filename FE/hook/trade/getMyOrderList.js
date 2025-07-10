import { CONFIG } from '/config.js';

export const getMyOrderList = async (coinId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/coins/${coinId}/orders/mylist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/__unauthorized__";
      }
      throw new Error('내 주문 목록 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('내 주문 목록 조회 API 호출 중 오류 발생:', error);
    throw error;
  }
};

