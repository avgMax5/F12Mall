import { getMyProfile } from '/hook/user/getMyProfile.js';
import { getUserCoins } from '/hook/user/getUserCoins.js';
import { renderPieChart } from '/mypage/js/chart.js';
import { CONFIG } from '/config.js';

export let mypageUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    //user정보 담기
    const user = await getMyProfile();
    renderUserProfile(user);

    mypageUserId = user.user_id;

    //보유 코인 목록 가져오기
    const coins = await getUserCoins();
    renderCoinList(coins);
    calculateCoin(coins, user.money);

    //코인 비율 계산
    calculateRatio(coins);

    //나의 코인 보유 개수 가져오기
    const quantity = await fetchMyQuantity(coins, user.user_id);
    renderPieChart(quantity);
  } catch (error) {
    console.log(error);
    document.body.innerHTML = '<p>사용자 정보를 불러오는 데 실패했습니다.</p>';
  }
});

function renderUserProfile(user) {
  document.querySelector('#name').textContent = user.name;
  document.querySelector('#email').textContent = user.email;
  document.querySelector('#coin-name').textContent = user.username;
  const profileImage = user.image
    ? user.image
    : `${CONFIG.DEFAULT_PROFILE_IMG}`;
  document.querySelector(
    '#image'
  ).style.backgroundImage = `url(${profileImage})`;
  document.querySelector('#money').textContent =
    user.money.toLocaleString('ko-KR');
  document.querySelector('#position').textContent = user.position;
  document.querySelector('#bio').innerHTML = (user.bio || '').replace(/\n/g, '<br>');

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
  console.log(coins);

  fetch('/mypage/component/coin.html')
    .then(res => res.text())
    .then(template => {
      coins.forEach(coinData => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;

        const coin = wrapper.querySelector('.coin');
        const resultContainer = coin.querySelector('.result-container');
        const defaultImage = `${CONFIG.DEFAULT_PROFILE_IMG}`;

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
        const valuationRateElem = coin.querySelector('#valuation-rate');

        // 기존 % span이 있으면 재사용, 없으면 새로 생성
        let percent = resultContainer.querySelector('span.percent-sign');
        if (!percent) {
          percent = document.createElement('span');
          percent.className = 'percent-sign';
          resultContainer.appendChild(percent);
        }
        percent.textContent = '%';

        if (valuationRateElem) {
          if (coinData.valuation_rate > 0) {
            valuationRateElem.style.color = '#e01200'; // 빨간색(수익)
            percent.style.color = '#e01200';
          } else if (coinData.valuation_rate < 0) {
            valuationRateElem.style.color = '#1376ee'; // 파란색(손실)
            percent.style.color = '#1376ee';
          }
        }

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
  // 색상 동적 적용
  if (subtractAmount > 0) {
    subtractAmountElemt.style.color = '#e01200'; // 빨간색(수익)
  } else if (subtractAmount < 0) {
    subtractAmountElemt.style.color = '#1376ee'; // 파란색(손실)
  } else {
    subtractAmountElemt.style.color = '#fff'; // 0일 때 흰색
  }

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

  // 각 코인에 비율 추가
  const coinsWithRatio = coins.map(coin => ({
    ...coin,
    ratio: totalCoins > 0 ? (coin.hold_quantity / totalCoins) * 100 : 0,
  }));

  // 비율 내림차순 정렬 후 상위 3개 추출
  const top3 = coinsWithRatio.sort((a, b) => b.ratio - a.ratio).slice(0, 3);

  // 나머지 코인 비율 합산
  const etcRatio = coinsWithRatio
    .slice(3)
    .reduce((sum, coin) => sum + coin.ratio, 0);

  // bar 렌더링
  const barContainer = document.querySelector('.bar-container');
  if (!barContainer) return;
  barContainer.innerHTML = '';
  top3.forEach((coin, idx) => {
    const bar = document.createElement('div');
    bar.className = `bar top${idx + 1}`;
    bar.style.width = `${coin.ratio}%`;
    barContainer.appendChild(bar);
  });
  if (etcRatio > 0) {
    const etcBar = document.createElement('div');
    etcBar.className = 'bar etc';
    etcBar.style.width = `${etcRatio}%`;
    barContainer.appendChild(etcBar);
  }

  // box-coins에 coin-element 추가
  const boxCoins = document.querySelector('.box-coins');
  if (!boxCoins) return;
  boxCoins.innerHTML = '';
  // top3 높은 순서대로 추가 (비동기 순서 보장)
  const top3Promises = top3.map((coin, idx) =>
    fetch('/mypage/component/coin-element.html')
      .then(res => res.text())
      .then(template => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;
        const container = wrapper.querySelector('.coin-container');
        container.classList.add(`top${idx + 1}`);
        container.querySelector('#username').textContent = coin.coin_name;
        container.querySelector('#ratio').textContent = coin.ratio.toFixed(1);
        // 원 색상도 bar와 맞추기
        const circle = container.querySelector('.circle');
        if (circle) {
          if (idx === 0) circle.style.backgroundColor = '#00450A';
          else if (idx === 1) circle.style.backgroundColor = '#008C1A';
          else if (idx === 2) circle.style.backgroundColor = '#00C943';
        }
        return container;
      })
  );
  Promise.all(top3Promises).then(containers => {
    containers.forEach(c => boxCoins.appendChild(c));
    // etc
    if (etcRatio > 0) {
      fetch('/mypage/component/coin-element.html')
        .then(res => res.text())
        .then(template => {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = template;
          const container = wrapper.querySelector('.coin-container');
          container.classList.add('etc');
          container.querySelector('#username').textContent = '기타';
          container.querySelector('#ratio').textContent = etcRatio.toFixed(1);
          const circle = container.querySelector('.circle');
          if (circle) circle.style.backgroundColor = '#B0B0B0';
          boxCoins.appendChild(container);
        });
    }
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
