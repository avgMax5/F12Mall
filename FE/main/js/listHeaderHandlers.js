export function initListHeaderHandlers() {
  const wrapper = document.getElementById('table-header-wrapper');
  if (!wrapper) return;

  fetch('/main/component/coin-list-header.html')
    .then(res => res.text())
    .then(html => {
      wrapper.innerHTML = html;
      initListHeader();
    })
    .catch(err => console.error('HTML 조각 로딩 실패:', err));
}

function initListHeader() {
  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const key = header.dataset.key;
      const currentDirection = header.classList.contains('asc')
        ? 'asc'
        : header.classList.contains('desc')
          ? 'desc'
          : null;

      document
        .querySelectorAll('.sortable')
        .forEach(h => h.classList.remove('asc', 'desc'));

      let direction;
      if (currentDirection === 'desc') {
        header.classList.add('asc');
        direction = 'asc';
      } else {
        header.classList.add('desc');
        direction = 'desc';
      }

      sortTableBy(key, direction);
    });
  });
}

function sortTableBy(key, direction) {
  const rows = Array.from(document.querySelectorAll('.table-row'));

  const getValue = row => {
    const col = row.querySelector(`.col-${key}`);
    if (!col) return 0;

    let rawText = col.textContent.replace(/,/g, '').replace('%', '').trim();
    let value = parseFloat(rawText) || 0;

    if (col.classList.contains('down')) {
      value *= -1;
    }

    return value;
  };

  rows.sort((a, b) => {
    return direction === 'asc'
      ? getValue(a) - getValue(b)
      : getValue(b) - getValue(a);
  });

  const container = document.querySelector('.table-body');
  if (container) {
    rows.forEach(row => container.appendChild(row));
  }
}
