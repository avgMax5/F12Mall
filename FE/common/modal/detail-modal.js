import { getProfile } from '/hook/user/getProfile.js';

export async function initModalContent(userId) {
  if (!userId) return;
  const data = await getProfile(userId);
  console.log('[모달 데이터]:', data);

  // Profile Image
  document.getElementById('profile-img').src = data.image || 'default-profile-image.jpg';

  // Profile Information
  document.getElementById('profile-coinname').innerText = data.username || '';
  document.getElementById('profile-realname').innerText = data.name || '';
  document.getElementById('profile-role').innerText = data.position || 'Role not specified';
  document.getElementById('profile-email').innerText = data.email || 'No email provided';
  document.getElementById('profile-desc').textContent = data.bio || 'No bio provided';

  // Tech Stack
  const techStackList = document.getElementById('tech-stack-list');
  techStackList.innerHTML = '';
  if (data.stack && data.stack.length > 0) {
    data.stack.forEach(tech => {
      const techButton = document.createElement('button');
      techButton.classList.add('tech-btn');
      techButton.textContent = tech;
      techStackList.appendChild(techButton);
    });
  }

  // Education
  const educationTable = document.getElementById('education-table');
  let educationBody = educationTable.querySelector('tbody');
  educationBody.innerHTML = '';

  if (data.education && data.education.length > 0) {
    data.education.forEach(edu => {
      if (edu.school_name) {
        const row = educationTable.insertRow();
        row.innerHTML = `
        <td>${edu.school_name || 'Unknown'}</td>
        <td>${edu.status === 'ENROLLED' ? '재학 중' : '졸업'}</td>
        <td>${edu.major || 'Unknown'}</td>
        <td>${edu.start_date || 'Unknown'}</td>
        <td>${edu.end_date || 'Unknown'}</td>
    `;
      }
    });
  }

  // Career
  const careerTable = document.getElementById('career-table');
  let careerBody = careerTable.querySelector('tbody');
  careerBody.innerHTML = '';

  if (data.career && data.career.length > 0) {
    data.career.forEach(career => {
      if (career.company_name) {
        const row = careerTable.insertRow();
        row.innerHTML = `
        <td>${career.company_name || 'Unknown'}</td>
        <td>${career.status === 'ENROLLED' ? '재직 중' : '퇴사'}</td>
        <td>${career.position || 'Unknown'}</td>
        <td>${career.start_date || 'Unknown'}</td>
        <td>${career.end_date || 'Unknown'}</td>
    `;
      }
    });
  }

  // Resume
  const resumeLink = document.getElementById('profile-resume');
  if (data.resume) {
    resumeLink.href = data.resume;
    resumeLink.textContent = data.resume
      .split('/')
      .pop()
      .split('_')
      .slice(1)
      .join('_');
  } else {
    resumeLink.href = '#';
    resumeLink.textContent = '등록된 이력서가 없습니다';
  }

  // Certification
  const certListContainer = document.getElementById('profile-cert-list');
  certListContainer.innerHTML = '';

  data.certification.forEach(cert => {
    const certItem = document.createElement('div');
    certItem.textContent = cert || 'No certification provided';
    certListContainer.appendChild(certItem);
  });

  // SNS
  const socialIconsContainer = document.getElementById('profile-sns');
  socialIconsContainer.innerHTML = '';

  const socialLinks = data.link;

  if (socialLinks.github) {
    const a = document.createElement('a');
    a.href = socialLinks.github;
    a.target = '_blank';
    a.innerHTML = '<i class="fa-brands fa-github"></i>';
    socialIconsContainer.appendChild(a);
  }

  if (socialLinks.blog) {
    const a = document.createElement('a');
    a.href = socialLinks.blog;
    a.target = '_blank';
    a.innerHTML = '<i class="fa-solid fa-blog"></i>';
    socialIconsContainer.appendChild(a);
  }

  if (socialLinks.sns) {
    const a = document.createElement('a');
    a.href = socialLinks.sns;
    a.target = '_blank';
    a.innerHTML = '<i class="fa-brands fa-instagram"></i>';
    socialIconsContainer.appendChild(a);
  }

  if (socialLinks.linkedin) {
    const a = document.createElement('a');
    a.href = socialLinks.linkedin;
    a.target = '_blank';
    a.innerHTML = '<i class="fa-brands fa-linkedin"></i>';
    socialIconsContainer.appendChild(a);
  }
}
