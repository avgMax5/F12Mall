import { CONFIG } from '/config.js';

const API_CHART_URL = (coinId) => `${CONFIG.API_BASE_URL}/coins/${coinId}/chart`;

document.addEventListener('DOMContentLoaded', function() {
    window.getChartRows = getChartRows;
});

async function getChartRows(coinId) {
    try {
        const response = await fetch(API_CHART_URL(coinId), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(response.status);
            if (response.status === 401) {
                window.location.href = "/__unauthorized__";
            }
            
            const errorText = await response.text();
            throw new Error(`요청 실패: ${response.status} ${response.statusText} ${errorText}`);
        }

        const chartRows = await response.json();
        return chartRows;
    } catch (err) {
        console.error('차트 조회 실패:', err);
        return null;
    }
}