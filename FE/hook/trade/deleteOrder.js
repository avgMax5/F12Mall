import { CONFIG } from '/config.js';

export const cancelOrder = async (coinId, orderId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/coins/${coinId}/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/__unauthorized__";
      }
      throw new Error('주문 취소에 실패했습니다.');
    }

    // 204 No Content 또는 응답 본문이 없는 경우 처리
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('주문 취소 API 호출 중 오류 발생:', error);
    throw error;
  }
};
