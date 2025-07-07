import { CONFIG } from '/config.js';

const toNullIfEmpty = (value) => value.trim() === '' ? null : value;
const API_SIGNUP_URL = `${CONFIG.API_BASE_URL}/auth/signup`;

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

function handleSignup() {
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
    
    const education = collectEducationData();
    const career = collectCareerData();
    
    const userData = {
        image: null,
        username: toNullIfEmpty(username),
        pwd: toNullIfEmpty(pwd),
        email: toNullIfEmpty(email),
        name: toNullIfEmpty(name),
        position: toNullIfEmpty(position),
        bio: toNullIfEmpty(bio),
        stack: stack.length > 0 ? stack : null,
        resume: null,
        certificateUrl: [],
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

function collectEducationData() {
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
            schoolName: toNullIfEmpty(schoolName),
            status: status,
            major: toNullIfEmpty(major),
            certificateUrl: null,
            startDate: toNullIfEmpty(startDate),
            endDate: toNullIfEmpty(endDate)
        };
    });
}

function collectCareerData() {
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
            companyName: toNullIfEmpty(companyName),
            status: status,
            position: toNullIfEmpty(position),
            startDate: toNullIfEmpty(startDate),
            endDate: toNullIfEmpty(endDate)
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

window.handleSignup = handleSignup;