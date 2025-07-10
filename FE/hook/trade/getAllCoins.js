import { CONFIG } from '/config.js';

export async function getAllCoins(filter = 'all') {
  try {
    const url = `${CONFIG.API_BASE_URL}/coins?filter=${encodeURIComponent(filter)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/__unauthorized__";
      }
      throw new Error('전체 코인 정보 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('코인 정보 조회 API 호출 중 오류 발생:', error);
    throw error;
  }
}