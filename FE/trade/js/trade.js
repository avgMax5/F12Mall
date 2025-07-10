// 전역 변수로 coinId 선언
export let tradeCoinId = null;
import { getCoinInfo } from '/hook/trade/getCoinInfo.js';

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const coinId = params.get('coinId');

    if (!coinId) {
        window.location.href = '/main';
        return;
    }

    tradeCoinId = coinId;
    window.tradeCoinId = coinId;

    try {
        // 코인 정보 가져오기
        const coinInfo = await getCoinInfo(coinId);
        // 페이지 타이틀 업데이트
        document.title = `F12_All-Trade:${coinInfo.coin_name}`;

        // 모바일 인터페이스 토글 설정
        setupMobileInterface();
    } catch (error) {
        console.error('코인 정보를 가져오는 중 오류 발생:', error);
    }
});

function setupMobileInterface() {
    const toggleButton = document.querySelector('.toggle-interface');
    const interfaceContainer = document.querySelector('.container-interface');

    if (toggleButton && interfaceContainer) {
        toggleButton.addEventListener('click', () => {
            interfaceContainer.classList.toggle('show');
        });
    }
}
