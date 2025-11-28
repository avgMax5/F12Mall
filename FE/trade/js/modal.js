import { initModalContent } from '/common/modal/detail-modal.js';
import { tradeUserId } from '/trade/js/profile.js';

window.setModal = async function () {
  await loadModalAndInit();
};

async function loadModalAndInit() {
  const includeTarget = document.querySelector('#include-detail-modal');

  try {
    fetch('../common/modal/detail-modal.html')
      .then(res => res.text())
      .then(data => {
        includeTarget.innerHTML = data;
      });
    includeTarget.style.display = 'flex';
    await initModalContent(tradeUserId);
  } catch (err) {
    console.error('모달 로딩 실패:', err);
  }
}

window.closeModal = () => {
  document.getElementById('include-detail-modal').style.display = 'none';
};
