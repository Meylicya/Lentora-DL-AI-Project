// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormContainer = document.getElementById('login-form');
const signupFormContainer = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const guestAccessBtn = document.getElementById('guest-access');
const toggleLoginPassword = document.getElementById('toggle-login-password');
const toggleSignupPassword = document.getElementById('toggle-signup-password');
const loginPasswordInput = document.getElementById('login-password');
const signupPasswordInput = document.getElementById('signup-password');
const forgotPasswordLink = document.querySelector('.forgot-password');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const modalCloseButtons = document.querySelectorAll('.modal-close');
const sendResetLinkBtn = document.getElementById('send-reset-link');

// Toggle between login and signup forms
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.remove('active');
    signupFormContainer.classList.add('active');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.classList.remove('active');
    loginFormContainer.classList.add('active');
});

// Toggle password visibility
toggleLoginPassword.addEventListener('click', () => {
    const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPasswordInput.setAttribute('type', type);
    toggleLoginPassword.classList.toggle('fa-eye');
    toggleLoginPassword.classList.toggle('fa-eye-slash');
});

toggleSignupPassword.addEventListener('click', () => {
    const type = signupPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    signupPasswordInput.setAttribute('type', type);
    toggleSignupPassword.classList.toggle('fa-eye');
    toggleSignupPassword.classList.toggle('fa-eye-slash');
});

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate authentication process
    simulateAuthProcess('login', email, password, rememberMe);
});

// Handle signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAgreement = document.getElementById('terms-agreement').checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!termsAgreement) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }
    
    // Simulate signup process
    simulateAuthProcess('signup', email, password, false, name);
});

// Guest access
if (guestAccessBtn) {
guestAccessBtn.addEventListener('click', () => {
    showNotification('Entering as guest...', 'success');
    
    // Set guest mode in localStorage
    localStorage.setItem('lentora_user_mode', 'guest');
    localStorage.setItem('lentora_guest_timestamp', new Date().getTime());
    
    // Redirect to main page after a short delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
});
}

// Forgot password modal
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.add('active');
});

// Close modal
modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        forgotPasswordModal.classList.remove('active');
    });
});

// Send reset link
sendResetLinkBtn.addEventListener('click', () => {
    const resetEmail = document.getElementById('reset-email').value;
    
    if (!resetEmail || !isValidEmail(resetEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate sending reset link
    showNotification(`Reset link sent to ${resetEmail}`, 'success');
    
    // Close modal after delay
    setTimeout(() => {
        forgotPasswordModal.classList.remove('active');
        document.getElementById('reset-email').value = '';
    }, 2000);
});

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'var(--sage-depth)' : 'var(--peach-blossom)'};
        color: ${type === 'success' ? 'white' : 'var(--forest-shadow)'};
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: var(--soft-shadow);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Add keyframe animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function simulateAuthProcess(type, email, password, rememberMe, name = '') {
    // Show loading state
    const submitButton = type === 'login' 
        ? loginForm.querySelector('.btn-auth') 
        : signupForm.querySelector('.btn-auth');
    
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // For demo purposes, we'll consider all logins/signups as successful
        // In a real app, you would validate against a backend
        
        // Store user info in localStorage (for demo only)
        if (type === 'signup') {
            localStorage.setItem('lentora_user_name', name);
        }
        
        localStorage.setItem('lentora_user_email', email);
        localStorage.setItem('lentora_user_mode', 'authenticated');
        localStorage.setItem('lentora_user_login_timestamp', new Date().getTime());
        
        if (rememberMe) {
            localStorage.setItem('lentora_remember_me', 'true');
        }
        
        // Show success message
        showNotification(
            type === 'login' ? 'Login successful!' : 'Account created successfully!', 
            'success'
        );
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 2000);
}

// Check if user is already logged in (for demo purposes)
window.addEventListener('DOMContentLoaded', () => {
    const userMode = localStorage.getItem('lentora_user_mode');
    
    if (userMode === 'authenticated') {
        // Auto-fill login form if remember me was checked
        const rememberMe = localStorage.getItem('lentora_remember_me');
        if (rememberMe === 'true') {
            const storedEmail = localStorage.getItem('lentora_user_email');
            if (storedEmail) {
                document.getElementById('login-email').value = storedEmail;
                document.getElementById('remember-me').checked = true;
            }
        }
    }
    
    // Add some decorative animations
    animateLeaves();
});

// Animate background leaves
function animateLeaves() {
    const leaves = document.querySelectorAll('.leaf, .flower');
    
    leaves.forEach((leaf, index) => {
        // Randomize initial position slightly
        const randomX = Math.random() * 20 - 10;
        const randomY = Math.random() * 20 - 10;
        leaf.style.transform += ` translate(${randomX}px, ${randomY}px)`;
        
        // Add subtle floating animation
        leaf.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`;
        leaf.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add the floating animation keyframes
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float {
            from { transform: translateY(0) rotate(0deg); }
            to { transform: translateY(-10px) rotate(1deg); }
        }
    `;
    document.head.appendChild(styleSheet);
}