import { tradeCoinId } from '/trade/js/trade.js';
import { getCoinRealtime } from '/hook/trade/getCoinRealtime.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const evtSource = getCoinRealtime(tradeCoinId);

        evtSource.addEventListener('coininfo', function(event) {
            const coinInfo = JSON.parse(event.data);
            updateCoinInfo(coinInfo);
        });

        window.addEventListener('beforeunload', () => {
            evtSource.close();
        });

    } catch (error) {
        console.error('코인 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
});

// 코인 정보 업데이트 함수
function updateCoinInfo(coinInfo) {
    const currentPriceElement = document.getElementById('current-price');
    const dailyChangeElement = document.getElementById('daily-change');
    const fluctuationRateElement = document.getElementById('fluctuation-rate');
    const priceDirectionElement = document.querySelector('.price-direction');
    const boxPriceChange = document.querySelector('.box-price-change');

    // 현재 가격 업데이트
    currentPriceElement.textContent = formatNumberWithCommas(parseInt(coinInfo.current_price));

    // 일일 변동가 계산 및 업데이트
    const dailyChange = coinInfo.change_price;
    dailyChangeElement.textContent = formatNumberWithCommas(parseInt(dailyChange));

    // 등락률 업데이트
    fluctuationRateElement.textContent = `${coinInfo.fluctuation_rate.toFixed(2)}%`;

    // 가격 변동에 따른 상태 설정
    if (dailyChange > 0) {
        boxPriceChange.classList.remove('down');
        boxPriceChange.classList.add('up');
        priceDirectionElement.innerHTML = '▲';
    } else if (dailyChange < 0) {
        boxPriceChange.classList.remove('up');
        boxPriceChange.classList.add('down');
        priceDirectionElement.innerHTML = '▼';
    }
}

// 세자리 수 단위로 쉼표를 찍는 함수
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}