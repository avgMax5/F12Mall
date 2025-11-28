import { CONFIG } from '/config.js';

const toNullIfEmpty = (value) => value.trim() === '' ? null : value;
const API_SIGNUP_URL = `${CONFIG.API_BASE_URL}/auth/signup`;
const API_UPLOAD_URL = `${CONFIG.API_BASE_URL}/users/upload`;

const MAX_FILE_SIZE_MB = 5; // 업로드 파일사이즈 5MB 제한 (1개당)
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; 

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }
    
    const inputs = document.querySelectorAll('#signupForm input, #signupForm textarea');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                return false;
            }
        });
    });
});

async function handleSignup() {
    const profileFile = document.querySelector('#profile-upload')?.files[0] ?? null;
    const resumeFile = document.querySelector('#resume-upload')?.files[0] ?? null;
    const certificateUpload  = Array.from(document.querySelector('#certificate-upload')?.files ?? []);
    const educationCertUpload  = Array.from(document.querySelector('#education-cert-upload')?.files ?? []);
    const careerCertUpload = Array.from(document.querySelector('#career-cert-upload')?.files ?? []);

    const uploadResult = await uploadFiles(profileFile, resumeFile, certificateUpload, educationCertUpload, careerCertUpload);
    
    const username = document.querySelector('.id-input').value;
    const passwordInput = document.querySelector('input[placeholder="비밀번호"]');
    const pwd = passwordInput.value;
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

    const userData = {
        image: uploadResult?.profile?.[0] ?? `${CONFIG.DEFAULT_PROFILE_IMG}`,
        username: toNullIfEmpty(username),
        pwd: toNullIfEmpty(pwd),
        email: toNullIfEmpty(email),
        name: toNullIfEmpty(name),
        position: toNullIfEmpty(position),
        bio: toNullIfEmpty(bio),
        stack: stack.length > 0 ? stack : null,
        resume: uploadResult?.resume?.[0] ?? null,
        certificate_url: (uploadResult?.certification ?? []).map(certificate_url => ({ certificate_url })),
        link: {
            github: toNullIfEmpty(github),
            sns: toNullIfEmpty(sns),
            blog: toNullIfEmpty(blog),
            linkedin: toNullIfEmpty(linkedin)
        },
        education: education.length > 0 ? education : null,
        career: career.length > 0 ? career : null
    };
    
    submitSignup(userData);
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
            school_name: toNullIfEmpty(schoolName),
            status: status,
            major: toNullIfEmpty(major),
            certificate_url: uploadResult?.education?.[0] ?? null,
            start_date: toNullIfEmpty(startDate),
            end_date: toNullIfEmpty(endDate)
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
            company_name: toNullIfEmpty(companyName),
            status: status,
            position: toNullIfEmpty(position),
            certificate_url: uploadResult?.career?.[0] ?? null, // 이 부분은 나중에 여러줄 되면 전체 반복에서 키로 비교해서 인덱스 대신 넣어야될듯?
            start_date: toNullIfEmpty(startDate),
            end_date: toNullIfEmpty(endDate)
        };
    });
}

async function submitSignup(userData) {
    try {
        const response = await fetch(API_SIGNUP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`요청 실패: ${response.status} ${response.statusText} ${errorText}`);
        }
        const data = await response.json();

        alert('회원가입이 완료되었습니다!');
        document.getElementById('signupForm').reset();
        window.location.href = '/login';
    } catch (err) {
        console.error('회원가입 실패:', err);
        alert(`회원가입에 실패했습니다: ${err.message}`);
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

window.handleSignup = handleSignup;