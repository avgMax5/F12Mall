import { CONFIG } from '/config.js';

const API_LOGOUT_URL = `${CONFIG.API_BASE_URL}/auth/logout`;

async function handleLogout() {
    try {
        const response = await fetch(API_LOGOUT_URL, {
            method: "POST",
            credentials: "include",
            cache: 'no-cache'
        });
        
        if (response.ok) {
            document.cookie = "secretToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            window.location.href = "/";
        } else {
            window.location.href = "/login";
        }
    } catch (error) {
        window.location.href = "/login";
    }
}

window.handleLogout = handleLogout;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const logoutElement = document.querySelector(".logout");
        if (logoutElement) {
            logoutElement.addEventListener("click", handleLogout);
        }
    }, 100);
});
