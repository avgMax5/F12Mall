import { CONFIG } from '/config.js';

const API_CHECK_USERNAME_URL = `${CONFIG.API_BASE_URL}/auth/check-username`;

// 순수하게 API 통신만 담당하는 함수
export async function checkUsernameDuplicate(username) {
    try {
        const response = await fetch(API_CHECK_USERNAME_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username: username })
        });
        
        if (response.ok) {
            const result = await response.json();
            return { success: true, data: result };
        } else {
            throw new Error('중복확인 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('중복확인 오류:', error);
        throw new Error(error.message || '중복확인 중 오류가 발생했습니다.');
    }
}