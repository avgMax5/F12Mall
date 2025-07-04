import { CONFIG } from '/config.js';

const API_LOGOUT_URL = `${CONFIG.API_BASE_URL}/auth/logout`;

async function handleLogout() {
    try {
        const response = await fetch(API_LOGOUT_URL, {
            method: "POST",
            credentials: "include"
        });
        
        if (response.ok) {
            console.log("로그아웃 성공");
            window.location.href = "/login";
        } else {
            console.error("로그아웃 실패");
            console.log("로그아웃 실패", response);
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("로그아웃 요청 중 오류:", error);
        console.log("로그아웃 요청 중 오류", error);
        window.location.href = "/login";
    }
}

window.handleLogout = handleLogout;

document.addEventListener('DOMContentLoaded', function() {

    setTimeout(() => {
        const logoutElement = document.querySelector(".logout");
        if (logoutElement) {
            logoutElement.addEventListener("click", handleLogout);
            console.log("로그아웃 이벤트 리스너 등록 완료");
        } else {
            console.log("로그아웃 요소를 찾을 수 없습니다");
        }
    }, 100);
});
