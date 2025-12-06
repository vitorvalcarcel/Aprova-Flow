import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao } from './utils.js';
import { state, setRegistrosGlobais } from './state.js';
// Não precisamos mais carregarMaterias aqui, pois usaremos o cache do state direto ou chamaremos ao iniciar

// --- MULTI-SELECT LOGIC ---

// Expor para o HTML
window.toggleMultiselect = function() {
    const dropdown = document.getElementById('multiselect-list');
    dropdown.classList.toggle('show');
};

// Fechar ao clicar fora
document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('filtro-combinado');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('multiselect-list').classList.remove('show');
    }
});

export function renderizarFiltroCombinado() {
    const container = document.getElementById('multiselect-list');
    if (!container) return;
    container.innerHTML = '';

    // Opção "Limpar Filtros"
    const divClean = document.createElement('div');
    divClean.innerHTML = `<button class="btn-icon-small" onclick="limparSelecaoFiltro()" style="width:100%; text-align:left; color:#d32f2f;">Limpar Seleção</button>`;
    divClean.style.marginBottom = "10px";
    container.appendChild(divClean);

    if (!state.materiasCache || state.materiasCache.length === 0) {
        container.innerHTML = '<p style="padding:10px;">Nenhuma matéria cadastrada.</p>';
        return;
    }

    state.materiasCache.forEach(materia => {
        const divMateria = document.createElement('div');
        divMateria.className = 'ms-item-materia';

        // Checkbox Matéria (Pai)
        // Ao clicar no Pai, selecionamos/deselecionamos todos os filhos visualmente
        divMateria.innerHTML = `
            <label class="ms-label-materia">
                <input type="checkbox" class="chk-materia" value="${materia.id}" onchange="onCheckMateria(this)">
                ${materia.nome}
            </label>
        `;

        // Checkbox Tópicos (Filhos)
        if (materia.topicos && materia.topicos.length > 0) {
            const divTopicos = document.createElement('div');
            divTopicos.className = 'ms-group-topicos';
            
            materia.topicos.forEach(topico => {
                divTopicos.innerHTML += `
                    <label class="ms-label-topico">
                        <input type="checkbox" class="chk-topico mat-${materia.id}" value="${topico.id}" onchange="carregarHistorico()">
                        ${topico.descricao}
                    </label>
                `;
            });
            divMateria.appendChild(divTopicos);
        }

        container.appendChild(divMateria);
    });
}

window.onCheckMateria = function(checkbox) {
    const materiaId = checkbox.value;
    const isChecked = checkbox.checked;
    
    // Selecionar/Deselecionar todos os tópicos filhos
    const topicosCheckboxes = document.querySelectorAll(`.chk-topico.mat-${materiaId}`);
    topicosCheckboxes.forEach(chk => chk.checked = isChecked);
    
    carregarHistorico();
};

window.limparSelecaoFiltro = function() {
    document.querySelectorAll('.chk-materia, .chk-topico').forEach(c => c.checked = false);
    carregarHistorico();
};

function getIdsSelecionados() {
    const materiaIds = Array.from(document.querySelectorAll('.chk-materia:checked')).map(c => c.value);
    const topicoIds = Array.from(document.querySelectorAll('.chk-topico:checked')).map(c => c.value);
    
    // Atualiza label do botão
    const total = materiaIds.length + topicoIds.length;
    const label = document.getElementById('multiselect-label');
    if(label) label.innerText = total > 0 ? `${total} iten(s) selecionado(s)` : "Filtrar Matérias e Assuntos";

    return { materiaIds, topicoIds };
}

// --- FUNÇÕES EXISTENTES ATUALIZADAS ---

export function atualizarFiltroData() {
    // Mesma lógica anterior...
    const periodo = document.getElementById('filtro-periodo').value;
    const divCustom = document.getElementById('div-datas-custom');
    if (periodo === 'custom') {
        divCustom.style.display = 'flex';
    } else {
        divCustom.style.display = 'none';
        carregarHistorico();
    }
}

export async function carregarHistorico() {
    const lista = document.getElementById('lista-historico');
    if (!lista) return;
    lista.innerHTML = '<p style="text-align:center; color:#888;">Carregando...</p>';

    // --- Captura Multi-Seleção ---
    const { materiaIds, topicoIds } = getIdsSelecionados();
    
    const tipoId = document.getElementById('filtro-tipo').value;
    const periodo = document.getElementById('filtro-periodo').value;

    // ... (Lógica de datas permanece igual, copie do arquivo original ou veja abaixo)
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
        const d = new Date(hoje); d.setDate(hoje.getDate() - 7);
        dataInicio = d.toISOString().split('T')[0]; dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === '30dias') {
        const d = new Date(hoje); d.setDate(hoje.getDate() - 30);
        dataInicio = d.toISOString().split('T')[0]; dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === 'mesAtual') {
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
    } else if (periodo === 'custom') {
        dataInicio = document.getElementById('filtro-data-inicio').value;
        dataFim = document.getElementById('filtro-data-fim').value;
    }
    // ...

    const params = new URLSearchParams();
    if (materiaIds.length > 0) params.append('materiaIds', materiaIds.join(','));
    if (topicoIds.length > 0) params.append('topicoIds', topicoIds.join(','));
    if (tipoId) params.append('tipoEstudoId', tipoId);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    try {
        const response = await fetch(`${API_URL}/estudos?${params.toString()}`);
        const data = await response.json();
        setRegistrosGlobais(data);
        renderizarTabela(data);
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
                    <button class="btn-icon-action" onclick="event.stopPropagation(); abrirModalEdicao(${r.id})">
                        <span class="material-icons">edit</span> Editar
                    </button>
                    <button class="btn-icon-action delete" onclick="event.stopPropagation(); excluirRegistro(${r.id})">
                        <span class="material-icons">delete</span> Excluir
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Helper for toggle (attached to window in app.js)
export function toggleDetalhes(id) {
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

export async function excluirRegistro(id) {
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

export async function abrirModalEdicao(id) {
    const registro = state.registrosGlobais.find(r => r.id === id);
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

export function fecharModalEdit() {
    document.getElementById('modal-edit').style.display = 'none';
    registroEmEdicaoId = null;
}

export async function salvarEdicao(e) {
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
