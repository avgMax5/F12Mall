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

            loadCoins("all");
            loadCoins("surging");
            loadCoins("price");
        })
        .catch(err => console.error('HTML 조각 로딩 실패:', err));
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
    const cardView = document.querySelector('.box-grid-card');
    const listView = document.querySelector('.box-coin-list');

    if (viewCard && viewList && cardView && listView) {
        function toggleView() {
            const boxSort = document.querySelector('.box-sort');

            if (viewCard.checked) {
                cardView.style.display = 'grid';
                listView.style.display = 'none';
                if (boxSort) boxSort.style.display = 'block';
            } else if (viewList.checked) {
                cardView.style.display = 'none';
                listView.style.display = 'block';
                if (boxSort) boxSort.style.display = 'none';
            }

            loadCoins("all");
        }

        toggleView();
        viewCard.addEventListener('change', toggleView);
        viewList.addEventListener('change', toggleView);
    }
}