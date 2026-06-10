// Admin Login Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('adminLoginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    const togglePassword = document.getElementById('togglePassword');
    const passwordIcon = document.getElementById('passwordIcon');
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const errorMessage = document.getElementById('errorMessage');
    const loginSuccess = document.getElementById('loginSuccess');
    const twoFactorContainer = document.getElementById('twoFactorContainer');
    const twoFactorForm = document.getElementById('twoFactorForm');
    const codeInputs = document.querySelectorAll('.code-input');
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resendCode');
    const forgotPassword = document.getElementById('forgotPassword');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPassword.setAttribute('type', type);
        passwordIcon.classList.toggle('fa-eye');
        passwordIcon.classList.toggle('fa-eye-slash');
    });

    // Auto-focus next code input
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Auto move to next input
            if (this.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            
            // Auto submit if all fields filled
            if (index === codeInputs.length - 1 && this.value.length === 1) {
                const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
                if (allFilled) {
                    verifyTwoFactorCode();
                }
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // Form validation
    function validateLoginForm() {
        let isValid = true;
        const email = document.getElementById('adminEmail');
        const password = document.getElementById('adminPassword');
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        loginError.style.display = 'none';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            document.getElementById('emailError').textContent = 'Email is required';
            email.focus();
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email';
            if (isValid) email.focus();
            isValid = false;
        }
        
        // Password validation
        if (!password.value.trim()) {
            document.getElementById('passwordError').textContent = 'Password is required';
            if (isValid) password.focus();
            isValid = false;
        } else if (password.value.length < 8) {
            document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
            if (isValid) password.focus();
            isValid = false;
        }
        
        return isValid;
    }

    // Timer for 2FA code
    let countdown;
    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        countdown = setInterval(function() {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
            
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            
            display.textContent = minutes + ":" + seconds;
            
            if (--timer < 0) {
                clearInterval(countdown);
                display.textContent = "00:00";
                // Code expired logic
            }
        }, 1000);
    }

    // Simulate 2FA code generation
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Show 2FA container
    function showTwoFactorAuth() {
        twoFactorContainer.style.display = 'block';
        document.querySelector('.login-form-container').style.display = 'none';
        
        // Generate and send code (simulated)
        const verificationCode = generateVerificationCode();
        console.log('Verification Code (simulated):', verificationCode);
        
        // Start 5-minute timer
        startTimer(300, timerElement);
        
        // Clear inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
    }

    // Verify 2FA code
    function verifyTwoFactorCode() {
        const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
        
        if (enteredCode.length !== 6) {
            showError('Please enter the complete 6-digit code');
            return false;
        }
        
        // Simulate API call
        setTimeout(() => {
            // For demo, always accept 123456
            if (enteredCode === '123456') {
                completeLogin();
            } else {
                showError('Invalid verification code');
            }
        }, 1000);
        
        return true;
    }

    // Complete login process
    function completeLogin() {
        loginSuccess.style.display = 'flex';
        loginError.style.display = 'none';
        
        // Store login state (simulated)
        const loginData = {
            email: document.getElementById('adminEmail').value,
            timestamp: new Date().toISOString(),
            sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
        };
        
        // Store in localStorage (in real app, use secure session)
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminSession', JSON.stringify(loginData));
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 2000);
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        loginError.style.display = 'flex';
        loginSuccess.style.display = 'none';
    }

    // Main login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateLoginForm()) {
            return;
        }
        
        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Get form data
        const formData = {
            email: document.getElementById('adminEmail').value,
            password: document.getElementById('adminPassword').value,
            remember: document.getElementById('rememberMe').checked,
            timestamp: new Date().toISOString()
        };
        
        // Simulate API call delay
        setTimeout(() => {
            // Reset button state
            loginBtn.disabled = false;
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            
            // Demo credentials (in real app, this would be server-side validation)
            const demoCredentials = [
                { email: 'admin@klemkeysrealty.com', password: 'Admin123!' },
                { email: 'supervisor@klemkeysrealty.com', password: 'Super123!' }
            ];
            
            const isValid = demoCredentials.some(cred => 
                cred.email === formData.email && cred.password === formData.password
            );
            
            if (isValid) {
                // For demo, show 2FA for admin@klemkeysrealty.com
                if (formData.email === 'admin@klemkeysrealty.com') {
                    showTwoFactorAuth();
                } else {
                    completeLogin();
                }
            } else {
                showError('Invalid email or password');
            }
        }, 1500);
    });

    // Two-factor form submission
    twoFactorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        verifyTwoFactorCode();
    });

    // Resend code button
    resendBtn.addEventListener('click', function() {
        clearInterval(countdown);
        startTimer(300, timerElement);
        // Generate new code
        const newCode = generateVerificationCode();
        console.log('New Verification Code (simulated):', newCode);
        // Clear inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
    });

    // Forgot password
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value || 'your email';
        alert(`Password reset instructions would be sent to ${email}.\n\nFor security reasons, please contact the system administrator.`);
    });

    // Simulate active admins count
    function updateActiveAdmins() {
        const activeCount = Math.floor(Math.random() * 3) + 1; // 1-3 active
        document.getElementById('activeAdmins').textContent = activeCount;
    }
    
    updateActiveAdmins();
    setInterval(updateActiveAdmins, 30000); // Update every 30 seconds

    // Check for existing session
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const sessionAge = new Date() - new Date(session.timestamp);
        
        // Auto-login if session is less than 30 minutes old
        if (sessionAge < 30 * 60 * 1000) {
            loginSuccess.style.display = 'flex';
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminSession');
        }
    }
});