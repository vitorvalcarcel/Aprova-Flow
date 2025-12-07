import { API_URL } from './config.js';

// Cache local de matérias para dropdowns
let materiasCache = [];

export function limparCacheMaterias() {
    materiasCache = [];
}

export async function carregarMeusConcursos() {
    // Limpar cache sempre que entrar para garantir frescor, 
    // pois o usuário pode ter cadastrado novas matérias na aba Gerenciar.
    limparCacheMaterias();

    const lista = document.getElementById('lista-meus-concursos');
    if (!lista) return;

    lista.innerHTML = '<p class="loading-text">Carregando...</p>';

    // Carregar matérias para os dropdowns
    if (materiasCache.length === 0) {
        try {
            const resMat = await fetch(`${API_URL}/materias`);
            materiasCache = await resMat.json();
        } catch (e) {
            console.error("Erro ao carregar matérias:", e);
        }
    }

    try {
        const response = await fetch(`${API_URL}/concursos`);
        if (response.ok) {
            const concursos = await response.json();
            renderizarConcursos(concursos);
        } else {
            lista.innerHTML = '<p class="error-text">Erro ao carregar concursos.</p>';
        }
    } catch (error) {
        console.error(error);
        lista.innerHTML = '<p class="error-text">Erro de conexão.</p>';
    }
}

function renderizarConcursos(concursos) {
    const lista = document.getElementById('lista-meus-concursos');
    lista.innerHTML = '';

    if (concursos.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#888;">Nenhum concurso cadastrado.</p>';
        return;
    }

    concursos.forEach(c => {
        const el = criarAccordionConcurso(c);
        lista.appendChild(el);
    });
}

function criarAccordionConcurso(c) {
    const container = document.createElement('div');
    container.className = 'concurso-accordion';
    container.id = `concurso-${c.id}`;

    // Header (apenas setup inicial, o valor real vem ao abrir)
    const progress = calcularProgressoSetup(c);

    // Status color
    const statusColor = c.ativo ? '#4caf50' : '#bdbdbd';
    const statusText = c.ativo ? 'Ativo' : 'Inativo';

    container.innerHTML = `
        <div class="accordion-header" onclick="toggleConcursoDetails(${c.id})">
            <div class="header-info">
                <h3>${c.nome}</h3>
                <span class="status-badge" style="background-color:${statusColor}">${statusText}</span>
            </div>
            <div class="header-stats">
                <div class="progress-info">
                    <span id="progresso-texto-${c.id}">Alocado: ${progress.alocado}h / ${progress.total}h</span>
                    <div class="progress-bar-mini">
                        <div class="fill" id="progresso-fill-${c.id}" style="width: ${progress.pct}%"></div>
                    </div>
                </div>
                <span class="material-icons expand-icon" id="icon-${c.id}">expand_more</span>
            </div>
        </div>
        <div class="accordion-body" id="body-${c.id}" style="display:none;">
            <div class="body-content">
                <div class="actions-bar">
                    <button class="btn-small" onclick="adicionarMateriaLinha(${c.id})"><span class="material-icons">add</span> Adicionar Matéria</button>
                    ${!c.ativo ? `<button class="btn-small btn-activate" onclick="ativarConcurso(${c.id})">Tornar Ativo</button>` : ''}
                </div>
                <table class="materias-table">
                    <thead>
                        <tr>
                            <th>Matéria</th>
                            <th width="80">Peso</th>
                            <th width="80">Questões</th>
                            <th width="100">Horas</th>
                            <th width="60" style="text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-${c.id}">
                        <!-- Linhas carregadas via fetch separado -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return container;
}

window.toggleConcursoDetails = async function (id) {
    const body = document.getElementById(`body-${id}`);
    const icon = document.getElementById(`icon-${id}`);

    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.innerText = 'expand_less';
        await carregarMateriasConcurso(id);
    } else {
        body.style.display = 'none';
        icon.innerText = 'expand_more';
    }
}

async function carregarMateriasConcurso(concursoId) {
    const tbody = document.getElementById(`tbody-${concursoId}`);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/concursos/${concursoId}/ciclo-atual`);
        if (res.ok) {
            const dados = await res.json();
            renderizarTabelaMaterias(concursoId, dados);
        } else {
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar matérias.</td></tr>';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro de conexão.</td></tr>';
    }
}

function renderizarTabelaMaterias(concursoId, dados) {
    const tbody = document.getElementById(`tbody-${concursoId}`);
    tbody.innerHTML = '';

    // Atualiza header com dados frescos
    atualizarHeaderProgresso(concursoId, dados);

    dados.materias.forEach(m => {
        const tr = document.createElement('tr');
        tr.dataset.materiaId = m.materiaId;
        tr.dataset.vinculoId = m.id; // ID DO VINCULO

        const peso = m.peso || 1.0;
        const hora = m.metaHoras || 0;

        tr.innerHTML = `
            <td>${m.nomeMateria}</td>
            <td><input type="number" step="0.1" value="${peso}" class="inp-peso" onchange="validarLinha(${concursoId}, this)"></td>
            <td><input type="number" value="${m.questoesProva || 0}" class="inp-questoes"></td> 
            <td><input type="number" step="0.5" value="${hora.toFixed(1)}" class="inp-horas" onchange="validarTotal(${concursoId})"></td>
            <td style="text-align:right;">
               <button class="btn-icon-save" onclick="salvarLinha(${concursoId}, this, ${m.materiaId})" title="Salvar"><span class="material-icons">save</span></button>
               <button class="btn-icon-delete" onclick="removerMateria(${concursoId}, ${m.id})" title="Remover"><span class="material-icons">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Guardar Carga Horaria Total no dataset da tabela para validação
    tbody.dataset.totalCiclo = dados.cargaHorariaCiclo;
}

window.adicionarMateriaLinha = function (concursoId) {
    const tbody = document.getElementById(`tbody-${concursoId}`);
    const tr = document.createElement('tr');
    tr.className = 'new-row';

    // Dropdown de matérias
    let options = '<option value="">Selecione...</option>';
    materiasCache.forEach(mat => {
        options += `<option value="${mat.id}">${mat.nome}</option>`;
    });

    tr.innerHTML = `
        <td><select class="inp-materia-select">${options}</select></td>
        <td><input type="number" value="1.0" class="inp-peso" step="0.1"></td>
        <td><input type="number" value="0" class="inp-questoes"></td>
        <td><input type="number" value="0" class="inp-horas" step="0.5" onchange="validarTotal(${concursoId})"></td>
        <td style="text-align:right;">
            <button class="btn-icon-save" onclick="salvarNovaLinha(${concursoId}, this)"><span class="material-icons">save</span></button>
            <button class="btn-icon-delete" onclick="this.closest('tr').remove()"><span class="material-icons">close</span></button>
        </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
}

// Wrapper para validacao individual (chamado no onchange)
window.validarLinha = function (concursoId, input) {
    validarTotal(concursoId);
}

window.salvarLinha = async function (concursoId, btn, materiaId) {
    const tr = btn.closest('tr');
    const peso = parseFloat(tr.querySelector('.inp-peso').value) || 0;
    const questoes = parseInt(tr.querySelector('.inp-questoes').value) || 0;
    const horas = parseFloat(tr.querySelector('.inp-horas').value) || 0;

    // Validar Total antes de enviar
    if (!validarTotal(concursoId)) {
        alert("Soma de horas excede o limite do ciclo!");
        return;
    }

    const dto = {
        materiaId: materiaId,
        peso: peso,
        ordem: 1, // Default
        questoesProva: questoes,
        horasCiclo: horas
    };

    try {
        const res = await fetch(`${API_URL}/concursos/${concursoId}/materias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            // Sucesso visual
            btn.style.color = 'green';
            setTimeout(() => btn.style.color = '', 1000);

            // Recalcular Header
            carregarMateriasConcurso(concursoId); // Recarrega tudo para garantir sincronia
        } else {
            const txt = await res.text();
            alert("Erro ao salvar: " + txt);
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
}

window.salvarNovaLinha = async function (concursoId, btn) {
    const tr = btn.closest('tr');
    const select = tr.querySelector('.inp-materia-select');
    const materiaId = select.value;

    if (!materiaId) {
        alert("Selecione uma matéria.");
        return;
    }

    await window.salvarLinha(concursoId, btn, materiaId);
}

// Validação visual
window.validarTotal = function (concursoId) {
    const tbody = document.getElementById(`tbody-${concursoId}`);
    if (!tbody) return true;

    const limite = parseFloat(tbody.dataset.totalCiclo) || 24;
    const inputsHoras = tbody.querySelectorAll('.inp-horas');

    let soma = 0;
    inputsHoras.forEach(inp => soma += parseFloat(inp.value) || 0);

    const headerTxt = document.getElementById(`progresso-texto-${concursoId}`);
    const fill = document.getElementById(`progresso-fill-${concursoId}`);

    if (headerTxt) headerTxt.innerText = `Alocado: ${soma.toFixed(1)}h / ${limite}h`;

    // Update barra visual (somente visual)
    const pct = Math.min(100, (soma / limite) * 100);
    if (fill) {
        fill.style.width = `${pct}%`;
        fill.style.backgroundColor = (soma > limite) ? 'red' : '#4caf50';
    }

    return soma <= limite + 0.1; // Tolerância
}

function calcularProgressoSetup(c) {
    return { alocado: 0, total: c.cargaHorariaCiclo || 24, pct: 0 };
}

function atualizarHeaderProgresso(concursoId, dados) {
    let soma = 0;
    dados.materias.forEach(m => soma += (m.metaHoras || 0));

    const limite = dados.cargaHorariaCiclo;
    const pct = Math.min(100, (soma / limite) * 100);

    const headerTxt = document.getElementById(`progresso-texto-${concursoId}`);
    const fill = document.getElementById(`progresso-fill-${concursoId}`);

    if (headerTxt) headerTxt.innerText = `Alocado: ${soma.toFixed(1)}h / ${limite}h`;
    if (fill) fill.style.width = `${pct}%`;
}

// Remover
window.removerMateria = async function (concursoId, vinculoId) {
    if (!confirm("Remover esta matéria do concurso?")) return;

    try {
        const res = await fetch(`${API_URL}/concursos/vinculos/${vinculoId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            carregarMateriasConcurso(concursoId);
        } else {
            alert("Erro ao remover matéria.");
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
}
