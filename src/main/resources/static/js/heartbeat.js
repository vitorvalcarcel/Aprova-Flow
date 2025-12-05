// heartbeat.js - Maintains connection with server
(function () {
    const API_URL = window.location.origin;

    function iniciarHeartbeat() {
        setInterval(() => {
            fetch(`${API_URL}/system/heartbeat`, { method: 'POST' }).catch(() => {
                // Ignore connection errors
            });
        }, 5000); // 5 seconds
    }

    iniciarHeartbeat();
    console.log("Heartbeat iniciado.");
})();
