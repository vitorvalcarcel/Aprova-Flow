// --- MODAIS CUSTOMIZADOS ---

export function mostrarModal(titulo, mensagem) {
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    const overlay = document.getElementById('modal-overlay');

    if (titleEl) titleEl.innerText = titulo;
    if (msgEl) msgEl.innerText = mensagem;

    if (actions) {
        actions.innerHTML = '<button class="btn-modal-ok" id="btn-modal-ok-default">OK</button>';
        document.getElementById('btn-modal-ok-default').onclick = fecharModal;
    }

    if (overlay) overlay.style.display = 'flex';
}

export function confirmarAcao(mensagem, callback) {
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    const overlay = document.getElementById('modal-overlay');

    if (titleEl) titleEl.innerText = "Confirmação";
    if (msgEl) msgEl.innerText = mensagem;

    if (actions) {
        actions.innerHTML = '';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn-modal-cancel';
        btnCancel.innerText = 'Cancelar';
        btnCancel.onclick = fecharModal;

        const btnOk = document.createElement('button');
        btnOk.className = 'btn-modal-ok';
        btnOk.innerText = 'Confirmar';
        btnOk.onclick = () => {
            fecharModal();
            callback();
        };

        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);
    }

    if (overlay) overlay.style.display = 'flex';
}

export function fecharModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

// --- FORMATTERS ---

export function getTempoFormatado(segundosTotais) {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}
