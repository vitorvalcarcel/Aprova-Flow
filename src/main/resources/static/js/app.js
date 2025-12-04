import { API_URL } from './modules/config.js';
import { mostrarModal, confirmarAcao, fecharModal } from './modules/utils.js';
import { carregarDashboard, mudarModo, iniciarCronometro, pausarCronometro, continuarCronometro, cancelarCronometro, salvarTimer, salvarManual } from './modules/dashboard.js';
import { carregarHistorico, atualizarFiltroData, toggleDetalhes, abrirModalEdicao, fecharModalEdit, salvarEdicao, excluirRegistro } from './modules/history.js';
import { carregarMaterias, carregarTiposEstudo, toggleAccordion, abrirModalMateria, fecharModalMateria, salvarMateria, excluirMateria, abrirModalTopico, fecharModalTopico, salvarTopico, excluirTopico, abrirModalTipo, fecharModalTipo, salvarTipo, excluirTipo } from './modules/management.js';
import { setupAutocomplete } from './modules/autocomplete.js';

// --- EXPOSE TO WINDOW (for HTML onclick) ---
window.mudarAba = mudarAba;
window.mudarModo = mudarModo;
window.iniciarCronometro = iniciarCronometro;
window.pausarCronometro = pausarCronometro;
window.continuarCronometro = continuarCronometro;
window.cancelarCronometro = cancelarCronometro;
window.salvarTimer = salvarTimer;
window.salvarManual = salvarManual;

window.atualizarFiltroData = atualizarFiltroData;
window.toggleDetalhes = toggleDetalhes;
window.abrirModalEdicao = abrirModalEdicao;
window.fecharModalEdit = fecharModalEdit;
window.salvarEdicao = salvarEdicao;
window.excluirRegistro = excluirRegistro;

window.toggleAccordion = toggleAccordion;
window.abrirModalMateria = abrirModalMateria;
window.fecharModalMateria = fecharModalMateria;
window.salvarMateria = salvarMateria;
window.excluirMateria = excluirMateria;
window.abrirModalTopico = abrirModalTopico;
window.fecharModalTopico = fecharModalTopico;
window.salvarTopico = salvarTopico;
window.excluirTopico = excluirTopico;
window.abrirModalTipo = abrirModalTipo;
window.fecharModalTipo = fecharModalTipo;
window.salvarTipo = salvarTipo;
window.excluirTipo = excluirTipo;

window.fecharModal = fecharModal;
window.salvarConcursoInicial = salvarConcursoInicial;

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    verificarConcursoAtivo();
    iniciarHeartbeat();
    carregarDashboard();
    carregarMaterias();
    carregarTiposEstudo();

    // Define a data de hoje como padrão no Manual
    const manualData = document.getElementById("manual-data");
    if (manualData) manualData.valueAsDate = new Date();

    // Auto-filter listeners
    ['filtro-materia', 'filtro-topico', 'filtro-tipo', 'filtro-periodo', 'filtro-data-inicio', 'filtro-data-fim'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', carregarHistorico);
    });

    // Setup Autocomplete
    setupAutocomplete('timer-materia', 'materias');
    setupAutocomplete('timer-topico', 'topicos');
    setupAutocomplete('timer-tipo', 'tipos');

    setupAutocomplete('manual-materia', 'materias');
    setupAutocomplete('manual-topico', 'topicos');
    setupAutocomplete('manual-tipo', 'tipos');

    // Close autocomplete when clicking outside
    document.addEventListener('click', function (e) {
        document.querySelectorAll('.autocomplete-list').forEach(list => {
            if (!list.parentElement.contains(e.target)) {
                list.style.display = 'none';
            }
        });
    });
});

// --- NAVIGATION ---
function mudarAba(aba) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${aba}`).classList.add('active');

    document.getElementById('sec-dashboard').style.display = 'none';
    document.getElementById('sec-historico').style.display = 'none';
    document.getElementById('sec-gerenciar').style.display = 'none';

    if (aba === 'dashboard') {
        document.getElementById('sec-dashboard').style.display = 'grid';
        carregarDashboard();
    } else if (aba === 'historico') {
        document.getElementById('sec-historico').style.display = 'block';
        carregarHistorico();
    } else if (aba === 'gerenciar') {
        document.getElementById('sec-gerenciar').style.display = 'block';
        carregarMaterias(); // Recarrega para garantir
        carregarTiposEstudo();
    }
}

// --- CONCURSO & HEARTBEAT ---

async function verificarConcursoAtivo() {
    try {
        const response = await fetch(`${API_URL}/concursos/ativo`);
        if (response.status === 204) { // No Content
            document.getElementById('modal-concurso').style.display = 'flex';
        } else {
            const concurso = await response.json();
            console.log("Concurso ativo:", concurso.nome);
            document.title = `AprovaFlow - ${concurso.nome}`;
        }
    } catch (e) {
        console.error("Erro ao verificar concurso:", e);
    }
}

async function salvarConcursoInicial(e) {
    e.preventDefault();
    const nome = document.getElementById('concurso-nome-inicial').value;

    try {
        const response = await fetch(`${API_URL}/concursos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });

        if (response.ok) {
            document.getElementById('modal-concurso').style.display = 'none';
            carregarDashboard();
            window.location.reload();
        } else {
            alert("Erro ao criar concurso.");
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
}

function iniciarHeartbeat() {
    setInterval(() => {
        fetch(`${API_URL}/system/heartbeat`, { method: 'POST' }).catch(() => {
            // Ignora erros de conexão no heartbeat
        });
    }, 5000);
}
