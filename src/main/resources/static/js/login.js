const API_URL = window.location.origin;

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const alertError = document.getElementById('alert-error');
const alertSuccess = document.getElementById('alert-success');

function showErrorMessage(msg) {
    alertError.innerText = msg;
    alertError.style.display = 'block';
    alertSuccess.style.display = 'none';
    setTimeout(() => alertError.style.display = 'none', 5000);
}

function showSuccessMessage(msg) {
    alertSuccess.innerText = msg;
    alertSuccess.style.display = 'block';
    alertError.style.display = 'none';
    setTimeout(() => alertSuccess.style.display = 'none', 5000);
}

window.showRegister = function () {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    alertError.style.display = 'none';
    alertSuccess.style.display = 'none';
}

window.showLogin = function () {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    alertError.style.display = 'none';
    alertSuccess.style.display = 'none';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login-submit');

    btn.innerText = 'Entrando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.accessToken);
            window.location.href = 'index.html';
        } else {
            showErrorMessage('Usuário ou senha inválidos.');
            btn.innerText = 'Entrar';
            btn.disabled = false;
        }
    } catch (error) {
        showErrorMessage('Erro de conexão com o servidor.');
        btn.innerText = 'Entrar';
        btn.disabled = false;
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;
    const btn = document.getElementById('btn-reg-submit');

    if (password !== confirm) {
        showErrorMessage('As senhas não conferem.');
        return;
    }

    btn.innerText = 'Criando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showSuccessMessage('Conta criada com sucesso! Faça login.');
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('reg-password-confirm').value = '';
            setTimeout(() => showLogin(), 1500);
        } else {
            const msg = await response.text();
            showErrorMessage(msg || 'Erro ao criar conta.');
        }
    } catch (error) {
        showErrorMessage('Erro de conexão ao registrar.');
    } finally {
        btn.innerText = 'Criar Conta';
        btn.disabled = false;
    }
});
