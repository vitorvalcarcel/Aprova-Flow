import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao, getTempoFormatado } from './utils.js';
import { state } from './state.js';
import { carregarMaterias, carregarTiposEstudo } from './management.js';

// Variáveis do Cronômetro
let timerInterval;
let segundosTotais = 0;
let isRodando = false;
let horaInicioTimer = null;

export async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/estudos/dashboard`);
        const data = await response.json();
        document.getElementById("lblHoras").innerText = data.totalHorasCiclo || "00:00";
        document.getElementById("lblMensagem").innerText = data.mensagemMotivacional;
    } catch (e) { console.error(e); }
}

// --- LÓGICA DE ABAS ---
export function mudarModo(modo) {
    if (isRodando && modo === 'manual') {
        mostrarModal("Atenção", "Pause ou pare o cronômetro antes de trocar de modo!");
        return;
    }

    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (modo === 'timer') {
        document.getElementById('mode-timer').style.display = 'block';
        document.getElementById('formManual').style.display = 'none';
    } else {
        document.getElementById('mode-timer').style.display = 'none';
        document.getElementById('formManual').style.display = 'block';
    }
}

// --- LÓGICA DO CRONÔMETRO ---
export function iniciarCronometro() {
    if (isRodando) return;

    if (segundosTotais === 0) {
        const agora = new Date();
        horaInicioTimer = agora.toTimeString().split(' ')[0];
    }

    isRodando = true;

    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'flex';
    document.getElementById('timer-details').style.display = 'none';

    document.getElementById('statusTimer').innerText = "Estudando... Foco!";
    document.getElementById('statusTimer').style.color = "#003399";

    timerInterval = setInterval(() => {
        segundosTotais++;
        atualizarDisplayTimer();
    }, 1000);
}

export function pausarCronometro() {
    isRodando = false;
    clearInterval(timerInterval);

    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'none';

    document.getElementById('timer-details').style.display = 'block';

    document.getElementById('statusTimer').innerText = "Pausado - Preencha os dados abaixo";
    document.getElementById('statusTimer').style.color = "#ff9800";
}

export function continuarCronometro() {
    isRodando = true;
    document.getElementById('timer-details').style.display = 'none';
    document.getElementById('btnPause').style.display = 'flex';

    document.getElementById('statusTimer').innerText = "Estudando... Foco!";
    document.getElementById('statusTimer').style.color = "#003399";

    timerInterval = setInterval(() => {
        segundosTotais++;
        atualizarDisplayTimer();
    }, 1000);
}

export function cancelarCronometro() {
    confirmarAcao("Tem certeza que deseja descartar esse tempo de estudo?", () => {
        isRodando = false;
        clearInterval(timerInterval);
        segundosTotais = 0;
        horaInicioTimer = null;
        atualizarDisplayTimer();

        document.getElementById('timer-details').style.display = 'none';
        document.getElementById('btnStart').style.display = 'flex';
        document.getElementById('btnPause').style.display = 'none';

        // Clear inputs
        ['timer-materia', 'timer-topico', 'timer-tipo'].forEach(id => {
            document.getElementById(id).value = "";
            document.getElementById(`${id}-input`).value = "";
        });

        document.getElementById('timer-qFeitas').value = "";
        document.getElementById('timer-qCertas').value = "";
        document.getElementById('timer-anotacoes').value = "";

        document.getElementById('statusTimer').innerText = "Bora estudar?";
        document.getElementById('statusTimer').style.color = "#888";
    });
}

function atualizarDisplayTimer() {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    document.getElementById('display-horas').innerText = String(horas).padStart(2, '0');
    document.getElementById('display-minutos').innerText = String(minutos).padStart(2, '0');
    document.getElementById('display-segundos').innerText = String(segundos).padStart(2, '0');
}

// --- SALVAR COM VERIFICAÇÃO DE NOVOS ITENS ---

async function ensureId(mode, type, name) {
    const idField = document.getElementById(`${mode}-${type}`);
    if (idField.value) return idField.value; // Already has ID

    if (!name) return null; // Empty

    // Create new - USING CUSTOM CONFIRMATION IS TRICKY HERE because confirmAcao is async callback based.
    // We need to wrap it in a Promise to await it.

    return new Promise((resolve) => {
        confirmarAcao(`"${name}" não existe. Deseja criar como novo?`, async () => {
            let url, body;
            if (type === 'materia') {
                url = `${API_URL}/materias`;
                body = { nome: name };
            } else if (type === 'tipo') {
                url = `${API_URL}/tipos-estudo`;
                body = { nome: name };
            } else if (type === 'topico') {
                const materiaId = document.getElementById(`${mode}-materia`).value;
                if (!materiaId) {
                    mostrarModal("Erro", "Selecione uma matéria existente antes de criar um tópico.");
                    resolve(null);
                    return;
                }
                url = `${API_URL}/topicos`;
                body = { descricao: name, materia: { id: materiaId } };
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    const created = await response.json();
                    // Refresh cache
                    if (type === 'materia' || type === 'topico') await carregarMaterias();
                    if (type === 'tipo') await carregarTiposEstudo();
                    resolve(created.id);
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.error(e);
                resolve(null);
            }
        });
        // If user cancels, we need to handle that too, but confirmarAcao currently doesn't have a cancel callback.
        // For now, if they cancel, the promise hangs or we need to modify confirmarAcao.
        // Let's modify confirmarAcao in utils.js later or assume user will click confirm.
        // Actually, to be safe, let's assume if they don't confirm, we return null.
        // But since I can't easily change the modal logic to be synchronous, I will modify confirmarAcao to accept a cancel callback or just use a flag.
        // For simplicity in this refactor, I will use a modified version of ensureId that assumes confirmation for now or I will update utils.js to support cancel callback.
        // Let's update utils.js to support cancel callback.
    });
}

export async function salvarTimer() {
    const materiaNome = document.getElementById("timer-materia-input").value;
    // We need to handle the async nature of ensureId with the modal.
    // This is complex. For now, let's assume the user MUST select from list or we use the standard confirm for this specific flow 
    // OR we update `ensureId` to be fully async with the modal.

    // Let's try to make ensureId work with the modal.
    // I will use a helper function that returns a promise for the modal.

    const materiaId = await ensureIdWithModal('timer', 'materia', materiaNome);

    if (!materiaId && materiaNome) return; // User cancelled or error
    if (!materiaId && !materiaNome) {
        mostrarModal("Atenção", "Selecione ou crie uma matéria válida!");
        return;
    }

    const topicoNome = document.getElementById("timer-topico-input").value;
    const topicoId = await ensureIdWithModal('timer', 'topico', topicoNome);

    const tipoNome = document.getElementById("timer-tipo-input").value;
    const tipoId = await ensureIdWithModal('timer', 'tipo', tipoNome);

    const registro = {
        data: new Date().toISOString().split('T')[0],
        horaInicio: horaInicioTimer,
        materiaId: materiaId,
        topicoId: topicoId,
        tipoEstudoId: tipoId,
        cargaHoraria: getTempoFormatado(segundosTotais),
        questoesFeitas: document.getElementById("timer-qFeitas").value || 0,
        questoesCertas: document.getElementById("timer-qCertas").value || 0,
        anotacoes: document.getElementById("timer-anotacoes").value
    };

    await enviarRegistro(registro, true);
}

export async function salvarManual(e) {
    e.preventDefault();

    const materiaNome = document.getElementById("manual-materia-input").value;
    const materiaId = await ensureIdWithModal('manual', 'materia', materiaNome);

    if (!materiaId && materiaNome) return;
    if (!materiaId && !materiaNome) {
        mostrarModal("Atenção", "Selecione ou crie uma matéria válida!");
        return;
    }

    const topicoNome = document.getElementById("manual-topico-input").value;
    const topicoId = await ensureIdWithModal('manual', 'topico', topicoNome);

    const tipoNome = document.getElementById("manual-tipo-input").value;
    const tipoId = await ensureIdWithModal('manual', 'tipo', tipoNome);

    const registro = {
        data: document.getElementById("manual-data").value,
        horaInicio: document.getElementById("manual-horaInicio").value + ":00",
        materiaId: materiaId,
        topicoId: topicoId,
        tipoEstudoId: tipoId,
        cargaHoraria: document.getElementById("manual-duracao").value,
        questoesFeitas: document.getElementById("manual-qFeitas").value || 0,
        questoesCertas: document.getElementById("manual-qCertas").value || 0,
        anotacoes: document.getElementById("manual-anotacoes").value
    };

    await enviarRegistro(registro, false);
}

// Helper to wrap modal in promise
function ensureIdWithModal(mode, type, name) {
    const idField = document.getElementById(`${mode}-${type}`);
    if (idField.value) return Promise.resolve(idField.value);
    if (!name) return Promise.resolve(null);

    return new Promise((resolve) => {
        // Custom confirm logic
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');
        const actions = document.getElementById('modal-actions');
        const overlay = document.getElementById('modal-overlay');

        if (titleEl) titleEl.innerText = "Novo Item";
        if (msgEl) msgEl.innerText = `"${name}" não existe. Deseja criar como novo?`;

        if (actions) {
            actions.innerHTML = '';
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn-modal-cancel';
            btnCancel.innerText = 'Cancelar';
            btnCancel.onclick = () => {
                document.getElementById('modal-overlay').style.display = 'none';
                resolve(null);
            };

            const btnOk = document.createElement('button');
            btnOk.className = 'btn-modal-ok';
            btnOk.innerText = 'Criar';
            btnOk.onclick = async () => {
                document.getElementById('modal-overlay').style.display = 'none';
                // Create logic here
                let url, body;
                if (type === 'materia') {
                    url = `${API_URL}/materias`;
                    body = { nome: name };
                } else if (type === 'tipo') {
                    url = `${API_URL}/tipos-estudo`;
                    body = { nome: name };
                } else if (type === 'topico') {
                    const materiaId = document.getElementById(`${mode}-materia`).value;
                    if (!materiaId) {
                        mostrarModal("Erro", "Selecione uma matéria existente antes de criar um tópico.");
                        resolve(null);
                        return;
                    }
                    url = `${API_URL}/topicos`;
                    body = { descricao: name, materia: { id: materiaId } };
                }

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (response.ok) {
                        const created = await response.json();
                        if (type === 'materia' || type === 'topico') await carregarMaterias();
                        if (type === 'tipo') await carregarTiposEstudo();
                        resolve(created.id);
                    } else {
                        resolve(null);
                    }
                } catch (e) { console.error(e); resolve(null); }
            };

            actions.appendChild(btnCancel);
            actions.appendChild(btnOk);
        }
        if (overlay) overlay.style.display = 'flex';
    });
}

async function enviarRegistro(registro, isTimer) {
    try {
        const response = await fetch(`${API_URL}/estudos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            mostrarModal("Sucesso", `Estudo salvo com sucesso!\nTempo: ${registro.cargaHoraria}`);
            carregarDashboard();

            if (isTimer) {
                isRodando = false;
                clearInterval(timerInterval);
                segundosTotais = 0;
                horaInicioTimer = null;
                // Reset display manually since we don't export atualizarDisplayTimer
                document.getElementById('display-horas').innerText = '00';
                document.getElementById('display-minutos').innerText = '00';
                document.getElementById('display-segundos').innerText = '00';

                document.getElementById('timer-details').style.display = 'none';
                document.getElementById('btnStart').style.display = 'flex';
                document.getElementById('statusTimer').innerText = "Bora estudar?";

                // Clear inputs
                ['timer-materia', 'timer-topico', 'timer-tipo'].forEach(id => {
                    document.getElementById(id).value = "";
                    document.getElementById(`${id}-input`).value = "";
                });
                document.getElementById('timer-qFeitas').value = "";
                document.getElementById('timer-qCertas').value = "";
                document.getElementById('timer-anotacoes').value = "";
            } else {
                document.getElementById("formManual").reset();
                document.getElementById("manual-data").valueAsDate = new Date();
                // Clear hidden inputs too
                ['manual-materia', 'manual-topico', 'manual-tipo'].forEach(id => {
                    document.getElementById(id).value = "";
                });
            }
        } else {
            mostrarModal("Erro", "Erro ao salvar. Verifique os dados.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal("Erro", "Erro de conexão.");
    }
}
