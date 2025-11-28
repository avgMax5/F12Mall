document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.coin-element').forEach(target => {
    fetch('/mypage/component/coin-element.html')
      .then(res => res.text())
      .then(data => {
        target.innerHTML = data;
      });
  });
});
