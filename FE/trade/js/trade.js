// 전역 변수로 coinId 선언
export let tradeCoinId = null;

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const coinId = params.get('coinId');

    if (!coinId) {
        window.location.href = '/main';
        return;
    }

    tradeCoinId = coinId;
    window.tradeCoinId = coinId; // 이전 코드와의 호환성을 위해 유지
});
