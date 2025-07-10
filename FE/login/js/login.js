import { showFailAlert, showSuccessAlert, showConfirmModal } from '/common/js/modal.js';
import { checkUsernameDuplicate } from '/hook/auth/postCheckUsername.js';

function toggleForms() {
    document.querySelector('.section-login').classList.toggle('hidden');
    const signupSection = document.querySelector('.section-signup');
    signupSection.classList.toggle('hidden');
    
    // 초기에는 single 클래스 추가 (container-left-signup만 표시)
    if (!signupSection.classList.contains('hidden')) {
        signupSection.classList.add('single');
        signupSection.classList.remove('dual');
    }
}

function showRightSignup() {
    const rightSignup = document.querySelector('.container-right-signup');
    const signupSection = document.querySelector('.section-signup');
    
    rightSignup.classList.remove('hidden');
    document.querySelector('.next-btn').style.display = 'none';
    
    // dual 클래스로 변경 (두 컨테이너 모두 표시)
    signupSection.classList.remove('single');
    signupSection.classList.add('dual');
}

// Bio 글자 수 카운터 업데이트 함수
function updateCharCounter(currentLength) {
    const currentCountElement = document.querySelector('.current-count');
    const charCounterElement = document.querySelector('.char-counter');
    
    if (currentCountElement) {
        currentCountElement.textContent = currentLength;
    }
    
    if (charCounterElement) {
        const maxLength = 100;
        const percentage = (currentLength / maxLength) * 100;
        
        // 클래스 초기화
        charCounterElement.classList.remove('warning', 'danger');
        
        if (percentage >= 95) {
            charCounterElement.classList.add('danger');
        } else if (percentage >= 80) {
            charCounterElement.classList.add('warning');
        }
    }
}

// Tech Stack 체크박스 최대 3개 제한 함수
function initTechStackLimit() {
    const techStackCheckboxes = document.querySelectorAll('input[name="stack"]');
    const maxSelection = 3;
    
    techStackCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const checkedBoxes = document.querySelectorAll('input[name="stack"]:checked');
            
            if (checkedBoxes.length > maxSelection) {
                // 3개를 초과하면 현재 체크를 해제
                e.target.checked = false;
                
                // 사용자에게 알림 (선택사항)
                const stackMaxElement = document.querySelector('.stack-max');
                if (stackMaxElement) {
                    stackMaxElement.style.color = '#ff4444';
                    stackMaxElement.textContent = '최대 3개까지만 선택 가능합니다!';
                    
                    // 3초 후 원래 텍스트로 복원
                    setTimeout(() => {
                        stackMaxElement.style.color = '';
                        stackMaxElement.textContent = '최대 3개';
                    }, 3000);
                }
            } else {
                // 정상 선택 시 색상 초기화
                const stackMaxElement = document.querySelector('.stack-max');
                if (stackMaxElement) {
                    stackMaxElement.style.color = '';
                    stackMaxElement.textContent = '최대 3개';
                }
            }
            
            // 현재 선택된 개수 표시 (선택사항)
            updateTechStackCounter(checkedBoxes.length);
        });
    });
}

// Tech Stack 선택 개수 표시 함수 (선택사항)
function updateTechStackCounter(currentCount) {
    const stackMaxElement = document.querySelector('.stack-max');
    if (stackMaxElement && currentCount > 0) {
        stackMaxElement.textContent = `${currentCount}/3 선택됨`;
    } else if (stackMaxElement) {
        stackMaxElement.textContent = '최대 3개';
    }
}

// 프로필 이미지 미리보기 처리 함수
function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    const profilePreview = document.getElementById('profile-preview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            profilePreview.src = e.target.result;
            profilePreview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    } else if (file) {
        showFailAlert('이미지 파일만 업로드 가능합니다.');
        event.target.value = ''; // 파일 선택 초기화
    }
}

// Bio textarea 실시간 글자 수 카운팅
document.addEventListener('DOMContentLoaded', () => {
    const bioTextarea = document.querySelector('textarea[name="bio"]');
    if (bioTextarea) {
        // 초기화 함수가 모든 이벤트를 등록
        function initBioCharCounter() {
            // 초기 글자수 설정
            updateCharCounter(bioTextarea.value.length);
            
            // 다양한 이벤트 처리
            bioTextarea.addEventListener('input', (e) => {
                updateCharCounter(e.target.value.length);
            });
            bioTextarea.addEventListener('paste', (e) => {
                updateCharCounter(e.target.value.length);
            });
            bioTextarea.addEventListener('cut', (e) => {
                updateCharCounter(e.target.value.length);
            });
        }
        initBioCharCounter();
    }
    
    initTechStackLimit();

    // 아이디 중복확인 버튼 이벤트 리스너 등록
    const duplicateCheckBtn = document.querySelector('.id-check-btn');
    if (duplicateCheckBtn) {
        duplicateCheckBtn.addEventListener('click', handleUsernameDuplicateCheck);
    }

    // 프로필 이미지 업로드 이벤트 리스너 등록
    const profileUpload = document.getElementById('profile-upload');
    if (profileUpload) {
        profileUpload.addEventListener('change', handleProfileImageUpload);
    }
});

// 아이디 중복 확인 처리 함수
async function handleUsernameDuplicateCheck() {
    const usernameInput = document.querySelector('.id-input');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showFailAlert('아이디를 입력해주세요!');
        usernameInput.focus();
        return;
    }
    
    try {
        const result = await checkUsernameDuplicate(username);
        
        if (result.success) {
            if (result.data.is_duplicate) {
                showFailAlert(result.data.message);
                usernameInput.focus();
            } else {
                showSuccessAlert(result.data.message);
            }
        }
    } catch (error) {
        console.error('중복확인 처리 실패:', error);
        showFailAlert(error.message);
    }
}

window.toggleForms = toggleForms;
window.showRightSignup = showRightSignup;