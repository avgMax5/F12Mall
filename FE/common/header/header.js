import { getMyProfile } from '/hook/user/getMyProfile.js';
import { getUserCoins } from '/hook/user/getUserCoins.js';

async function updateHeaderInfo() {
  try {
    const user = await getMyProfile();
    const coins = await getUserCoins();

    // 총 자산 계산 및 표시
    let currentCoinAmount = 0;
    coins.forEach(element => {
      currentCoinAmount += element.current_buy_amount;
    });
    const totalAssets = currentCoinAmount + user.money;

    const totalAssetsElement = document.querySelector(".total-assets");
    if (totalAssetsElement) {
      totalAssetsElement.textContent = totalAssets.toLocaleString('ko-KR');
    }

    // 페이지별 메뉴 텍스트 변경
    updateMenuText();
  } catch (error) {
    console.error('헤더 정보 업데이트 중 오류 발생:', error);
  }
}

function updateMenuText() {
  // DOM이 완전히 로드될 때까지 약간 기다림
  setTimeout(() => {
    const mypageElement = document.querySelector(".mymenu");
    if (mypageElement) {
      // 현재 페이지가 mypage인지 확인
      const currentPath = window.location.pathname;
      if (currentPath === '/mypage' || currentPath.includes('mypage')) {
        mypageElement.textContent = '내 정보 수정';
      } else {
        mypageElement.textContent = '마이메뉴';
      }
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  const includeTarget = document.querySelector("#include-header");

  if (includeTarget) {
    fetch("/common/header/header.html")
      .then((res) => res.text())
      .then((data) => {
        includeTarget.innerHTML = data;

        // MutationObserver를 사용해서 DOM이 완전히 로드된 후 이벤트 처리
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              const profileImg = document.getElementById("header-profile-img");
              const boxMenu = document.getElementById("header-box-menu");

              if (profileImg && boxMenu) {
                // 헤더 정보 업데이트
                updateHeaderInfo();

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

                updateMenuText();

                observer.disconnect();
              }
            }
          });
        });

        observer.observe(includeTarget, {
          childList: true,
          subtree: true
        });

        const profileImg = document.getElementById("header-profile-img");
        const boxMenu = document.getElementById("header-box-menu");

        if (profileImg && boxMenu) {
          updateHeaderInfo();

          profileImg.addEventListener("click", handleProfileClick);
          document.addEventListener("click", handleDocumentClick);

          const mypageElement = document.querySelector(".mymenu");
          if (mypageElement) {
            mypageElement.addEventListener("click", handleMypageClick);
          }

          updateMenuText();
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
  const boxMenu = document.getElementById("header-box-menu");
  if (boxMenu) {
    boxMenu.classList.toggle("hidden");
  }
}

function handleDocumentClick(event) {
  const profileImg = document.getElementById("header-profile-img");
  const boxMenu = document.getElementById("header-box-menu");

  if (profileImg && boxMenu && !profileImg.contains(event.target) && !boxMenu.contains(event.target)) {
    boxMenu.classList.add("hidden");
  }
}

async function handleMypageClick() {
  const currentPath = window.location.pathname;
  
  // mypage에 있을 때는 /edit으로, 다른 페이지에서는 /mypage로 이동
  if (currentPath === '/mypage' || currentPath.includes('mypage')) {
    try {
      // 현재 사용자 정보를 가져와서 userId를 URL 파라미터로 전달
      const user = await getMyProfile();
      window.location.href = "/edit";
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      // 실패 시 userId 없이 이동
      window.location.href = "/mypage";
    }
  } else {
    window.location.href = "/mypage";
  }
}
