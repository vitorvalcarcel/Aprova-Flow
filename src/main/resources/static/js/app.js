import { API_URL } from './modules/config.js';
import { mostrarModal, confirmarAcao, fecharModal } from './modules/utils.js';
import { state } from './modules/state.js'; // Adicionado para acessar o cache de matérias
import { carregarDashboard, mudarModo, iniciarCronometro, pausarCronometro, continuarCronometro, cancelarCronometro, salvarTimer, salvarManual, fecharCicloConfirmacao } from './modules/dashboard.js';
import { carregarHistorico, atualizarFiltroData, toggleDetalhes, abrirModalEdicao, fecharModalEdit, salvarEdicao, excluirRegistro, renderizarFiltroCombinado } from './modules/history.js'; // Adicionado renderizarFiltroCombinado
import { carregarMaterias, carregarTiposEstudo, toggleAccordion, abrirModalMateria, fecharModalMateria, salvarMateria, excluirMateria, abrirModalTopico, fecharModalTopico, salvarTopico, excluirTopico, abrirModalTipo, fecharModalTipo, salvarTipo, excluirTipo } from './modules/management.js';
import { loadProfile, salvarPerfil, carregarConcursos, abrirModalNovoConcurso, fecharModalNovoConcurso, salvarNovoConcurso, ativarConcurso, excluirConcurso, mudarTabConfig, abrirConfigConcurso, fecharModalConfigConcurso, vincularMateriaAoConcurso } from './modules/profile.js';
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
window.fecharCicloConfirmacao = fecharCicloConfirmacao;

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


window.salvarPerfil = salvarPerfil;
window.abrirModalNovoConcurso = abrirModalNovoConcurso;
window.fecharModalNovoConcurso = fecharModalNovoConcurso;
window.salvarNovoConcurso = salvarNovoConcurso;
window.ativarConcurso = ativarConcurso;
window.excluirConcurso = excluirConcurso;
window.mudarTabConfig = mudarTabConfig;

window.abrirConfigConcurso = abrirConfigConcurso;
window.fecharModalConfigConcurso = fecharModalConfigConcurso;
window.vincularMateriaAoConcurso = vincularMateriaAoConcurso;

window.fecharModal = fecharModal;
window.salvarConcursoInicial = salvarConcursoInicial;

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    verificarConcursoAtivo();
    // Heartbeat movido para script separado
    carregarDashboard();
    carregarMaterias();
    carregarTiposEstudo();

    // Define a data de hoje como padrão no Manual
    const manualData = document.getElementById("manual-data");
    if (manualData) manualData.valueAsDate = new Date();

    // Auto-filter listeners
    // Nota: 'filtro-materia' e 'filtro-topico' foram removidos do HTML na nova versão
    // mas mantemos aqui caso o elemento exista para evitar erros, ou limpamos a lista
    ['filtro-tipo', 'filtro-periodo', 'filtro-data-inicio', 'filtro-data-fim'].forEach(id => {
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

    // Oculta todas as seções
    const secoes = ['sec-dashboard', 'sec-historico', 'sec-perfil', 'sec-gerenciar'];
    secoes.forEach(secId => {
        const el = document.getElementById(secId);
        if (el) el.style.display = 'none';
    });

    if (aba === 'dashboard') {
        document.getElementById('sec-dashboard').style.display = 'grid';
        carregarDashboard();
    } else if (aba === 'historico') {
        document.getElementById('sec-historico').style.display = 'block';

        // LÓGICA NOVA: Renderiza o filtro de árvore
        if (state.materiasCache.length > 0) {
            renderizarFiltroCombinado();
        } else {
            // Se não tiver cache, carrega matérias e depois renderiza
            carregarMaterias().then(() => renderizarFiltroCombinado());
        }
        carregarHistorico();

    } else if (aba === 'gerenciar') {
        // Caso ainda exista a aba gerenciar separada no seu HTML
        const secGerenciar = document.getElementById('sec-gerenciar');
        if (secGerenciar) {
            secGerenciar.style.display = 'block';
            carregarMaterias();
            carregarTiposEstudo();
        }
    } else if (aba === 'perfil') {
        document.getElementById('sec-perfil').style.display = 'block';
        loadProfile();
        carregarConcursos();
        carregarMaterias();
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