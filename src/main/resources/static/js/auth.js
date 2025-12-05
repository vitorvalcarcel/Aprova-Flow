// auth.js - Handles JWT injection and redirection

(function () {
    const token = localStorage.getItem('token');
    const publicPages = ['/login.html'];
    const path = window.location.pathname;

    // Redirect to login if no token and not on public page
    if (!token && !publicPages.some(p => path.endsWith(p))) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect to index if token exists and on login page
    if (token && path.endsWith('/login.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Monkey-patch fetch to add Authorization header
    const originalFetch = window.fetch;
    window.fetch = async function (url, options = {}) {
        // If URL is relative or same origin
        if (typeof url === 'string' && (url.startsWith('/') || url.startsWith(window.location.origin))) {
            // Add Authorization header
            if (token) {
                options.headers = options.headers || {};
                // Handle Headers object or plain object
                if (options.headers instanceof Headers) {
                    options.headers.append('Authorization', `Bearer ${token}`);
                } else {
                    options.headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }

        const response = await originalFetch(url, options);

        // Handle 401/403 (Token expired or invalid)
        if (response.status === 401 || response.status === 403) {
            // Only redirect if not already on login page
            if (!path.endsWith('/login.html')) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }

        return response;
    };

    // Restoration logic: If we are here, we are either on a public page or authenticated/awaiting redirect
    // If not on login page, show the app container (which starts hidden)
    if (!path.endsWith('/login.html')) {
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'flex'; // Or 'block', depending on layout
        }
    }
})();

window.logout = function () {
    if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
};
