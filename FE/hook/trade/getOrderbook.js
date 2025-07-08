import { CONFIG } from '/config.js';

export function getOrderbook(coinId, callback) {
    if (!coinId) {
        throw new Error('코인 ID가 필요합니다.');
    }

    const evtSource = new EventSource(`${CONFIG.API_BASE_URL}/coins/${coinId}/orders/orderbook`, {
        withCredentials: true
    });

    evtSource.onopen = () => {
        console.log('SSE 연결 성공: 오더북');
    };

    evtSource.addEventListener('orderbook', function(event) {
        try {
            const data = JSON.parse(event.data);
            if (callback) callback(data);
        } catch (error) {
            console.error('오더북 데이터 파싱 중 오류:', error);
        }
    });

    evtSource.onerror = function(err) {
        console.error('SSE 연결 에러: 오더북', err);
        evtSource.close();
    };

    return evtSource;
}