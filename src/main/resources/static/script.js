const API_URL = "http://localhost:8080";
let materiasCache = [];
let tiposEstudoCache = [];
let registrosGlobais = []; // Cache para edição

// Variáveis do Cronômetro
let timerInterval;
let segundosTotais = 0;
let isRodando = false;
let horaInicioTimer = null;

document.addEventListener("DOMContentLoaded", () => {
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
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.autocomplete-list').forEach(list => {
            if (!list.parentElement.contains(e.target)) {
                list.style.display = 'none';
            }
        });
    });
});

// --- AUTOCOMPLETE LOGIC ---

function setupAutocomplete(baseId, type) {
    const input = document.getElementById(`${baseId}-input`);
    const hidden = document.getElementById(baseId);
    const list = document.getElementById(`${baseId}-list`);

    if (!input || !hidden || !list) return;

    input.addEventListener('input', function() {
        const val = this.value;
        const mode = baseId.split('-')[0]; // timer or manual

        let source = [];
        if (type === 'materias') source = materiasCache;
        if (type === 'tipos') source = tiposEstudoCache;
        if (type === 'topicos') {
            const materiaId = document.getElementById(`${mode}-materia`).value;
            if (materiaId) {
                const mat = materiasCache.find(m => m.id == materiaId);
                if (mat) source = mat.topicos || [];
            }
        }

        renderAutocompleteList(source, val, list, hidden, input, type);
    });

    input.addEventListener('focus', function() {
        // Trigger search on focus to show all or filtered
        const event = new Event('input');
        this.dispatchEvent(event);
    });
}

function renderAutocompleteList(source, query, list, hidden, input, type) {
    list.innerHTML = '';
    list.style.display = 'block';

    const matches = source.filter(item => {
        const text = item.nome || item.descricao;
        return text.toLowerCase().includes(query.toLowerCase());
    });

    // Option to create new
    if (query && !matches.find(item => (item.nome || item.descricao).toLowerCase() === query.toLowerCase())) {
        const newItem = document.createElement('div');
        newItem.className = 'autocomplete-item new-item';
        newItem.innerHTML = `Criar novo: "<strong>${query}</strong>"`;
        newItem.onclick = () => {
            hidden.value = ''; // Empty ID means new
            input.value = query;
            list.style.display = 'none';
        };
        list.appendChild(newItem);
    }

    matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerText = item.nome || item.descricao;
        div.onclick = () => {
            hidden.value = item.id;
            input.value = item.nome || item.descricao;
            list.style.display = 'none';
            
            // If selecting materia, clear topic
            if (type === 'materias') {
                const mode = input.id.split('-')[0];
                document.getElementById(`${mode}-topico`).value = '';
                document.getElementById(`${mode}-topico-input`).value = '';
            }
        };
        list.appendChild(div);
    });

    if (matches.length === 0 && !query) {
        list.style.display = 'none';
    }
}


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

        // Update filters and edit modal (still using selects)
        const selects = ['filtro-materia', 'edit-materia', 'topico-materia-pai'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const valorAtual = el.value;
            el.innerHTML = id.includes('filtro') ? '<option value="">Todas Matérias</option>' : '<option value="">Selecione...</option>';
            materiasCache.forEach(m => {
                let opt = document.createElement("option");
                opt.value = m.id;
                opt.text = m.nome;
                el.add(opt);
            });
            if (valorAtual) el.value = valorAtual;
        });

        renderizarGerenciarMaterias();

    } catch (error) {
        console.error("Erro ao carregar matérias:", error);
    }
}

async function carregarTiposEstudo() {
    try {
        const response = await fetch(`${API_URL}/tipos-estudo`);
        tiposEstudoCache = await response.json();

        const selects = ['filtro-tipo', 'edit-tipo'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const valorAtual = el.value;
            el.innerHTML = id.includes('filtro') ? '<option value="">Todos Tipos</option>' : '<option value="">Selecione...</option>';
            tiposEstudoCache.forEach(t => {
                let opt = document.createElement("option");
                opt.value = t.id;
                opt.text = t.nome;
                el.add(opt);
            });
            if (valorAtual) el.value = valorAtual;
        });

        renderizarGerenciarTipos();

    } catch (error) {
        console.error("Erro ao carregar tipos:", error);
    }
}

// Kept for Filter and Edit modal
function carregarTopicos(modo) {
    if (modo === 'timer' || modo === 'manual') return; // Handled by autocomplete now

    const idMateria = document.getElementById(`${modo}-materia`).value;
    const selectTopico = document.getElementById(`${modo}-topico`);

    selectTopico.innerHTML = modo === 'filtro' ? '<option value="">Todos Tópicos</option>' : '<option value="">(Opcional) Selecione...</option>';

    if (!idMateria) return;

    const materiaSelecionada = materiasCache.find(m => m.id == idMateria);
    if (materiaSelecionada && materiaSelecionada.topicos) {
        materiaSelecionada.topicos.forEach(t => {
            let option = document.createElement("option");
            option.value = t.id;
            option.text = `${t.numeroEdital ? t.numeroEdital + '. ' : ''}${t.descricao.substring(0, 50)}...`;
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

// --- SALVAR COM VERIFICAÇÃO DE NOVOS ITENS ---

async function ensureId(mode, type, name) {
    const idField = document.getElementById(`${mode}-${type}`);
    if (idField.value) return idField.value; // Already has ID

    if (!name) return null; // Empty

    // Create new
    if (!confirm(`"${name}" não existe. Deseja criar como novo?`)) return null;

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
            alert("Selecione uma matéria existente antes de criar um tópico.");
            return null;
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
            return created.id;
        }
    } catch (e) { console.error(e); }
    return null;
}

async function salvarTimer() {
    const materiaNome = document.getElementById("timer-materia-input").value;
    const materiaId = await ensureId('timer', 'materia', materiaNome);
    
    if (!materiaId) {
        mostrarModal("Atenção", "Selecione ou crie uma matéria válida!");
        return;
    }

    const topicoNome = document.getElementById("timer-topico-input").value;
    const topicoId = await ensureId('timer', 'topico', topicoNome);

    const tipoNome = document.getElementById("timer-tipo-input").value;
    const tipoId = await ensureId('timer', 'tipo', tipoNome);

    const registro = {
        data: new Date().toISOString().split('T')[0],
        horaInicio: horaInicioTimer,
        materiaId: materiaId,
        topicoId: topicoId,
        tipoEstudoId: tipoId,
        cargaHoraria: getTempoFormatado(),
        questoesFeitas: document.getElementById("timer-qFeitas").value || 0,
        questoesCertas: document.getElementById("timer-qCertas").value || 0,
        anotacoes: document.getElementById("timer-anotacoes").value
    };

    await enviarRegistro(registro, true);
}

async function salvarManual(e) {
    e.preventDefault();

    const materiaNome = document.getElementById("manual-materia-input").value;
    const materiaId = await ensureId('manual', 'materia', materiaNome);
    
    if (!materiaId) {
        mostrarModal("Atenção", "Selecione ou crie uma matéria válida!");
        return;
    }

    const topicoNome = document.getElementById("manual-topico-input").value;
    const topicoId = await ensureId('manual', 'topico', topicoNome);

    const tipoNome = document.getElementById("manual-tipo-input").value;
    const tipoId = await ensureId('manual', 'tipo', tipoNome);

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

// --- HISTÓRICO E NAVEGAÇÃO ---

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

function atualizarFiltroData() {
    const periodo = document.getElementById('filtro-periodo').value;
    const divCustom = document.getElementById('div-datas-custom');

    if (periodo === 'custom') {
        divCustom.style.display = 'flex';
    } else {
        divCustom.style.display = 'none';
        carregarHistorico();
    }
}

async function carregarHistorico() {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '<p style="text-align:center; color:#888;">Carregando...</p>';

    const materiaId = document.getElementById('filtro-materia').value;
    const topicoId = document.getElementById('filtro-topico').value;
    const tipoId = document.getElementById('filtro-tipo').value;
    const periodo = document.getElementById('filtro-periodo').value;

    let dataInicio = null;
    let dataFim = null;
    const hoje = new Date();

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

    const params = new URLSearchParams();
    if (materiaId) params.append('materiaId', materiaId);
    if (topicoId) params.append('topicoId', topicoId);
    if (tipoId) params.append('tipoEstudoId', tipoId); // Alterado para ID
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
                        <span class="tag-tipo">${r.tipoEstudo ? r.tipoEstudo.nome : 'N/A'}</span>
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

// --- EDIÇÃO E EXCLUSÃO REGISTROS ---

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
    // Force load topics for edit
    const selectTopico = document.getElementById('edit-topico');
    selectTopico.innerHTML = '<option value="">(Opcional) Selecione...</option>';
    if (registro.materia.topicos) {
        registro.materia.topicos.forEach(t => {
            let option = document.createElement("option");
            option.value = t.id;
            option.text = `${t.numeroEdital ? t.numeroEdital + '. ' : ''}${t.descricao.substring(0, 50)}...`;
            selectTopico.add(option);
        });
    }

    setTimeout(() => {
        if (registro.topico) document.getElementById('edit-topico').value = registro.topico.id;
    }, 100);

    document.getElementById('edit-data').value = registro.data;
    document.getElementById('edit-horaInicio').value = registro.horaInicio;
    document.getElementById('edit-duracao').value = registro.cargaHoraria;
    document.getElementById('edit-tipo').value = registro.tipoEstudo ? registro.tipoEstudo.id : "";
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
        tipoEstudoId: document.getElementById('edit-tipo').value,
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

// --- GERENCIAMENTO (CRUD) ---

function renderizarGerenciarMaterias() {
    const lista = document.getElementById('lista-materias-gerenciar');
    if (!lista) return;
    lista.innerHTML = '';

    materiasCache.forEach(m => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        // Header
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <span>${m.nome}</span>
            <div class="actions">
                <span class="material-icons" onclick="event.stopPropagation(); abrirModalMateria(${m.id}, '${m.nome}')">edit</span>
                <span class="material-icons" onclick="event.stopPropagation(); resetarHistoricoMateria(${m.id})">history_toggle_off</span>
                <span class="material-icons" onclick="event.stopPropagation(); excluirMateria(${m.id})">delete</span>
                <span class="material-icons">expand_more</span>
            </div>
        `;
        header.onclick = () => {
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        };

        // Content
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        let topicsHtml = '<ul class="topic-list">';
        if (m.topicos && m.topicos.length > 0) {
            m.topicos.forEach(t => {
                topicsHtml += `
                    <li class="topic-item">
                        <span>${t.numeroEdital ? t.numeroEdital + '. ' : ''}${t.descricao}</span>
                        <!-- Future: Add edit/delete for topics -->
                    </li>
                `;
            });
        } else {
            topicsHtml += '<li class="topic-item">Nenhum tópico cadastrado.</li>';
        }
        topicsHtml += '</ul>';
        
        // Add Topic Button inside Accordion
        topicsHtml += `
            <button class="btn-add-topic-inline" onclick="abrirModalTopicoInline(${m.id})">
                + Adicionar Tópico
            </button>
        `;

        content.innerHTML = topicsHtml;

        item.appendChild(header);
        item.appendChild(content);
        lista.appendChild(item);
    });
}

function renderizarGerenciarTipos() {
    const lista = document.getElementById('lista-tipos-gerenciar');
    if (!lista) return;
    lista.innerHTML = '';

    tiposEstudoCache.forEach(t => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <strong>${t.nome}</strong>
            <div class="card-actions">
                <span class="material-icons" onclick="abrirModalTipo(${t.id}, '${t.nome}')" style="color:#888; cursor:pointer;">edit</span>
                <span class="material-icons" onclick="excluirTipo(${t.id})" style="color:#dc3545; cursor:pointer;">delete</span>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Materia CRUD
function abrirModalMateria(id = null, nome = '') {
    document.getElementById('materia-id').value = id || '';
    document.getElementById('materia-nome').value = nome;
    document.getElementById('modal-materia').style.display = 'flex';
}

function fecharModalMateria() {
    document.getElementById('modal-materia').style.display = 'none';
}

async function salvarMateria(e) {
    e.preventDefault();
    const id = document.getElementById('materia-id').value;
    const nome = document.getElementById('materia-nome').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/materias/${id}` : `${API_URL}/materias`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        if (response.ok) {
            fecharModalMateria();
            carregarMaterias();
        }
    } catch (e) { console.error(e); }
}

async function excluirMateria(id) {
    confirmarAcao("ATENÇÃO: Excluir a matéria apagará TODOS os registros de estudo e tópicos vinculados a ela! Irreversível.", async () => {
        await fetch(`${API_URL}/materias/${id}`, { method: 'DELETE' });
        carregarMaterias();
    });
}

async function resetarHistoricoMateria(id) {
    confirmarAcao("Tem certeza? Isso apagará todo o histórico de estudos desta matéria, mas manterá a matéria e tópicos.", async () => {
        await fetch(`${API_URL}/materias/${id}/historico`, { method: 'DELETE' });
        mostrarModal("Sucesso", "Histórico resetado.");
        carregarDashboard();
    });
}

// Topico CRUD (Quick Add)
function abrirModalTopico() {
    // Legacy support for modal
    document.getElementById('modal-topico').style.display = 'flex';
}

function abrirModalTopicoInline(materiaId) {
    document.getElementById('topico-materia-pai').innerHTML = '';
    const m = materiasCache.find(mat => mat.id == materiaId);
    if(m) {
        let opt = document.createElement("option");
        opt.value = m.id;
        opt.text = m.nome;
        document.getElementById('topico-materia-pai').add(opt);
    }
    document.getElementById('topico-materia-pai').value = materiaId;
    document.getElementById('topico-id').value = '';
    document.getElementById('topico-nome').value = '';
    document.getElementById('topico-numero').value = '';
    document.getElementById('modal-topico').style.display = 'flex';
}

function fecharModalTopico() {
    document.getElementById('modal-topico').style.display = 'none';
}

async function salvarTopico(e) {
    e.preventDefault();
    const materiaId = document.getElementById('topico-materia-pai').value;
    const nome = document.getElementById('topico-nome').value;
    const numero = document.getElementById('topico-numero').value;

    const topico = {
        descricao: nome,
        numeroEdital: numero,
        materia: { id: materiaId }
    };

    try {
        const response = await fetch(`${API_URL}/topicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topico)
        });
        if (response.ok) {
            fecharModalTopico();
            carregarMaterias(); // Recarrega para atualizar cache de tópicos
        }
    } catch (e) { console.error(e); }
}

// Tipo Estudo CRUD
function abrirModalTipo(id = null, nome = '') {
    document.getElementById('tipo-id').value = id || '';
    document.getElementById('tipo-nome').value = nome;
    document.getElementById('modal-tipo').style.display = 'flex';
}

function fecharModalTipo() {
    document.getElementById('modal-tipo').style.display = 'none';
}

async function salvarTipo(e) {
    e.preventDefault();
    const id = document.getElementById('tipo-id').value;
    const nome = document.getElementById('tipo-nome').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/tipos-estudo/${id}` : `${API_URL}/tipos-estudo`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        if (response.ok) {
            fecharModalTipo();
            carregarTiposEstudo();
        }
    } catch (e) { console.error(e); }
}

async function excluirTipo(id) {
    confirmarAcao("Tem certeza que deseja excluir este tipo de estudo?", async () => {
        await fetch(`${API_URL}/tipos-estudo/${id}`, { method: 'DELETE' });
        carregarTiposEstudo();
    });
}