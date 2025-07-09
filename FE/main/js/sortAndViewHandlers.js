export function initSortAndeViewHandlers() {
  const wrapper = document.getElementById('sort-view-wrapper');
  if (!wrapper) return;

  fetch('/main/component/coin-sort-view.html')
    .then(res => res.text())
    .then(html => {
      wrapper.innerHTML = html;
      initSortAndViewToggle();
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
    }

    toggleView();
    viewCard.addEventListener('change', toggleView);
    viewList.addEventListener('change', toggleView);
  }
}
