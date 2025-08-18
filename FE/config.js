const ENV = 'DEV';
//const ENV = 'STAG';
//const ENV = 'PROD';

export const CONFIG = {
  ENV,
  ...{
    DEV: {
       API_BASE_URL: 'http://localhost:8080/api',
      //API_BASE_URL: 'http://avgmax.dustbox.kr/api',
      DEFAULT_PROFILE_IMG: '/assets/images/common/headerImg.png'
    },
    STAG: {
      API_BASE_URL: 'https://f12mall-dev.avgmax.team/api',
      DEFAULT_PROFILE_IMG: '/assets/images/common/headerImg.png'
    },
    PROD: {
      API_BASE_URL: 'https://f12mall.avgmax.team/api',
      DEFAULT_PROFILE_IMG: '/assets/images/common/headerImg.png'
    },
  }[ENV],
};