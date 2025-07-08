import { getUserInform } from '/hook/user/getProfile.js';
import { getUserCoins } from '/hook/user/getUserCoins.js';
import { renderPieChart } from '/mypage/js/chart.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    //user정보 담기
    const user = await getMyProfile();
    renderUserProfile(user);

    //보유 코인 목록 가져오기
    const coins = await getUserCoins();
    console.log(coins);
    renderCoinList(coins);
    calculateCoin(coins, user.money);

    //코인 비율 계산
    //calculateRatio(coins);

    //나의 코인 보유 개수 가져오기
    const quantity = await fetchMyQuantity(coins, user.userId);
    renderPieChart(quantity);
  } catch (error) {
    console.log(error);
    document.body.innerHTML = '<p>사용자 정보를 불러오는 데 실패했습니다.</p>';
  }
});

function renderUserProfile(user) {
  console.log(user);
  document.querySelector('#name').textContent = user.name;
  document.querySelector('#email').textContent = user.email;
  document.querySelector('#coin-name').textContent = user.username;
  document.querySelector('#image').style.backgroundImage = `url(${user.image})`;
  document.querySelector('#money').textContent =
    user.money.toLocaleString('ko-KR');
  document.querySelector('#position').textContent = user.position;
  document.querySelector('#bio').textContent = user.bio;

  //stack element 넣어주기
  const stackContainer = document.querySelector('#stack-container');
  user.stack.forEach(stackElement => {
    const div = document.createElement('div');
    div.className = 'stack';
    div.textContent = stackElement;

    stackContainer.appendChild(div);
  });

  //링크에 맞는 이미지 매칭
  const iconMap = {
    github: '/assets/images/common/github.png',
    blog: '/assets/images/common//velog.png',
    sns: '/assets/images/common/instagram.png',
    linkedin: '/assets/images/common/linkedin.png',
  };

  const linkContainer = document.querySelector('#link-container');
  Object.entries(user.link).forEach(([platform, url]) => {
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';

    const img = document.createElement('img');
    img.className = 'link';
    img.src = iconMap[platform];
    img.alt = platform;

    a.appendChild(img);
    linkContainer.appendChild(a);
  });
}

function renderCoinList(coins) {
  const coinList = document.querySelector('.coin-list');

  fetch('/mypage/component/coin.html')
    .then(res => res.text())
    .then(template => {
      coins.forEach(coinData => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;

        const coin = wrapper.querySelector('.coin');
        const defaultImage = '/assets/images/main/avgMax.png';

        // class로 접근하여 데이터 주입
        coin.querySelector('#coin-name').textContent = coinData.coin_name;
        coin.querySelector('#creator-name').textContent = coinData.creator_name;
        coin.querySelector('#creator-image').style.backgroundImage = `url(${
          coinData.creator_image || defaultImage
        })`;
        coin.querySelector('#hold-quantity').textContent =
          coinData.hold_quantity;
        coin.querySelector('#current-buy-amount').textContent =
          coinData.current_buy_amount.toLocaleString('ko-KR');
        coin.querySelector('#sellable-quantity').textContent =
          coinData.sellable_quantity;
        coin.querySelector('#buy-price').textContent =
          coinData.buy_price.toLocaleString('ko-KR');
        coin.querySelector('#total-buy-amount').textContent =
          coinData.total_buy_amount.toLocaleString('ko-KR');
        coin.querySelector('#current-price').textContent =
          coinData.current_price.toLocaleString('ko-KR');
        coin.querySelector('#valuation-rate').textContent =
          coinData.valuation_rate;

        coinList.appendChild(coin);
      });
    });
}

function calculateCoin(coins, userMoney) {
  let currentCoinAmount = 0;
  let totalCoinAmount = 0;
  let totalCoins = 0;

  coins.forEach(element => {
    totalCoins += element.hold_quantity;
    currentCoinAmount += element.current_buy_amount;
    totalCoinAmount += element.total_buy_amount;
  });

  const subtractAmount = currentCoinAmount - totalCoinAmount;
  const valuationRate = (subtractAmount / currentCoinAmount) * 100;
  const roundedRate = Math.round(valuationRate * 10) / 10;

  const totalMoneyContainer = document.querySelector('.total-money-container');
  totalMoneyContainer.querySelector('#current-coin-amount').textContent =
    currentCoinAmount.toLocaleString('ko-KR');
  totalMoneyContainer.querySelector('#total-coin-amount').textContent =
    totalCoinAmount.toLocaleString('ko-KR');
  totalMoneyContainer.querySelector('#total-amount').textContent = (
    currentCoinAmount + userMoney
  ).toLocaleString('ko-KR');

  const rateDisplay = `${roundedRate}%`;
  const subtractAmountElemt =
    totalMoneyContainer.querySelector('#subtract-amount');
  subtractAmountElemt.textContent =
    subtractAmount.toLocaleString('ko-KR') + ` (${rateDisplay})`;

  const totalInfo = document.querySelector('.total-info');
  totalInfo.querySelector('#total-coins').textContent = totalCoins;
  totalInfo.querySelector('#total-coin-price').textContent =
    currentCoinAmount.toLocaleString('ko-KR');
}

function calculateRatio(coins) {
  let totalCoins = 0;

  coins.forEach(element => {
    totalCoins += element.hold_quantity;
  });
}

function fetchMyQuantity(coins, userId) {
  const myCoin = coins.find(coin => coin.creator_id === userId);
  console.log('myCoin:', myCoin);

  coins.forEach(coin => {
    console.log(
      'coin.creator_id:',
      coin.creator_id,
      '| userId:',
      userId,
      '| equal:',
      coin.creator_id === userId
    );
  });

  const quantity = myCoin ? myCoin.hold_quantity : 0;

  document.querySelector('#my-coin-quantity').textContent = quantity;

  return quantity;
}
