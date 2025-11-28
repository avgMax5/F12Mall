import { tradeCoinId } from '/trade/js/trade.js';
import { getCoinInfo } from '/hook/trade/getCoinInfo.js';
import { CONFIG } from '/config.js';

export let tradeUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 프로필 데이터 가져오기
    const profileData = await getCoinInfo(tradeCoinId);

    // DOM 요소 가져오기
    const profileImage = document.querySelector('.box-profile-image img');
    const coinName = document.querySelector('.coin-name');
    const userName = document.querySelector('.user-name');
    const coinBio = document.querySelector('.coin-bio');

    tradeUserId = profileData.creator_id;

    // 데이터 표시
    if (profileImage) {
      profileImage.src = profileData.image ? profileData.image : `${CONFIG.DEFAULT_PROFILE_IMG}`;
      profileImage.alt = `${profileData.user_name}의 프로필 이미지`;
    }

    if (coinName) {
      coinName.textContent = profileData.coin_name || '';
    }

    if (userName) {
      userName.textContent = profileData.user_name || '';
    }

    if (coinBio) {
      coinBio.innerHTML = (profileData.bio || '').replace(/\n/g, '<br>');
    }

  } catch (error) {
    console.error('프로필 데이터를 불러오는 중 오류가 발생했습니다:', error);
  }
});

