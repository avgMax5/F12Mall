import { CONFIG } from '/config.js';

export async function putEditProfile(userId, data) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/__unauthorized__";
      }
      throw new Error('프로필 수정에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('프로필 수정 API 호출 중 오류 발생:', error);
    throw error;
  }
};