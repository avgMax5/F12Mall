import { CONFIG } from '/config.js';

export const getUserCoins = async () => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/me/coins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('보유 코인 목록 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('보유 코인 목록 조회 중 오류 발생:', error);
    throw error;
  }
};
