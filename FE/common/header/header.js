// import { CONFIG } from '../config.js';

document.addEventListener("DOMContentLoaded", () => {

  const includeTarget = document.querySelector("#include-header");

  if (includeTarget) {
    fetch("../common/header/header.html")
      .then((res) => res.text())
      .then((data) => {
        includeTarget.innerHTML = data;

        // MutationObserver를 사용해서 DOM이 완전히 로드된 후 이벤트 처리
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              const profileImg = document.getElementById("profile-img");
              const boxMenu = document.getElementById("box-menu");

              if (profileImg && boxMenu) {

                // 기존 이벤트 리스너 제거 (중복 방지)
                profileImg.removeEventListener("click", handleProfileClick);
                document.removeEventListener("click", handleDocumentClick);

                // 새로운 이벤트 리스너 추가
                profileImg.addEventListener("click", handleProfileClick);
                document.addEventListener("click", handleDocumentClick);

                const mypageElement = document.querySelector(".mymenu");
                if (mypageElement) {
                  mypageElement.removeEventListener("click", handleMypageClick);
                  mypageElement.addEventListener("click", handleMypageClick);
                }

                // observer 중지 (한 번만 실행)
                observer.disconnect();
              }
            }
          });
        });

        // DOM 변화 감지 시작
        observer.observe(includeTarget, {
          childList: true,
          subtree: true
        });

        // 즉시 한 번 실행 (이미 로드된 경우)
        const profileImg = document.getElementById("profile-img");
        const boxMenu = document.getElementById("box-menu");

        if (profileImg && boxMenu) {

          profileImg.addEventListener("click", handleProfileClick);
          document.addEventListener("click", handleDocumentClick);

          const mypageElement = document.querySelector(".mymenu");
          if (mypageElement) {
            mypageElement.addEventListener("click", handleMypageClick);
          }
        }
      });
  }
});

function handleLogoClick(e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/main";
}

function handleProfileClick(e) {
  e.preventDefault();
  e.stopPropagation();
  const boxMenu = document.getElementById("box-menu");
  if (boxMenu) {
    boxMenu.classList.toggle("hidden");
  }
}

function handleDocumentClick(event) {
  const profileImg = document.getElementById("profile-img");
  const boxMenu = document.getElementById("box-menu");

  if (profileImg && boxMenu && !profileImg.contains(event.target) && !boxMenu.contains(event.target)) {
    boxMenu.classList.add("hidden");
  }
}

function handleMypageClick() {
  window.location.href = "/mypage";
}
