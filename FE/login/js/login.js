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
