import { CONFIG } from '/config.js';

export function getCoinRealtime(coinId) {
    const evtSource = new EventSource(`${CONFIG.API_BASE_URL}/coins/${coinId}/realtime`);
    
    evtSource.onopen = () => {
        console.log('SSE 연결 성공');
    };

    evtSource.addEventListener('coininfo', function(event) {
        const coinInfo = JSON.parse(event.data);
        console.log(coinInfo);
    });

    evtSource.onerror = function(err) {
        console.error('SSE 연결 에러:', err);
    };

    return evtSource;
}