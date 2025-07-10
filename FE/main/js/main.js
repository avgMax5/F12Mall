import { getAllCoins } from '/hook/trade/getAllCoins.js';
import { initSortAndeViewHandlers } from '/main/js/sortAndViewHandlers.js';
import { initListHeaderHandlers } from '/main/js/listHeaderHandlers.js';

let currentFilteredCoins = null;

export function setCurrentFilteredCoins(data) {
    currentFilteredCoins = data;
}
export function getCurrentFilteredCoins() {
    return currentFilteredCoins;
}

let globalCoins = [];

export function setGlobalCoins(data) {
    globalCoins = data;
}
export function getGlobalCoins() {
    return globalCoins;
}

let currentSortKey = 'createdAt';

export function setSortKey(key) {
    currentSortKey = key;
}

export function getSortKey() {
    return currentSortKey;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load sort/view toggle UI and handlers
    initSortAndeViewHandlers();

    // Load list header UI and sort handlers
    initListHeaderHandlers();

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

    // Click Banner
    const banner = document.querySelector('.carousel-banner');

    if (banner) {
        banner.addEventListener('click', () => {
            window.open('https://eggsinthetray.avgmax.team/eggsinthetray/login', '_blank');
        });
    }

    //Search
    const searchForms = document.querySelectorAll('.box-search');
    
    searchForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
    
            const keyword = this.querySelector('.search-input').value.trim().toLowerCase();
    
            if (keyword === '') {
                currentFilteredCoins = null;
                renderCoinsByFilter('all', globalCoins);
                return;
            }
    
            const filtered = globalCoins.filter(coin =>
                coin.coin_name.toLowerCase().includes(keyword) || coin.user_name.toLowerCase().includes(keyword)
            );
            currentFilteredCoins = filtered;
            renderCoinsByFilter('all', filtered);

            // 다른 검색창의 값도 동기화
            searchForms.forEach(otherForm => {
                if (otherForm !== this) {
                    otherForm.querySelector('.search-input').value = keyword;
                }
            });
        });

        // 검색창 초기화 시 동기화
        form.querySelector('.search-input').addEventListener('input', function(e) {
            const value = this.value;
            searchForms.forEach(otherForm => {
                if (otherForm !== this.form) {
                    otherForm.querySelector('.search-input').value = value;
                }
            });
        });
    });
});

// CoinFetchResponse Dto by filter
export async function loadCoins(filter = 'all') {
    try {
        const coins = await getAllCoins(filter);
        globalCoins = coins;
        renderCoinsByFilter(filter, coins);
    } catch {
        console.error('전체 코인 정보를 불러오는데 실패 했습니다.');
    }
}

export function renderCoinsByFilter(filter, coins) {
    switch (filter) {
        case 'surging':
            renderSurgingCoins(coins);
            break;
        case 'price':
            renderPriceCoins(coins);
            break;
        default:
            renderAllCoins(coins);
            break;
    }
}

function renderSurgingCoins(coins) {
    const className = 'surging-entry';
    const surgingList = document.querySelector('#surging');
    if (!surgingList) return;
    surgingList.innerHTML = '';

    coins.forEach((coin, idx) => {
        const entry = document.createElement('li');

        entry.className = `surging-entry rank-${idx + 1}`;
        entry.dataset.coinId = `${coin.coin_id}`;
        entry.innerHTML =
            `<div class="entry-left">
                <svg class="entry-trophy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                    <path
                        d="M552 64h-88V56c0-13.3-10.7-24-24-24H136c-13.3 0-24 10.7-24 24v8H24C10.7 64 0 74.7 0 88v56c0 67.4 50.6 122.8 115.2 127.7C144 319.5 198.1 366 264 375.5V432h-88c-13.3 0-24 10.7-24 24v32h272v-32c0-13.3-10.7-24-24-24h-88v-56.5c65.9-9.5 120-56 148.8-119.8C525.4 266.8 576 211.4 576 144V88c0-13.3-10.7-24-24-24zM48 144v-32h64v97.2C77.3 203.6 48 176.9 48 144zm480 0c0 32.9-29.3 59.6-64 65.2V112h64v32z" />
                </svg>
                <span class="entry-name">${coin.coin_name}</span>
            </div>
            <div class="entry-right">
                <span class="entry-change up">${coin.fluctuation_rate.toFixed(2)}%</span>
            </div>`;

        surgingList.appendChild(entry);
    });

    attachJoinEvents(className);
}

function renderPriceCoins(coins) {
    const className = 'cap-card';
    const carouselCards = document.querySelector('#price');
    if (!carouselCards) return;
    carouselCards.innerHTML = '';

    coins.forEach((coin) => {
        const card = document.createElement('div');
        const upOrDown = coin.change_price >= 0 ? 'up' : 'down';

        card.className = className;
        card.dataset.coinId = `${coin.coin_id}`;
        card.innerHTML =
            `<div class="card-top">
                <div class="card-label">
                    <span class="card-coin-name">${coin.coin_name}</span>
                    <span class="card-author">${coin.user_name}</span>
                </div>
            </div>
            <div class="card-bot">
                <div class="card-info">
                    <div class="card-role">${coin.position}</div>
                    <img src="${coin.image}" alt="${coin.user_name}님의 이미지">
                </div>
                <div class="card-price">
                    <div class="card-change ${upOrDown}">
                        ${coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span class="change-percent">(${coin.fluctuation_rate.toFixed(2)}%)</span>
                    </div>
                    <div class="price-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#00FF2F" />
                            <text x="12" y="16" text-anchor="middle">₩</text>
                        </svg>
                        <span class="price-amount">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>`;

        carouselCards.appendChild(card);
    });

    attachJoinEvents(className);
}

function renderAllCoins(coins) {
    const isCard = document.querySelector('#view-card').checked;

    if (isCard) {
        renderCardViewCoins(coins);
    } else {
        renderListViewCoins(coins);
    }
}

function renderCardViewCoins(coins) {
    const sortKey = getSortKey();

    coins.sort((a, b) => {
        switch (sortKey) {
            case 'price': return b.current_price - a.current_price;
            case 'volume': return b.trade_volume - a.trade_volume;
            case 'change': return b.change_price - a.change_price;
            case 'rate': return b.fluctuation_rate - a.fluctuation_rate;
            case 'createdAt':
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    const className = 'card-view';
    const cardContainer = document.querySelector('#card-viewer');
    if (!cardContainer) return;
    cardContainer.innerHTML = '';

    coins.forEach((coin, idx) => {
        const card = document.createElement('div');
        const upOrDown = coin.change_price >= 0 ? 'up' : 'down';

        card.className = className;
        card.dataset.coinId = `${coin.coin_id}`;
        card.innerHTML =
            `<div class="card-profile">
                <div class="card-thumbnail">
                    <img src="${coin.image}" alt="카드 ${idx}번 이미지">
                </div>
                <div class="card-info">
                    <div class="info-meta">
                        <div class="info-coin-name">${coin.coin_name}</div>
                        <div class="info-author">${coin.user_name}</div>
                    </div>
                    <div class="info-change ${upOrDown}">
                        <span class="change-amount">${coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span class="change-percent">(${coin.fluctuation_rate.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>
            <div class="card-price">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle class="icon-circle" cx="12" cy="12" r="12" fill="#00FF2F" />
                    <text x="12" y="16" text-anchor="middle">₩</text>
                </svg>
                <span class="price-amount">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>`;

        cardContainer.appendChild(card);
    });

    attachJoinEvents(className);
}

function renderListViewCoins(coins) {
    const className = 'table-row';
    const listContainer = document.querySelector('#list-viewer');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    coins.forEach((coin) => {
        const table = document.createElement('div');
        const upOrDown = coin.change_price >= 0 ? 'up' : 'down';

        table.className = className;
        table.dataset.coinId = `${coin.coin_id}`;
        table.innerHTML =
            `<div class="col col-coin">${coin.coin_name}</div>
            <div class="col col-name">${coin.user_name}</div>
            <div class="col col-price">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="col col-diff ${upOrDown}">${coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="col col-rate ${upOrDown}">${coin.fluctuation_rate.toFixed(2)}%</div>
            <div class="col col-volume">${coin.trade_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="col col-low">${coin.lowest_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="col col-high">${coin.highest_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>`;

        listContainer.appendChild(table);
    });

    attachJoinEvents(className);
}

// Navigate to /trade with coin ID on click
function attachJoinEvents(className) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => {
        element.addEventListener('click', () => {
            const coinId = element.dataset.coinId;
            if (!coinId) return;
            window.location.href = `/trade?coinId=${coinId}`;
        });
    });
}
