const form = document.querySelector('form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const firstNameMsg = document.querySelector('.firstName-msg');
const lastNameMsg = document.querySelector('.lastName-msg');
const usernameMsg = document.querySelector('.username-msg');
const passwordMsg = document.querySelector('.password-msg');
const confirmPasswordMsg = document.querySelector('.confirmPassword-msg');

firstNameInput.addEventListener('input', clearErrors);
lastNameInput.addEventListener('input', clearErrors);
usernameInput.addEventListener('input', clearErrors);
passwordInput.addEventListener('input', clearErrors);
confirmPasswordInput.addEventListener('input', clearErrors);

function clearErrors() {
    document.querySelectorAll('.msg').forEach(msg => {
        msg.style.visibility = "hidden";
        msg.textContent = "msg";
        msg.previousElementSibling.style.border = "1px solid var(--border)";
    });

    document.querySelector('.error').style.display = "none";
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let errors = [];
    let valid = true;
    if (firstNameInput.value.length < 2) {
        errors.push(() => showMessage(firstNameMsg, "First name must be at least 2 characters", "var(--error)"));
        valid = false;
    }

    if (lastNameInput.value.length < 2) {
        errors.push(() => showMessage(lastNameMsg, "Last name must be at least 2 characters", "var(--error)"));
        valid = false;
    }

    if (usernameInput.value.length < 2) {
        errors.push(() => showMessage(usernameMsg, "Username must be at least 2 characters", "var(--error)"));
        valid = false;
    }

    if (passwordInput.value.length < 6) {
        errors.push(() => showMessage(passwordMsg, "Password must be at least 6 characters", "var(--error)"));
        valid = false;
    }
    if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value.length === 0) {
        errors.push(() => showMessage(confirmPasswordMsg, "Passwords do not match", "var(--error)"));
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
    element.previousElementSibling.style.border = `2px solid ${color}`;
}