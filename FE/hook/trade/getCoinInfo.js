import { CONFIG } from '/config.js';

export const getCoinInfo = async (coinId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/coins/${coinId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('코인 정보 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('코인 정보 조회 API 호출 중 오류 발생:', error);
    throw error;
  }
};

