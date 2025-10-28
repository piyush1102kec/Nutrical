// Store registered users
let users = JSON.parse(localStorage.getItem('users')) || {};

// Form elements
const emailForm = document.getElementById('emailForm');
const otpForm = document.getElementById('otpForm');
const passwordForm = document.getElementById('passwordForm');

// Current user session
let currentEmail = '';
let currentOTP = '';

// Initialize default user if not exists
const DEFAULT_EMAIL = 'admin@nutrical.com';
const DEFAULT_PASSWORD = 'Admin@123';

function initializeDefaultUser() {
    if (!users[DEFAULT_EMAIL]) {
        users[DEFAULT_EMAIL] = {
            verified: true,
            password: hashPassword(DEFAULT_PASSWORD)
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultUser();
});

// Email form submission
emailForm.addEventListener('submit', function(e) {
    e.preventDefault();
    currentEmail = document.getElementById('email').value;
    
    if (users[currentEmail]) {
        // Existing user - redirect to main app if password exists
        if (users[currentEmail].password) {
            showPasswordForm();
        } else {
            // User registered but no password set
            generateAndSendOTP();
        }
    } else {
        // New user
        users[currentEmail] = { verified: false };
        localStorage.setItem('users', JSON.stringify(users));
        generateAndSendOTP();
    }
});

// OTP form handling
otpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const enteredOTP = Array.from(otpForm.querySelectorAll('input'))
        .map(input => input.value)
        .join('');
    
    if (enteredOTP === currentOTP) {
        users[currentEmail].verified = true;
        localStorage.setItem('users', JSON.stringify(users));
        showPasswordForm();
    } else {
        alert('Invalid OTP. Please try again.');
    }
});

// Password form handling
passwordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password === confirmPassword) {
        users[currentEmail].password = hashPassword(password);
        // Store user session
        localStorage.setItem('currentUser', currentEmail);
        localStorage.setItem('users', JSON.stringify(users));
        redirectToApp();
    } else {
        alert('Passwords do not match!');
    }
});

// Helper functions
function generateAndSendOTP() {
    currentOTP = Math.floor(1000 + Math.random() * 9000).toString();
    
    // In a real application, send this via email
    console.log(`OTP for ${currentEmail}: ${currentOTP}`);
    
    // Show OTP form
    showOTPForm();
}

function showOTPForm() {
    emailForm.classList.remove('active');
    otpForm.classList.add('active');
    passwordForm.classList.remove('active');
    
    // Display email for reference
    otpForm.querySelector('.email-display').textContent = currentEmail;
    
    // Setup OTP input behavior
    setupOTPInputs();
}

function showPasswordForm() {
    emailForm.classList.remove('active');
    otpForm.classList.remove('active');
    passwordForm.classList.add('active');
}

function setupOTPInputs() {
    const inputs = otpForm.querySelectorAll('.otp-inputs input');
    inputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });
    });
}

function hashPassword(password) {
    // In a real application, use proper password hashing
    return btoa(password);
}

function redirectToApp() {
    // Initialize user data if first time
    if (!localStorage.getItem(`userData_${currentEmail}`)) {
        const initialUserData = {
            nutrition: {
                proteins: 0,
                carbs: 0,
                fats: 0
            },
            calories: {
                goal: 2000,
                consumed: 0
            },
            sleep: {
                records: [],
                average: 0
            }
        };
        localStorage.setItem(`userData_${currentEmail}`, JSON.stringify(initialUserData));
    }
    window.location.href = 'index.html';
}

// Add logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}