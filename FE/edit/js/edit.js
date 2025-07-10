import { getMyProfile } from '/hook/user/getMyProfile.js';
import { putEditProfile } from '/hook/user/putEditProfile.js';

export let editUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    const user = await getMyProfile();
    editUserId = user.user_id;
    
    // 사용자 정보로 폼 필드들 초기화
    initializeFormWithUserData(user);
    
    // Tech Stack 체크박스 제한 초기화
    initTechStackLimit();
    
    // Bio 글자수 카운터 초기화
    initBioCharCounter();
    
  } catch (error) {
    console.error('사용자 정보를 불러오는 데 실패했습니다:', error);
    alert('사용자 정보를 불러오는 데 실패했습니다.');
  }
});

// 저장하기 버튼 클릭 시 실행될 함수
window.handleSignup = async function() {
  try {
    if (!editUserId) {
      alert('사용자 정보를 불러오지 못했습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 폼 데이터 수집
    const formData = collectFormData();

    // API 호출
    const result = await putEditProfile(editUserId, formData);

    // 성공 메시지
    alert('프로필이 성공적으로 수정되었습니다!');
    

    window.location.href = '/mypage';
    
  } catch (error) {
    console.error('프로필 수정 중 오류 발생:', error);
    alert('프로필 수정에 실패했습니다. 다시 시도해주세요.');
  }
};

// 폼 데이터 수집 함수
function collectFormData() {
  const formData = {};

  // 기본 정보 (백엔드 UserProfileUpdateRequest에 맞춤)
  const username = document.querySelector('input[name="username"]')?.value?.trim();
  const email = document.querySelector('input[name="email"]')?.value?.trim();
  const name = document.querySelector('input[name="name"]')?.value?.trim();
  const position = document.querySelector('input[name="position"]')?.value?.trim();
  const bio = document.querySelector('textarea[name="bio"]')?.value?.trim();
  const password = document.querySelector('input[name="password"]')?.value?.trim();

  // 필수 필드들 (빈 문자열이라도 포함)
  formData.username = username || '';
  formData.email = email || '';
  formData.name = name || '';
  formData.position = position || '';
  formData.bio = bio || '';
  formData.image = ''; // 프로필 이미지는 별도 업로드로 처리
  formData.pwd = password || null; // 비밀번호가 없으면 null
  formData.resume = ''; // 이력서는 별도 업로드로 처리

  // 기술 스택 수집
  const checkedStacks = document.querySelectorAll('input[name="stack"]:checked');
  formData.stack = Array.from(checkedStacks).map(input => input.value);

  // 링크 정보 수집 (LinkData 객체 형태)
  const github = document.querySelector('input[name="github"]')?.value?.trim() || '';
  const blog = document.querySelector('input[name="blog"]')?.value?.trim() || '';
  const sns = document.querySelector('input[name="sns"]')?.value?.trim() || '';
  const linkedin = document.querySelector('input[name="linkedin"]')?.value?.trim() || '';

  formData.link = {
    github: github,
    blog: blog,
    sns: sns,
    linkedin: linkedin
  };

  // 교육 정보 수집 (EducationRequest 배열 형태 - snake_case)
  const schoolName = document.querySelector('.school-name')?.value?.trim();
  const major = document.querySelector('.major')?.value?.trim();
  const admissionDate = document.querySelector('.admission-date')?.value?.trim();
  const graduationDate = document.querySelector('.graduation-date')?.value?.trim();
  const educationStatus = document.querySelector('input[name="education-status"]:checked')?.id;

  formData.education = [];
  if (schoolName || major || admissionDate || graduationDate) {
    formData.education = [{
      school_name: schoolName || '',
      major: major || '',
      start_date: admissionDate || '',
      end_date: graduationDate || '',
      status: educationStatus?.toUpperCase() || 'ENROLLED',
      certificate_url: '' // 파일 업로드는 별도 처리
    }];
  }

  // 경력 정보 수집 (CareerRequest 배열 형태 - snake_case)
  const companyName = document.querySelector('.company-name')?.value?.trim();
  const job = document.querySelector('.job')?.value?.trim();
  const joinDate = document.querySelectorAll('.admission-date')[1]?.value?.trim();
  const leaveDate = document.querySelectorAll('.graduation-date')[1]?.value?.trim();
  const careerStatus = document.querySelector('input[name="career-status"]:checked')?.id;

  formData.career = [];
  if (companyName || job || joinDate || leaveDate) {
    formData.career = [{
      company_name: companyName || '',
      position: job || '',
      start_date: joinDate || '',
      end_date: leaveDate || '',
      status: careerStatus?.toUpperCase() || 'EMPLOYED',
      certificate_url: '' // 파일 업로드는 별도 처리
    }];
  }

  // 자격증 정보 (CertificationRequest 배열 형태)
  formData.certificateUrl = [];

  return formData;
}

function initializeFormWithUserData(user) {
  try {
    // 기본 정보 필드들 채우기
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput && user.username) {
      usernameInput.value = user.username;
    }

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput && user.email) {
      emailInput.value = user.email;
    }

    const nameInput = document.querySelector('input[name="name"]');
    if (nameInput && user.name) {
      nameInput.value = user.name;
    }

    const positionInput = document.querySelector('input[name="position"]');
    if (positionInput && user.position) {
      positionInput.value = user.position;
    }

    const bioTextarea = document.querySelector('textarea[name="bio"]');
    if (bioTextarea && user.bio) {
      bioTextarea.value = user.bio;
      // bio 글자 수 카운터 업데이트
      updateCharCounter(user.bio.length);
    }

    // 프로필 이미지 설정
    const profileElement = document.querySelector('.profile');
    if (profileElement && user.image) {
      profileElement.style.backgroundImage = `url(${user.image})`;
      profileElement.style.backgroundSize = 'cover';
      profileElement.style.backgroundPosition = 'center';
      profileElement.style.backgroundRepeat = 'no-repeat';
    }

    // 기술 스택 체크박스 설정 (최대 3개 제한)
    if (user.stack && Array.isArray(user.stack)) {
      const maxStack = 3;
      const stacksToCheck = user.stack.slice(0, maxStack); // 처음 3개만 사용
      
      stacksToCheck.forEach(stackItem => {
        const checkbox = document.querySelector(`input[name="stack"][value="${stackItem}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
      
      // 3개를 초과하는 경우 경고 메시지
      if (user.stack.length > maxStack) {
        const stackMaxElement = document.querySelector('.stack-max');
        if (stackMaxElement) {
          stackMaxElement.style.color = '#ffaa00';
          stackMaxElement.textContent = `${maxStack}개만 선택됨 (원래 ${user.stack.length}개)`;
          
          // 5초 후 원래 텍스트로 복원
          setTimeout(() => {
            stackMaxElement.style.color = '';
            stackMaxElement.textContent = '최대 3개';
          }, 5000);
        }
      }
    }

    // 링크 정보 설정
    if (user.link && typeof user.link === 'object') {
      Object.entries(user.link).forEach(([platform, url]) => {
        if (url) { // url이 있을 때만 설정
          const linkInput = document.querySelector(`input[name="${platform}"]`);
          if (linkInput) {
            linkInput.value = url;
          }
        }
      });
    }

    // 교육 정보 설정 (배열의 첫 번째 요소 사용)
    if (user.education && Array.isArray(user.education) && user.education.length > 0) {
      const education = user.education[0]; // 첫 번째 교육 정보 사용
      
      const schoolNameInput = document.querySelector('.school-name');
      if (schoolNameInput && education.school_name) {
        schoolNameInput.value = education.school_name;
      }

      const majorInput = document.querySelector('.major');
      if (majorInput && education.major) {
        majorInput.value = education.major;
      }

      const admissionDateInput = document.querySelector('.admission-date');
      if (admissionDateInput && education.start_date) {
        admissionDateInput.value = education.start_date;
      }

      const graduationDateInput = document.querySelector('.graduation-date');
      if (graduationDateInput && education.end_date) {
        graduationDateInput.value = education.end_date;
      }

      // 재학 상태 설정 (ENROLLED -> enrolled, GRADUATED -> graduated)
      if (education.status) {
        const statusValue = education.status.toLowerCase(); // 대문자를 소문자로 변환
        const statusRadio = document.querySelector(`input[name="education-status"]#${statusValue}`);
        if (statusRadio) {
          statusRadio.checked = true;
        }
      }
    }
    
    // 경력 정보 설정 (배열의 첫 번째 요소 사용)
    if (user.career && Array.isArray(user.career) && user.career.length > 0) {
      const career = user.career[0]; // 첫 번째 경력 정보 사용
      
      const companyNameInput = document.querySelector('.company-name');
      if (companyNameInput && career.company_name) {
        companyNameInput.value = career.company_name;
      }

      const jobInput = document.querySelector('.job');
      if (jobInput && career.position) {
        jobInput.value = career.position;
      }

      const careerAdmissionDates = document.querySelectorAll('.admission-date');
      if (careerAdmissionDates[1] && career.start_date) {
        careerAdmissionDates[1].value = career.start_date;
      }

      const careerGraduationDates = document.querySelectorAll('.graduation-date');
      if (careerGraduationDates[1] && career.end_date) {
        careerGraduationDates[1].value = career.end_date;
      }

      // 재직 상태 설정 (EMPLOYED -> employed, RESIGNED -> resigned)
      if (career.status) {
        const statusValue = career.status.toLowerCase(); // 대문자를 소문자로 변환
        const careerStatusRadio = document.querySelector(`input[name="career-status"]#${statusValue}`);
        if (careerStatusRadio) {
          careerStatusRadio.checked = true;
        }
      }
    }

  } catch (error) {
    console.error('폼 초기화 중 오류 발생:', error);
  }
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

// Bio textarea 글자수 카운터 초기화 함수
function initBioCharCounter() {
  const bioTextarea = document.querySelector('textarea[name="bio"]');
  if (!bioTextarea) return;
  
  // 초기 글자수 설정 (이미 initializeFormWithUserData에서 호출되지만 안전장치)
  updateCharCounter(bioTextarea.value.length);
  
  // input 이벤트 (타이핑, 붙여넣기, 삭제 등 모든 입력 변화)
  bioTextarea.addEventListener('input', (e) => {
    updateCharCounter(e.target.value.length);
  });
  
  // paste 이벤트 별도 처리 (더 정확한 카운팅을 위해)
  bioTextarea.addEventListener('paste', (e) => {
    setTimeout(() => {
      updateCharCounter(e.target.value.length);
    }, 0);
  });
  
  // cut 이벤트 처리
  bioTextarea.addEventListener('cut', (e) => {
    setTimeout(() => {
      updateCharCounter(e.target.value.length);
    }, 0);
  });
  
  // 프로그래밍적으로 값이 변경될 경우를 대비한 change 이벤트
  bioTextarea.addEventListener('change', (e) => {
    updateCharCounter(e.target.value.length);
  });
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
        
        // 사용자에게 알림
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
      
      // 현재 선택된 개수 표시
      updateTechStackCounter(checkedBoxes.length);
    });
  });
}

// Tech Stack 선택 개수 표시 함수
function updateTechStackCounter(currentCount) {
  const stackMaxElement = document.querySelector('.stack-max');
  if (stackMaxElement && currentCount > 0) {
    stackMaxElement.textContent = `${currentCount}/3 선택됨`;
  } else if (stackMaxElement) {
    stackMaxElement.textContent = '최대 3개';
  }
}

 