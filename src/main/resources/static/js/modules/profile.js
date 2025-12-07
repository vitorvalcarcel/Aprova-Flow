import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao } from './utils.js';

// --- PERFIL ---
export function loadProfile() {
    carregarConcursos();
}

export async function salvarPerfil(e) {
    if (e) e.preventDefault();
    mostrarModal("Funcionalidade de editar perfil em desenvolvimento.");
}

// --- CONCURSOS ---

export async function carregarConcursos() {
    try {
        const res = await fetch(`${API_URL}/concursos`);
        const concursos = await res.json();
        renderizarListaConcursos(concursos);
    } catch (e) {
        console.error(e);
    }
}

function renderizarListaConcursos(lista) {
    const div = document.getElementById('lista-concursos-perfil');
    div.innerHTML = '';

    if (lista.length === 0) {
        div.innerHTML = '<p style="padding:15px; text-align:center; color:#888;">Nenhum concurso cadastrado.</p>';
        return;
    }

    lista.forEach(c => {
        const item = document.createElement('div');
        item.className = 'concurso-item';
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #eee';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        const activeBadge = c.ativo ? '<span style="color:#4caf50; font-size:0.8rem; border:1px solid #4caf50; padding:2px 6px; border-radius:4px;">ATIVO</span>' : '';

        item.innerHTML = `
            <div>
                <strong style="font-size:1.1rem; color: #333;">${c.nome}</strong>
                ${activeBadge}
                <div style="font-size:0.85rem; color:#666;">Carga Ciclo: ${c.cargaHorariaCiclo || '-'}h</div>
            </div>
            <div style="display:flex; gap:10px;">
                ${!c.ativo ? `<button onclick="ativarConcurso(${c.id})" style="border:none; background:none; cursor:pointer; color:#4caf50;" title="Ativar"><span class="material-icons">play_circle</span></button>` : ''}
                <button onclick="abrirConfigConcurso(${c.id})" style="border:none; background:none; cursor:pointer; color:#ff9800;" title="Configurar Matérias"><span class="material-icons">settings</span></button>
                <button onclick="excluirConcurso(${c.id})" style="border:none; background:none; cursor:pointer; color:#f44336;" title="Excluir"><span class="material-icons">delete</span></button>
            </div>
        `;
        div.appendChild(item);
    });
}

// Criar Concurso
export function abrirModalNovoConcurso() {
    document.getElementById('modal-novo-concurso').style.display = 'flex';
}
export function fecharModalNovoConcurso() {
    document.getElementById('modal-novo-concurso').style.display = 'none';
}

export async function salvarNovoConcurso(e) {
    e.preventDefault();
    const nome = document.getElementById('novo-concurso-nome').value;
    const carga = document.getElementById('novo-concurso-carga').value;

    await criarConcurso(nome, carga);
    fecharModalNovoConcurso();
}

export async function salvarConcursoInicial(e) {
    e.preventDefault();
    const nome = document.getElementById('concurso-nome-inicial').value;
    const carga = document.getElementById('concurso-carga-inicial').value;

    if (await criarConcurso(nome, carga)) {
        document.getElementById('modal-concurso').style.display = 'none';
        window.location.reload();
    }
}

async function criarConcurso(nome, carga) {
    const payload = {
        nome: nome,
        cargaHorariaCiclo: parseFloat(carga) || 24.0,
        questoesIncremento: 10,
        questoesMetaInicial: 20
    };

    try {
        const res = await fetch(`${API_URL}/concursos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            carregarConcursos();
            return true;
        } else {
            alert("Erro ao criar concurso.");
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function ativarConcurso(id) {
    try {
        await fetch(`${API_URL}/concursos/${id}/ativo`, { method: 'PUT' });
        carregarConcursos();
    } catch (e) { console.error(e); }
}

export async function excluirConcurso(id) {
    if (!await confirmarAcao("Excluir concurso? Isso apagará todos os registros vinculados.")) return;
    try {
        await fetch(`${API_URL}/concursos/${id}`, { method: 'DELETE' });
        carregarConcursos();
    } catch (e) { console.error(e); }
}

// --- CONFIGURAÇÃO DE MATÉRIAS DO CONCURSO ---

let concursoConfigId = null;

export async function abrirConfigConcurso(id) {
    concursoConfigId = id;
    document.getElementById('config-concurso-id').value = id;
    document.getElementById('modal-config-concurso').style.display = 'flex';

    // Preencher Select de Matérias
    const select = document.getElementById('config-select-materia');
    select.innerHTML = '<option value="">Carregando...</option>';

    try {
        const resM = await fetch(`${API_URL}/materias`);
        const materias = await resM.json();

        select.innerHTML = '';
        materias.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nome;
            select.appendChild(opt);
        });

    } catch (e) {
        select.innerHTML = '<option>Erro ao carregar</option>';
    }

    carregarMateriasVinculadas(id);
}

async function carregarMateriasVinculadas(id) {
    const ul = document.getElementById('lista-materias-config');
    ul.innerHTML = '<li>Carregando...</li>';

    try {
        const res = await fetch(`${API_URL}/concursos/${id}/ciclo-atual`);
        if (!res.ok) throw new Error();
        const ciclo = await res.json();

        ul.innerHTML = '';
        if (ciclo.materias && ciclo.materias.length > 0) {
            ciclo.materias.sort((a, b) => a.ordem - b.ordem).forEach(m => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #f0f0f0';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.innerHTML = `
                    <span>${m.nomeMateria} <small style="color:#888;">(Peso ${m.peso}, Ordem ${m.ordem})</small></span>
                    <span style="color:#888; font-size:0.8rem;">Vinculado</span>
                `;
                ul.appendChild(li);
            });
        } else {
            ul.innerHTML = '<li style="padding:10px; color:#888;">Nenhuma matéria vinculada. Adicione acima.</li>';
        }
    } catch (e) {
        ul.innerHTML = '<li>Erro ao carregar vinculadas ou ciclo zerado.</li>';
    }
}

export function fecharModalConfigConcurso() {
    document.getElementById('modal-config-concurso').style.display = 'none';
    concursoConfigId = null;
}

export async function vincularMateriaAoConcurso() {
    const materiaId = document.getElementById('config-select-materia').value;
    const peso = document.getElementById('config-peso').value;

    if (!materiaId) { alert("Selecione uma matéria"); return; }

    try {
        const payload = {
            materiaId: parseInt(materiaId),
            peso: parseFloat(peso),
            ordem: 1 // Default
        };

        const res = await fetch(`${API_URL}/concursos/${concursoConfigId}/materias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            carregarMateriasVinculadas(concursoConfigId);
        } else {
            alert("Erro ao vincular");
        }
    } catch (e) {
        console.error(e);
    }
}

// --- CONFIGURAÇÃO TABS ---
export function mudarTabConfig(tab) {
    document.querySelectorAll('.config-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    const buttons = document.querySelectorAll('.config-tab-btn');
    if (tab === 'materias') {
        buttons[0].classList.add('active');
        document.getElementById('tab-materias').classList.add('active');
    } else {
        buttons[1].classList.add('active');
        document.getElementById('tab-tipos').classList.add('active');
    }
}
