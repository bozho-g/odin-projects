const form = document.querySelector('form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const usernameMsg = document.querySelector('.username-msg');
const passwordMsg = document.querySelector('.password-msg');
const confirmPasswordMsg = document.querySelector('.confirmPassword-msg');

usernameInput.addEventListener('input', clearErrors);
passwordInput.addEventListener('input', clearErrors);
confirmPasswordInput.addEventListener('input', clearErrors);

function clearErrors() {
    document.querySelectorAll('.msg').forEach(msg => {
        msg.style.visibility = "hidden";
        msg.textContent = "msg";
    });

    const errorDiv = document.querySelector('.error');
    if (errorDiv) {
        errorDiv.style.display = "none";
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let errors = [];
    let valid = true;
    if (usernameInput.value.length < 2) {
        errors.push(() => showMessage(usernameMsg, "Username must be at least 2 characters", "var(--destructive)"));
        valid = false;
    }

    if (passwordInput.value.length < 6) {
        errors.push(() => showMessage(passwordMsg, "Password must be at least 6 characters", "var(--destructive)"));
        valid = false;
    }
    if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value.length === 0) {
        errors.push(() => showMessage(confirmPasswordMsg, "Passwords do not match", "var(--destructive)"));
        valid = false;
    }

    if (valid) {
        form.submit();
    } else {
        errors.forEach((err) => err());
    }
});

function showMessage(element, msg, color) {
    element.style.visibility = "visible";
    element.textContent = msg;
    element.style.color = color;
}