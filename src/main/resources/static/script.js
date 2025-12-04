const API_URL = "http://localhost:8080";
let materiasCache = [];
let registrosGlobais = []; // Cache para edição

// Variáveis do Cronômetro
let timerInterval;
let segundosTotais = 0;
let isRodando = false;
let horaInicioTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    carregarMaterias();

    // Define a data de hoje como padrão no Manual
    document.getElementById("manual-data").valueAsDate = new Date();

    // Auto-filter listeners
    ['filtro-materia', 'filtro-topico', 'filtro-tipo', 'filtro-periodo', 'filtro-data-inicio', 'filtro-data-fim'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', carregarHistorico);
    });
});

// --- LÓGICA DE ABAS ---
function mudarModo(modo) {
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
function iniciarCronometro() {
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

function pausarCronometro() {
    isRodando = false;
    clearInterval(timerInterval);

    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'none';

    document.getElementById('timer-details').style.display = 'block';

    document.getElementById('statusTimer').innerText = "Pausado - Preencha os dados abaixo";
    document.getElementById('statusTimer').style.color = "#ff9800";
}

function continuarCronometro() {
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

function cancelarCronometro() {
    confirmarAcao("Tem certeza que deseja descartar esse tempo de estudo?", () => {
        isRodando = false;
        clearInterval(timerInterval);
        segundosTotais = 0;
        horaInicioTimer = null;
        atualizarDisplayTimer();

        document.getElementById('timer-details').style.display = 'none';
        document.getElementById('btnStart').style.display = 'flex';
        document.getElementById('btnPause').style.display = 'none';

        document.getElementById('timer-materia').value = "";
        document.getElementById('timer-topico').innerHTML = '<option value="">(Opcional)</option>';

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

function getTempoFormatado() {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// --- API E DADOS ---

async function carregarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        materiasCache = await response.json();

        const selects = ['timer-materia', 'manual-materia', 'filtro-materia', 'edit-materia'];

        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = id.includes('filtro') ? '<option value="">Todas Matérias</option>' : '<option value="">Selecione...</option>';

            materiasCache.forEach(m => {
                let opt = document.createElement("option");
                opt.value = m.id;
                opt.text = m.nome;
                el.add(opt);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar matérias:", error);
    }
}

function carregarTopicos(modo) {
    const idMateria = document.getElementById(`${modo}-materia`).value;
    const selectTopico = document.getElementById(`${modo}-topico`);

    selectTopico.innerHTML = modo === 'filtro' ? '<option value="">Todos Tópicos</option>' : '<option value="">(Opcional) Selecione...</option>';

    if (!idMateria) return;

    const materiaSelecionada = materiasCache.find(m => m.id == idMateria);
    if (materiaSelecionada && materiaSelecionada.topicos) {
        materiaSelecionada.topicos.forEach(t => {
            let option = document.createElement("option");
            option.value = t.id;
            option.text = `${t.numeroEdital}. ${t.descricao.substring(0, 50)}...`;
            selectTopico.add(option);
        });
    }
}

async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/estudos/dashboard`);
        const data = await response.json();
        document.getElementById("lblHoras").innerText = data.totalHorasCiclo || "00:00";
        document.getElementById("lblMensagem").innerText = data.mensagemMotivacional;
    } catch (e) { console.error(e); }
}

// --- SALVAR TIMER ---
async function salvarTimer() {
    const materiaId = document.getElementById("timer-materia").value;
    if (!materiaId) {
        mostrarModal("Atenção", "Selecione a matéria antes de salvar!");
        return;
    }

    const registro = {
        data: new Date().toISOString().split('T')[0],
        horaInicio: horaInicioTimer,
        materiaId: materiaId,
        topicoId: document.getElementById("timer-topico").value || null,
        tipoEstudo: document.getElementById("timer-tipo").value,
        cargaHoraria: getTempoFormatado(),
        questoesFeitas: document.getElementById("timer-qFeitas").value || 0,
        questoesCertas: document.getElementById("timer-qCertas").value || 0,
        anotacoes: document.getElementById("timer-anotacoes").value
    };

    await enviarRegistro(registro, true);
}

// --- SALVAR MANUAL ---
async function salvarManual(e) {
    e.preventDefault();

    const registro = {
        data: document.getElementById("manual-data").value,
        horaInicio: document.getElementById("manual-horaInicio").value + ":00",
        materiaId: document.getElementById("manual-materia").value,
        topicoId: document.getElementById("manual-topico").value || null,
        tipoEstudo: document.getElementById("manual-tipo").value,
        cargaHoraria: document.getElementById("manual-duracao").value,
        questoesFeitas: document.getElementById("manual-qFeitas").value || 0,
        questoesCertas: document.getElementById("manual-qCertas").value || 0,
        anotacoes: document.getElementById("manual-anotacoes").value
    };

    await enviarRegistro(registro, false);
}

// --- FUNÇÃO GENÉRICA DE ENVIO ---
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
                atualizarDisplayTimer();

                document.getElementById('timer-details').style.display = 'none';
                document.getElementById('btnStart').style.display = 'flex';
                document.getElementById('statusTimer').innerText = "Bora estudar?";

                document.getElementById('timer-qFeitas').value = "";
                document.getElementById('timer-qCertas').value = "";
                document.getElementById('timer-anotacoes').value = "";
            } else {
                document.getElementById("formManual").reset();
                document.getElementById("manual-data").valueAsDate = new Date();
            }
        } else {
            mostrarModal("Erro", "Erro ao salvar. Verifique os dados.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal("Erro", "Erro de conexão.");
    }
}

// --- HISTÓRICO E NAVEGAÇÃO ---

function mudarAba(aba) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${aba}`).classList.add('active');

    if (aba === 'dashboard') {
        document.getElementById('sec-dashboard').style.display = 'grid';
        document.getElementById('sec-historico').style.display = 'none';
        carregarDashboard();
    } else {
        document.getElementById('sec-dashboard').style.display = 'none';
        document.getElementById('sec-historico').style.display = 'block';
        carregarHistorico();
    }
}

function atualizarFiltroData() {
    const periodo = document.getElementById('filtro-periodo').value;
    const divCustom = document.getElementById('div-datas-custom');

    if (periodo === 'custom') {
        divCustom.style.display = 'flex';
    } else {
        divCustom.style.display = 'none';
        carregarHistorico(); // Recarrega se mudar de custom para outro
    }
}

async function carregarHistorico() {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '<p style="text-align:center; color:#888;">Carregando...</p>';

    const materiaId = document.getElementById('filtro-materia').value;
    const topicoId = document.getElementById('filtro-topico').value;
    const tipo = document.getElementById('filtro-tipo').value;
    const periodo = document.getElementById('filtro-periodo').value;

    let dataInicio = null;
    let dataFim = null;
    const hoje = new Date();

    // Lógica de Datas
    if (periodo === 'hoje') {
        dataInicio = hoje.toISOString().split('T')[0];
        dataFim = dataInicio;
    } else if (periodo === 'ontem') {
        const ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);
        dataInicio = ontem.toISOString().split('T')[0];
        dataFim = dataInicio;
    } else if (periodo === '7dias') {
        const seteDiasAtras = new Date(hoje);
        seteDiasAtras.setDate(hoje.getDate() - 7);
        dataInicio = seteDiasAtras.toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === '30dias') {
        const trintaDiasAtras = new Date(hoje);
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        dataInicio = trintaDiasAtras.toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === 'mesAtual') {
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio = primeiroDia.toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === 'mesPassado') {
        const primeiroDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        dataInicio = primeiroDiaMesPassado.toISOString().split('T')[0];
        dataFim = ultimoDiaMesPassado.toISOString().split('T')[0];
    } else if (periodo === 'custom') {
        dataInicio = document.getElementById('filtro-data-inicio').value;
        dataFim = document.getElementById('filtro-data-fim').value;
    }
    // 'max' não define datas, manda null

    const params = new URLSearchParams();
    if (materiaId) params.append('materiaId', materiaId);
    if (topicoId) params.append('topicoId', topicoId);
    if (tipo) params.append('tipoEstudo', tipo);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    try {
        const response = await fetch(`${API_URL}/estudos?${params.toString()}`);
        registrosGlobais = await response.json();
        renderizarTabela(registrosGlobais);
    } catch (error) {
        console.error(error);
        lista.innerHTML = '<p style="text-align:center; color:red;">Erro ao carregar histórico.</p>';
    }
}

function renderizarTabela(registros) {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '';

    if (registros.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#888;">Nenhum registro encontrado.</p>';
        return;
    }

    registros.forEach(r => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.id = `registro-${r.id}`;

        const dataFormatada = r.data.split('-').reverse().join('/');

        let desempenho = '';
        if (r.questoesFeitas > 0) {
            const pct = Math.round((r.questoesCertas / r.questoesFeitas) * 100);
            let cor = pct >= 80 ? 'green' : (pct >= 50 ? 'orange' : 'red');
            desempenho = `<span style="color:${cor}; font-weight:bold;">${pct}% Acerto</span>`;
        }

        item.innerHTML = `
            <div class="history-summary" onclick="toggleDetalhes(${r.id})">
                <div class="history-info">
                    <span class="history-materia">${r.materia.nome}</span>
                    <span class="history-topico">${r.topico ? r.topico.descricao : 'Sem tópico'}</span>
                    <div class="history-meta">
                        <span>📅 ${dataFormatada}</span>
                        <span>⏱️ ${r.cargaHoraria}</span>
                        <span class="tag-tipo">${r.tipoEstudo}</span>
                    </div>
                </div>
                <div style="text-align:right; display:flex; align-items:center; gap:15px;">
                    ${desempenho}
                    <span class="material-icons expand-icon" id="icon-${r.id}">expand_more</span>
                </div>
            </div>
            <div id="detalhes-${r.id}" class="history-details">
                <div class="detail-row">
                    <span class="detail-label">Hora Início:</span>
                    <span class="detail-value">${r.horaInicio || '--:--'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Questões:</span>
                    <span class="detail-value">${r.questoesCertas}/${r.questoesFeitas}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Anotações:</span>
                    <span class="detail-value" style="font-weight:normal; font-style:italic;">"${r.anotacoes || 'Sem anotações'}"</span>
                </div>
                <div class="history-actions">
                    <button class="btn-icon-action" onclick="abrirModalEdicao(${r.id})">
                        <span class="material-icons">edit</span> Editar
                    </button>
                    <button class="btn-icon-action delete" onclick="excluirRegistro(${r.id})">
                        <span class="material-icons">delete</span> Excluir
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(item);
    });
}

function toggleDetalhes(id) {
    const item = document.getElementById(`registro-${id}`);
    const details = document.getElementById(`detalhes-${id}`);

    if (details.style.display === 'block') {
        details.style.display = 'none';
        item.classList.remove('open');
    } else {
        details.style.display = 'block';
        item.classList.add('open');
        setTimeout(() => {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// --- MODAIS CUSTOMIZADOS ---

function mostrarModal(titulo, mensagem) {
    document.getElementById('modal-title').innerText = titulo;
    document.getElementById('modal-message').innerText = mensagem;

    const actions = document.getElementById('modal-actions');
    actions.innerHTML = '<button class="btn-modal-ok" onclick="fecharModal()">OK</button>';

    document.getElementById('modal-overlay').style.display = 'flex';
}

function confirmarAcao(mensagem, callback) {
    document.getElementById('modal-title').innerText = "Confirmação";
    document.getElementById('modal-message').innerText = mensagem;

    const actions = document.getElementById('modal-actions');
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

    document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// --- EDIÇÃO E EXCLUSÃO ---

async function excluirRegistro(id) {
    confirmarAcao("Tem certeza que deseja excluir este registro permanentemente?", async () => {
        try {
            const response = await fetch(`${API_URL}/estudos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                mostrarModal("Sucesso", "Registro excluído!");
                carregarHistorico();
            } else {
                mostrarModal("Erro", "Não foi possível excluir.");
            }
        } catch (e) {
            console.error(e);
            mostrarModal("Erro", "Erro de conexão.");
        }
    });
}

let registroEmEdicaoId = null;

async function abrirModalEdicao(id) {
    const registro = registrosGlobais.find(r => r.id === id);
    if (!registro) return;

    registroEmEdicaoId = id;
    document.getElementById('edit-id').value = id;

    document.getElementById('edit-materia').value = registro.materia.id;
    carregarTopicos('edit');

    setTimeout(() => {
        if (registro.topico) document.getElementById('edit-topico').value = registro.topico.id;
    }, 100);

    document.getElementById('edit-data').value = registro.data;
    document.getElementById('edit-horaInicio').value = registro.horaInicio;
    document.getElementById('edit-duracao').value = registro.cargaHoraria;
    document.getElementById('edit-tipo').value = registro.tipoEstudo;
    document.getElementById('edit-qFeitas').value = registro.questoesFeitas;
    document.getElementById('edit-qCertas').value = registro.questoesCertas;
    document.getElementById('edit-anotacoes').value = registro.anotacoes;

    document.getElementById('modal-edit').style.display = 'flex';
}

function fecharModalEdit() {
    document.getElementById('modal-edit').style.display = 'none';
    registroEmEdicaoId = null;
}

async function salvarEdicao(e) {
    e.preventDefault();

    const registro = {
        materiaId: document.getElementById('edit-materia').value,
        topicoId: document.getElementById('edit-topico').value || null,
        data: document.getElementById('edit-data').value,
        horaInicio: document.getElementById('edit-horaInicio').value,
        cargaHoraria: document.getElementById('edit-duracao').value,
        tipoEstudo: document.getElementById('edit-tipo').value,
        questoesFeitas: document.getElementById('edit-qFeitas').value || 0,
        questoesCertas: document.getElementById('edit-qCertas').value || 0,
        anotacoes: document.getElementById('edit-anotacoes').value
    };

    try {
        const response = await fetch(`${API_URL}/estudos/${registroEmEdicaoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            mostrarModal("Sucesso", "Registro atualizado!");
            fecharModalEdit();
            carregarHistorico();
        } else {
            mostrarModal("Erro", "Erro ao atualizar.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal("Erro", "Erro de conexão.");
    }
}