import { CONFIG } from '/config.js';

const API_LOGIN_URL = `${CONFIG.API_BASE_URL}/auth/login`;

function handleLogin() {
    const username = document.querySelector('.login-username').value;
    // passwordManager에서 실제 비밀번호 값 가져오기
    const password = window.passwordManager ? window.passwordManager.getRealValue('.login-password') : document.querySelector('.login-password').value;

    const loginData = {
        username: username,
        password: password
    };
    
    submitLogin(loginData);
}

function showFailAlert() {
    if (document.querySelector('.fail-alert-modal')) return;
    fetch('/common/modal/fail-modal.html')
        .then(res => res.text())
        .then(html => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
        });
}

async function submitLogin(loginData) {
    try {
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            cache: 'no-cache',
            body: JSON.stringify(loginData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`요청 실패: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        window.location.href = '/main';
    } catch (err) {
        // 로그인 실패 시 비밀번호 필드 초기화
        const passwordInput = document.querySelector('.login-password');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus(); // 포커스도 비밀번호 필드로 이동
        }
        
        showFailAlert();
    }
}

// 전역 스코프에 함수 노출
window.handleLogin = handleLogin;

// DOM 로드 시 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 폼에 이벤트 리스너 추가
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
});