import {
    setSortKey,
    loadCoins,
    renderCoinsByFilter,
    getCurrentFilteredCoins,
    getGlobalCoins
} from '/main/js/main.js';

export function initSortAndeViewHandlers() {
    const wrapper = document.getElementById('sort-view-wrapper');
    if (!wrapper) return;

    fetch('/main/component/coin-sort-view.html')
        .then(res => res.text())
        .then(html => {
            wrapper.innerHTML = html;

            initSortAndViewToggle();
            initMobileViewToggle();

            loadCoins("all");
            loadCoins("surging");
            loadCoins("price");
        })
        .catch(err => console.error('HTML 조각 로딩 실패:', err));
}

function toggleView(isCardView) {
    const cardView = document.querySelector('.box-grid-card');
    const listView = document.querySelector('.box-coin-list');
    const boxSort = document.querySelector('.box-sort');

    console.log('toggleView called:', isCardView, 'cardView:', cardView, 'listView:', listView);
    console.log('listView current display:', listView ? window.getComputedStyle(listView).display : 'null');

    if (cardView && listView) {
        if (isCardView) {
            cardView.style.display = 'grid';
            listView.style.display = 'none';
            if (boxSort) boxSort.style.display = 'block';

            // 모바일 뷰 토글 버튼 상태 업데이트
            document.querySelectorAll('.mobile-sort-view > div').forEach(div => {
                div.classList.toggle('active', div.classList.contains('card-view'));
            });
            // 데스크톱 라디오 버튼 상태 업데이트
            const viewCard = document.getElementById('view-card');
            if (viewCard) viewCard.checked = true;
        } else {
            cardView.style.display = 'none';
            listView.style.display = 'flex';
            if (boxSort) boxSort.style.display = 'none';

            console.log('List view activated - listView display set to:', listView.style.display);
            console.log('List view computed display:', window.getComputedStyle(listView).display);

            // 모바일 뷰 토글 버튼 상태 업데이트
            document.querySelectorAll('.mobile-sort-view > div').forEach(div => {
                div.classList.toggle('active', div.classList.contains('list-view'));
            });
            // 데스크톱 라디오 버튼 상태 업데이트
            const viewList = document.getElementById('view-list');
            if (viewList) viewList.checked = true;
        }

        loadCoins("all");
    }
}

function initMobileViewToggle() {
    const mobileViewButtons = document.querySelectorAll('.mobile-sort-view > div');
    
    mobileViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isCardView = button.classList.contains('card-view');
            toggleView(isCardView);
        });
    });
}

function initSortAndViewToggle() {
    // Sort Dropdown
    const sortToggle = document.querySelector('.sort-toggle');
    const sortMenu = document.querySelector('.sort-menu');
    const sortOptions = document.querySelectorAll('.sort-option');
    const sortLabel = document.querySelector('.sort-label');

    if (sortToggle && sortMenu && sortLabel) {
        sortToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sortMenu.classList.toggle('active');
        });

        sortOptions.forEach(option => {
            option.addEventListener('click', function () {
                sortOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                sortLabel.textContent = this.textContent;
                sortMenu.classList.remove('active');

                const text = this.textContent.trim();
                let key;

                switch (text) {
                    case '최신순': key = 'createdAt'; break;
                    case '금액순': key = 'price'; break;
                    case '거래순': key = 'volume'; break;
                    case '변동가 상승순': key = 'change'; break;
                    case '등락률 상승순': key = 'rate'; break;
                    default: key = 'createdAt'; break;
                }

                setSortKey(key);

                const isCard = document.getElementById('view-card')?.checked;
                if (isCard) {
                    renderCoinsByFilter('all', getCurrentFilteredCoins() || getGlobalCoins());
                    // loadCoins('all');
                }
            });
        });

        document.addEventListener('click', function () {
            sortMenu.classList.remove('active');
        });
    }

    // View Radio
    const viewCard = document.getElementById('view-card');
    const viewList = document.getElementById('view-list');

    if (viewCard && viewList) {
        // 초기 상태 설정
        toggleView(viewCard.checked);

        // 이벤트 리스너 설정
        viewCard.addEventListener('change', () => toggleView(true));
        viewList.addEventListener('change', () => toggleView(false));
    }
}