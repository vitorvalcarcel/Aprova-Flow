const API_URL = window.location.origin;

// Redirect if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

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

// Password Visibility Toggle
window.togglePassword = function (fieldId, icon) {
    const input = document.getElementById(fieldId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        input.type = 'password';
        icon.innerText = 'visibility';
    }
}

// Magic Test Login
window.loginTestUser = async function () {
    const email = "teste@aprova.com";
    const password = "TestUser1!"; // Meets requirements: 8+, Upper, Lower, Digit, Special
    const btn = document.getElementById('btn-test-login');

    // Safety check if element exists
    if (!btn) return;

    const originalText = btn.innerText;
    btn.innerText = "Autenticando...";
    btn.disabled = true;

    try {
        // 1. Try Login directly
        let response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // 2. If user doesn't exist (403/401 sometimes means Bad Creds, but good enough for test flow if we assume empty DB)
        // Actually, if Bad Credentials, we might want to try registering only if we are sure it doesn't exist.
        // But simpler: Try Register. If "Email already in use", then it was wrong password. 
        // If success, then we created it.

        if (!response.ok) {
            btn.innerText = "Criando usuário...";
            const regResponse = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // If registration worked OR failed because already exists (implying bad password on first try, but we'll try login again anyway)

            // 3. Login again
            btn.innerText = "Entrando...";
            response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        }

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.accessToken);
            window.location.href = 'index.html';
        } else {
            showErrorMessage("Erro no Login de Teste. Verifique o console.");
            console.error(await response.text());
            btn.innerText = originalText;
            btn.disabled = false;
        }

    } catch (e) {
        console.error(e);
        showErrorMessage("Erro de conexão.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('btn-login-submit');

    btn.innerText = 'Entrando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.accessToken);
            window.location.href = 'index.html';
        } else {
            // Tenta pegar mensagem detalhada do backend
            let errorMsg = 'E-mail ou senha inválidos.';
            try {
                const text = await response.text();
                if (text) errorMsg = text;
            } catch (e) { }

            showErrorMessage(errorMsg);
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
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;
    const btn = document.getElementById('btn-reg-submit');

    if (password !== confirm) {
        showErrorMessage('As senhas não conferem.');
        return;
    }

    // Strong Password Regex
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=\S+$).{8,}$/;

    if (!passwordPattern.test(password)) {
        showErrorMessage('A senha deve ter: 8+ caracteres, maiúscula, minúscula, número e símbolo (@, #, !, etc).');
        return;
    }

    btn.innerText = 'Criando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            showSuccessMessage('Conta criada com sucesso! Faça login.');
            document.getElementById('reg-email').value = '';
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
