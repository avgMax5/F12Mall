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

let surgingOriginalParent = null;
let surgingOriginalNextSibling = null;

let carouselIndex = 0; // 전역 carousel index

// 모바일 체크 함수
function isMobile() {
    return window.innerWidth <= 767;
}

// Surging 제목 업데이트 함수
function updateSurgingTitle() {
    const surgingTitle = document.querySelector('.container-left .box-top-title, .carousel-surging-slide .box-top-title');
    if (surgingTitle) {
        const title = isMobile() ? 'Top 3 Surging' : 'Top 5 Surging';
        surgingTitle.textContent = title;
    }
}

// Carousel 제목 업데이트 함수
function updateCarouselTitle(slideIndex) {
    const titleElement = document.querySelector('.container-right .box-top-title');
    if (titleElement) {
        if (isMobile()) { 
            // 모바일: 3개 슬라이드 - Top 3 Coin, Top 3 Surging, Advertisement
            const titles = ['Top 3 Coin', 'Top 3 Surging', 'Advertisement'];
            titleElement.textContent = titles[slideIndex] || titles[0];
        } else {
            // 데스크탑: 3개 슬라이드 - Top 5 Coin, Empty Slide, Advertisement
            const titles = ['Top 5 Coin', 'Empty Slide', 'Advertisement'];
            titleElement.textContent = titles[slideIndex] || titles[0];
        }
    }
}

// Dot click handlers - 전역으로 이동
function updateDotClickHandlers() {
    const currentDots = document.querySelectorAll('.carousel-indicator .dot');
    currentDots.forEach((dot, i) => {
        // 기존 이벤트 리스너 제거를 위해 새 함수 생성
        dot.onclick = () => {
            carouselIndex = i; // 전역 index 업데이트
            const carousel = document.querySelector('.carousel-track');
            const currentDots = document.querySelectorAll('.carousel-indicator .dot');
            carousel.style.transition = 'transform 0.5s ease-in-out';
            carousel.style.transform = `translateX(-${100 * i}%)`;
            currentDots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === i);
            });
            
            // 제목 업데이트
            updateCarouselTitle(i);
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load sort/view toggle UI and handlers
    initSortAndeViewHandlers();

    // Load list header UI and sort handlers
    initListHeaderHandlers();

    // Carousel Slide
    const carousel = document.querySelector('.carousel-track');

    function goToSlide(i) {
        const currentDots = document.querySelectorAll('.carousel-indicator .dot');
        carousel.style.transition = 'transform 0.5s ease-in-out';
        carousel.style.transform = `translateX(-${100 * i}%)`;
        currentDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === i);
        });
        
        // 제목 업데이트
        updateCarouselTitle(i);
    }

    function resetToStart() {
        const currentDots = document.querySelectorAll('.carousel-indicator .dot');
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(0%)`;
        carouselIndex = 0;
        currentDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === 0);
        });
        
        // 제목 업데이트
        updateCarouselTitle(0);
    }

    function getCurrentSlideCount() {
        return carousel.children.length;
    }

    updateDotClickHandlers();

    setInterval(() => {
        const total = getCurrentSlideCount();
        carouselIndex++;

        if (carouselIndex < total) {
            goToSlide(carouselIndex);
        } else {
            goToSlide(carouselIndex);
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
    // DOM이 완전히 로드된 후 실행되도록 setTimeout 추가
    window.addEventListener('load', () => {
        setTimeout(() => {
            moveSurgingIfMobile();
            // 초기 제목 설정
            updateCarouselTitle(carouselIndex);
            updateSurgingTitle();
        }, 100); // 100ms 지연
    });
    
    // resize 이벤트는 debounce 적용
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            moveSurgingIfMobile();
            // 화면 크기 변경 시 제목 업데이트
            updateCarouselTitle(carouselIndex);
            updateSurgingTitle();
            // 코인 데이터 다시 렌더링 (개수 변경 반영)
            if (globalCoins.length > 0) {
                renderCoinsByFilter('all', globalCoins);
            }
        }, 200); // 200ms debounce
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

function moveSurgingIfMobile() {
    // surging 요소를 ID로 찾기 (가장 안전한 방법)
    let surgingContainer = document.getElementById('surging-container');
    
    // ID로 찾지 못한 경우 클래스로 대체 시도
    if (!surgingContainer) {
        surgingContainer = document.querySelector('.container-left'); // 데스크탑 상태
        if (!surgingContainer) {
            surgingContainer = document.querySelector('.carousel-surging-slide'); // 모바일 상태
        }
    }
    const carousel = document.querySelector('.carousel-track');
    const emptySlide = document.querySelector('.carousel-empty-slide');

    // null 체크 추가
    if (!surgingContainer) {
        return;
    }
    
    if (!carousel) {
        return;
    }

    if (surgingOriginalParent == null) {
        surgingOriginalParent = surgingContainer.parentElement;
        surgingOriginalNextSibling = surgingContainer.nextElementSibling;
    }

    if (isMobile()) {
        // 모바일: 빈 화면 슬라이드를 surging으로 교체
        if (!carousel.contains(surgingContainer) && emptySlide) {
            // surging container를 carousel slide로 변환
            surgingContainer.className = 'carousel-slide carousel-surging-slide';
            
            // 빈 화면 슬라이드를 surging으로 교체
            carousel.replaceChild(surgingContainer, emptySlide);
            
            // carousel을 중앙 슬라이드(surging)로 이동
            carousel.style.transform = 'translateX(-100%)';
            carouselIndex = 1; // 중앙 슬라이드 인덱스로 설정
            
            // dot 상태 업데이트 - 중앙(surging)을 활성화
            const dots = document.querySelectorAll('.carousel-indicator .dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === 1);
            });
            
            // dot 클릭 핸들러 업데이트
            updateDotClickHandlers();
            
            // 초기 제목 설정 (중앙 슬라이드)
            updateCarouselTitle(1);
        }
    } else {
        // 데스크탑: surging을 원래 위치로 복원하고 빈 화면 슬라이드 복원
        
        // 원래 클래스로 복원
        surgingContainer.className = 'container-left';
        
        // 강제 복원 - section-top에서 container-right 앞에 배치
        const sectionTop = document.querySelector('.section-top');
        const containerRight = document.querySelector('.container-right');
        
        if (!sectionTop) {
            return;
        }
        
        if (!containerRight) {
            return;
        }
        
        // surgingContainer가 이미 section-top에 있는지 확인
        if (!sectionTop.contains(surgingContainer)) {
            sectionTop.insertBefore(surgingContainer, containerRight);
        } else {
            // 위치가 올바른지 확인하고 필요시 이동
            if (surgingContainer.nextElementSibling !== containerRight) {
                sectionTop.insertBefore(surgingContainer, containerRight);
            }
        }
        
        // carousel에서 surgingContainer 제거 (있다면)
        if (carousel.contains(surgingContainer)) {
            // 빈 화면 슬라이드를 다시 생성하여 중간 위치에 삽입
            const newEmptySlide = document.createElement('div');
            newEmptySlide.className = 'carousel-slide carousel-empty-slide';
            
            // surging을 빈 화면으로 교체
            carousel.replaceChild(newEmptySlide, surgingContainer);
        } else {
            // 빈 화면 슬라이드가 없다면 추가
            const existingEmptySlide = carousel.querySelector('.carousel-empty-slide');
            if (!existingEmptySlide) {
                const newEmptySlide = document.createElement('div');
                newEmptySlide.className = 'carousel-slide carousel-empty-slide';
                
                const bannerSlide = carousel.querySelector('.carousel-banner');
                if (bannerSlide) {
                    carousel.insertBefore(newEmptySlide, bannerSlide);
                }
            }
        }
        
        // carousel 첫 번째 슬라이드로 리셋
        carousel.style.transform = 'translateX(0%)';
        carouselIndex = 0;
        
        // dot 상태 업데이트
        const dots = document.querySelectorAll('.carousel-indicator .dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === 0);
        });
        
        // dot 클릭 핸들러 업데이트
        updateDotClickHandlers();
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
        const upOrDown = coin.fluctuation_rate > 0 ? 'up' : (coin.fluctuation_rate < 0 ? 'down' : '');

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
                <span class="entry-change ${upOrDown}">${Math.abs(coin.fluctuation_rate.toFixed(2))}%</span>
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
        const upOrDown = coin.fluctuation_rate > 0 ? 'up' : (coin.fluctuation_rate < 0 ? 'down' : '');

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
                        ${Math.abs(coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 }))}
                        <span class="change-percent">(${Math.abs(coin.fluctuation_rate.toFixed(2))}%)</span>
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
        const upOrDown = coin.fluctuation_rate > 0 ? 'up' : (coin.fluctuation_rate < 0 ? 'down' : '');

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
                        <span class="change-amount">${Math.abs(coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 }))}</span>
                        <span class="change-percent">(${Math.abs(coin.fluctuation_rate.toFixed(2))}%)</span>
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
        const upOrDown = coin.fluctuation_rate > 0 ? 'up' : (coin.fluctuation_rate < 0 ? 'down' : '');

        table.className = className;
        table.dataset.coinId = `${coin.coin_id}`;
        table.innerHTML =
            `<div class="col col-coin">${coin.coin_name}</div>
            <div class="col col-name">${coin.user_name}</div>
            <div class="col col-price">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div class="col col-diff ${upOrDown}">${Math.abs(coin.change_price.toLocaleString(undefined, { maximumFractionDigits: 0 }))}</div>
            <div class="col col-rate ${upOrDown}">${Math.abs(coin.fluctuation_rate).toFixed(2)}%</div>
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
