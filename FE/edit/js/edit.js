import { getMyProfile } from '/hook/user/getMyProfile.js';
import { putEditProfile } from '/hook/user/putEditProfile.js';
import { CONFIG } from '/config.js';

export let editUserId = null;
const API_UPLOAD_URL = `${CONFIG.API_BASE_URL}/users/upload`;

const MAX_FILE_SIZE_MB = 5; // 업로드 파일사이즈 5MB 제한 (1개당)
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; 

var user = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    user = await getMyProfile();
    editUserId = user.user_id;
    
    initializeFormWithUserData(user);
    initTechStackLimit();
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

    const formData = await collectFormData();
    const result = await putEditProfile(editUserId, formData);

    alert('프로필이 성공적으로 수정되었습니다!');
    
    window.location.href = '/mypage';
  } catch (error) {
    console.error('프로필 수정 중 오류 발생:', error);
    alert('프로필 수정에 실패했습니다. 다시 시도해주세요.');
  }
};

// 폼 데이터 수집 함수
async function collectFormData() {
  const profileFile = document.querySelector('#profile-upload')?.files[0] ?? null;
  const resumeFile = document.querySelector('#resume-upload')?.files[0] ?? null;
  const certificateUpload  = Array.from(document.querySelector('#certificate-upload')?.files ?? []);
  const educationCertUpload  = Array.from(document.querySelector('#education-cert-upload')?.files ?? []);
  const careerCertUpload = Array.from(document.querySelector('#career-cert-upload')?.files ?? []);

  const uploadResult = await uploadFiles(profileFile, resumeFile, certificateUpload, educationCertUpload, careerCertUpload);
  
  const username = document.querySelector('.id-input').value;
  const passwordInput = document.querySelector('.password-input');
  const email = document.querySelector('.email-input').value;
  const name = document.querySelector('.name-input').value;
  const position = document.querySelector('.position-input').value;
  const bio = document.querySelector('.bio-area').value;
  const github = document.querySelector('.github-input').value;
  const sns = document.querySelector('.sns-input').value;
  const blog = document.querySelector('.blog-input').value;
  const linkedin = document.querySelector('.linkedin-input').value;
  
  const stackCheckboxes = document.querySelectorAll('.tech-stack-item input[type="checkbox"]:checked');
  const stack = Array.from(stackCheckboxes).map(cb => cb.value);

  const education = collectEducationData(uploadResult);
  const career = collectCareerData(uploadResult);

  const modifiedUserData = {
    image: uploadResult?.profile?.[0] ?? `${user.image}`,
    username: username.trim() === '' ? `${user.username}` : username,
    pwd: passwordInput?.value.trim() ?? '',
    email: email.trim() === '' ? user.email : email,
    name: name.trim() === '' ? user.name : name,
    position: position.trim() === '' ? user.position : position,
    bio: bio.trim() === '' ? user.bio : bio,
    stack: stack.length > 0 ? stack : `${user.stack}`,
    resume: uploadResult?.resume?.[0] ?? `${user.resume}`,
    certificate_url: (uploadResult?.certification ?? []).map(certificate_url => ({ certificate_url })),
    link: {
      github: github.trim() === '' ? user.github : github,
      sns: sns.trim() === '' ? user.sns : sns,
      blog: blog.trim() === '' ? user.blog : blog,
      linkedin: linkedin.trim() === '' ? user.linkedin : linkedin,
    },
    education: education.length > 0 ? education : null,
    career: career.length > 0 ? career : null
  };

  return modifiedUserData;
}


function collectEducationData(uploadResult) {
    const educationTable = document.querySelector('.education .form-table tbody');
    if (!educationTable) return [];
    
    const educationRows = educationTable.querySelectorAll('.form-row');

    return Array.from(educationRows).map(row => {
        const schoolName = row.querySelector('.school-name')?.value || '';
        const statusRadio = row.querySelector('input[name="education-status"]:checked')?.id || 'enrolled';
        
        let status;

        switch(statusRadio) {
            case 'enrolled':
                status = 'ENROLLED';
                break;
            case 'graduated':
                status = 'GRADUATED';
                break;
            default:
                status = 'ENROLLED';
        }

        const major = row.querySelector('td:nth-child(3) input')?.value || '';
        const startDate = row.querySelector('td:nth-child(4) input')?.value || '';
        const endDate = row.querySelector('td:nth-child(5) input')?.value || '';
        
        return {
          school_name: schoolName.trim() === '' ? user.education.school_name : schoolName,
          status: status,
          major: major.trim() === '' ? user.education.major : major,
          certificate_url: uploadResult?.education?.[0] ?? null,
          start_date: startDate.trim() === '' ? user.education.start_date : startDate,
          end_date: endDate.trim() === '' ? user.education.end_date : endDate
        };
    });
}

function collectCareerData(uploadResult) {
    const careerTable = document.querySelector('.career .form-table tbody');
    if (!careerTable) return [];
    
    const careerRows = careerTable.querySelectorAll('.form-row');
    return Array.from(careerRows).map(row => {
        const companyName = row.querySelector('.company-name')?.value || '';
        const statusRadio = row.querySelector('input[name="career-status"]:checked')?.id || 'employed';
        
        let status;
        switch(statusRadio) {
            case 'employed':
                status = 'EMPLOYED';
                break;
            case 'resigned':
                status = 'NOT_EMPLOYED';
                break;
            default:
                status = 'EMPLOYED';
        }
        
        const position = row.querySelector('td:nth-child(3) input')?.value || '';
        const startDate = row.querySelector('td:nth-child(4) input')?.value || '';
        const endDate = row.querySelector('td:nth-child(5) input')?.value || '';

        return {
          company_name: companyName.trim() === '' ? user.career.company_name : companyName,
          status: status,
          position: position.trim() === '' ? user.career.position : position,
          certificate_url: uploadResult?.career?.[0] ?? null, // 추후 반복 시 키 기반으로 인덱스 처리 필요
          start_date: startDate.trim() === '' ? user.career.start_date : startDate,
          end_date: endDate.trim() === '' ? user.career.end_date : endDate
        };
    });
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

 
async function uploadFiles(profileFile, resumeFile, certificateFile, educationCertFile, careerCertFile) {
    const formData = new FormData();
    [profileFile].filter(Boolean).forEach(file => formData.append("profile", file));
    [resumeFile].filter(Boolean).forEach(file => formData.append("resume", file));
    if (certificateFile) certificateFile.forEach(file => formData.append("certification", file));
    if (educationCertFile) educationCertFile.forEach(file => formData.append("education", file));
    if (careerCertFile) careerCertFile.forEach(file => formData.append("career", file));

    const res = await fetch(API_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (!res.ok) {
        throw new Error('파일 업로드 실패');
    }

    return await res.json();
}


function validateFileSize(inputElement, label) {
    inputElement.addEventListener('change', function (e) {
        const files = Array.from(inputElement.files);
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`${label} 파일은 ${MAX_FILE_SIZE_MB}MB를 초과할 수 없습니다.`);
                inputElement.value = ''; // 파일 선택 초기화
                break;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    validateFileSize(document.getElementById('profile-upload'), '프로필');
    validateFileSize(document.getElementById('resume-upload'), '이력서');
    validateFileSize(document.getElementById('certificate-upload'), '자격증');
    validateFileSize(document.getElementById('education-cert-upload'), '학력 증명서');
    validateFileSize(document.getElementById('career-cert-upload'), '경력 증명서');
});
