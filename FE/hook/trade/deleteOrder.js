import { CONFIG } from '/config.js';

export const cancelOrder = async (coinId, orderId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/coins/${coinId}/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('주문 취소에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('주문 취소 API 호출 중 오류 발생:', error);
    throw error;
  }
};
