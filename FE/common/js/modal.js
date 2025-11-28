// 실패 모달 표시 함수
export const showFailAlert = (message = '오류가 발생했습니다.') => {
  if (document.querySelector('.fail-alert-modal')) return;
  
  fetch('/common/modal/fail-modal.html')
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      // 동적으로 메시지 업데이트
      const messageElement = wrapper.querySelector('.fail-alert-message');
      if (messageElement) {
        messageElement.textContent = message;
      }

      // 모달 fade-in 트리거
      const modal = wrapper.querySelector('.fail-alert-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%, -60%) scale(0.95)';
        void modal.offsetWidth;
        modal.style.transition = 'opacity 0.38s cubic-bezier(.4,1.4,.6,1), transform 0.38s cubic-bezier(.4,1.4,.6,1)';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    })
    .catch(err => {
      console.error('모달 로드 실패:', err);
      alert(message); // 폴백으로 기본 alert 사용
    });
};

// 성공 모달 표시 함수
export const showSuccessAlert = (message = '작업이 완료되었습니다.') => {
  if (document.querySelector('.success-alert-modal')) return;
  
  fetch('/common/modal/success-modal.html')
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      // 동적으로 메시지 업데이트
      const messageElement = wrapper.querySelector('.success-alert-message');
      if (messageElement) {
        messageElement.textContent = message;
      }

      // 모달 fade-in 트리거
      const modal = wrapper.querySelector('.success-alert-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%, -60%) scale(0.95)';
        void modal.offsetWidth;
        modal.style.transition = 'opacity 0.38s cubic-bezier(.4,1.4,.6,1), transform 0.38s cubic-bezier(.4,1.4,.6,1)';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    })
    .catch(err => {
      console.error('모달 로드 실패:', err);
      alert(message); // 폴백으로 기본 alert 사용
    });
};

// 확인 모달 표시 함수
export const showConfirmModal = (price, action = '매수', onConfirm = null, onCancel = null) => {
  if (document.querySelector('.confirm-modal')) return;
  
  fetch('/common/modal/confirm-modal.html')
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      // 동적으로 내용 업데이트
      const priceElement = wrapper.querySelector('.confirm-price');
      const messageElement = wrapper.querySelector('.confirm-message');
      const confirmButton = wrapper.querySelector('.confirm-btn-confirm');
      
      if (priceElement) priceElement.textContent = `${price}FIS`;
      if (messageElement) messageElement.textContent = `${action}하시겠습니까?`;
      if (confirmButton) confirmButton.textContent = `${action}하기`;

      // 버튼 이벤트 연결
      const cancelBtn = wrapper.querySelector('.confirm-btn-cancel');
      const confirmBtn = wrapper.querySelector('.confirm-btn-confirm');
      
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          if (onCancel) onCancel();
          wrapper.remove();
        };
      }
      
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          if (onConfirm) onConfirm();
          wrapper.remove();
        };
      }

      // 모달 fade-in 트리거
      const modal = wrapper.querySelector('.confirm-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'translate(-50%, -60%) scale(0.95)';
        void modal.offsetWidth;
        modal.style.transition = 'opacity 0.38s cubic-bezier(.4,1.4,.6,1), transform 0.38s cubic-bezier(.4,1.4,.6,1)';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
      }

      // 배경 클릭시 모달 닫기
      const backdrop = wrapper.querySelector('.confirm-modal-backdrop');
      if (backdrop) {
        backdrop.onclick = () => {
          if (onCancel) onCancel();
          wrapper.remove();
        };
      }
    })
    .catch(err => {
      console.error('모달 로드 실패:', err);
      alert('모달을 불러오는데 실패했습니다.');
    });
}; 