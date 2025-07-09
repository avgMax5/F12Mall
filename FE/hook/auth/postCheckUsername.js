import { CONFIG } from '/config.js';

const API_CHECK_USERNAME_URL = `${CONFIG.API_BASE_URL}/auth/check-username`;

async function checkUsernameDuplicate() {
    const usernameInput = document.querySelector('.id-input');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('아이디를 입력해주세요!');
        usernameInput.focus();
        return;
    }
    
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
            
            if (result.is_duplicate) {
                alert(result.message);
                usernameInput.focus();
            } else {
                alert(result.message);
            }
        } else {
            alert('중복확인 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('중복확인 오류:', error);
        alert('중복확인 중 오류가 발생했습니다.');
    }
}

// 전역 스코프에 함수 노출
window.checkUsernameDuplicate = checkUsernameDuplicate;

// 버튼 받아오기
document.addEventListener('DOMContentLoaded', function() {
    const duplicateCheckBtn = document.querySelector('.id-check-btn');
    if (duplicateCheckBtn) {
        duplicateCheckBtn.addEventListener('click', checkUsernameDuplicate);
    }
});