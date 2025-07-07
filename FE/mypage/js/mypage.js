import { getUserInform } from '/hook/user/getProfile.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    //user정보 담기
    const user = await getUserInform();
    renderUserProfile(user);
  } catch (error) {
    document.body.innerHTML = '<p>사용자 정보를 불러오는 데 실패했습니다.</p>';
  }
});

function renderUserProfile(user) {
  console.log(user);
  document.querySelector('#name').textContent = user.name;
  document.querySelector('#email').textContent = user.email;
  document.querySelector('#coin_id').textContent = user.username;
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
