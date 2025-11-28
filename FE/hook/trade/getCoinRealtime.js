import { CONFIG } from '/config.js';

export function getCoinRealtime(coinId, { onCoinInfo, onOrderBook, onError } = {}) {
    if (!coinId) {
        throw new Error('코인 ID가 필요합니다.');
    }

    const evtSource = new EventSource(`${CONFIG.API_BASE_URL}/coins/${coinId}/realtime`, {
        withCredentials: true
    });

    evtSource.onopen = () => {
        console.log('SSE 연결 성공: 코인 실시간 정보');
    };

    evtSource.addEventListener('coininfo', (event) => {
        try {
            const data = JSON.parse(event.data);
            onCoinInfo?.(data);
        } catch (error) {
            console.error('coininfo 파싱 오류:', error);
        }
    });

    evtSource.addEventListener('orderbook', (event) => {
        try {
            const data = JSON.parse(event.data);
            onOrderBook?.(data);
        } catch (error) {
            console.error('orderbook 파싱 오류:', error);
        }
    });

    evtSource.onerror = (err) => {
        console.error('SSE 연결 에러:', err);
        evtSource.close();
        onError?.(err);
    };

    return evtSource;
}