import { CONFIG } from '/config.js';

export const getUserInformById = async userId => {
  try {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/users/${userId}/profile`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('프로필 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('프로필 조회 API 호출 중 오류 발생:', error);
    throw error;
  }
};
