import { getAllCoins } from '/hook/trade/getAllCoins.js';
import { initSortAndeViewHandlers } from '/main/js/sortAndViewHandlers.js';
import { initListHeaerHandlers } from '/main/js/listHeaderHandlers.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderCoinList();
  initSortAndeViewHandlers();
  initListHeaerHandlers();

  // Carousel Slide
  const carousel = document.querySelector('.carousel-track');
  const slides = Array.from(carousel.children);
  const dots = document.querySelectorAll('.carousel-indicator .dot');

  let index = 0;
  const total = slides.length;

  function goToSlide(i) {
    carousel.style.transition = 'transform 0.5s ease-in-out';
    carousel.style.transform = `translateX(-${100 * i}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === i);
    });
  }

  function resetToStart() {
    carousel.style.transition = 'none';
    carousel.style.transform = `translateX(0%)`;
    index = 0;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === 0);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      index = i;
      goToSlide(index);
    });
  });

  setInterval(() => {
    index++;

    if (index < total) {
      goToSlide(index);
    } else {
      goToSlide(index);
      setTimeout(resetToStart, 510);
    }
  }, 8000);
});

async function renderCoinList() {
  const coinData = await getAllCoins();
  const container = document.getElementById('card-viewer');
  container.innerHTML = '';

  if (!coinData || coinData.length === 0) {
    container.innerHTML =
      "<div style='text-align: center; font-family: 'KIMM_B'; font-size: 24px; font-weight: 700; color: #00FF2F;'>코인이 없습니다.</div>";
    return;
  }

  coinData.forEach((coin, idx) => {
    container.innerHTML += createCoinElement(coin, idx);
  });

  attachJoinEvents();
}

function createCoinElement(coin, idx) {
  return `
    <div class="card-view" data-coin-id="${coin.coin_id}">
        <div class="card-profile">
            <div class="card-thumbnail">
                <img src="${coin.profile_image}" alt="카드 ${idx}번 이미지">
            </div>
            <div class="card-info">
                <div class="info-meta">
                    <div class="info-coin-name">${coin.coin_name}</div>
                    <div class="info-author">${coin.user_name}</div>
                </div>
                <div class="info-change up">
                    <span class="change-amount">${coin.change_price}</span>
                    <span class="change-percent">(${coin.fluctuation_rate}%)</span>
                </div>
            </div>
        </div>
        <div class="card-price">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle class="icon-circle" cx="12" cy="12" r="12" fill="#00FF2F" />
                <text x="12" y="16" text-anchor="middle">₩</text>
            </svg>
            <span class="price-amount">${coin.current_price}</span>
        </div>
    </div>
  `;
}

// 각 코인 별 클릭 시 /trade?coinId={coinId} 엔드포인트로 리다이렉트 시켜주는 기능을 추가해줌
function attachJoinEvents() {
  const cardView = document.querySelectorAll('.card-view');
  cardView.forEach(btn => {
    btn.addEventListener('click', () => {
      const coinId = btn.getAttribute('data-coin-id');
      window.location.href = `/trade?coinId=${coinId}`;
    });
  });
}
