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
        document.getElementById('lista-concursos-perfil').innerHTML = '<p style="text-align:center;color:red;">Erro ao carregar</p>';
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

        const activeBadge = c.ativo
            ? '<span class="badge-active">ATIVO</span>'
            : '';

        // Botão Play ou Pause logic
        const toggleBtn = !c.ativo
            ? `<button onclick="ativarConcurso(${c.id})" class="btn-icon-subtle active-toggle" title="Ativar"><span class="material-icons">play_circle</span></button>`
            : `<button class="btn-icon-subtle" title="Já está ativo (clique para pausar - futuro)" disabled><span class="material-icons" style="color:#ccc">check_circle</span></button>`;

        item.innerHTML = `
            <div class="concurso-info">
                <strong>${c.nome} ${activeBadge}</strong>
                <span>Carga Ciclo: ${c.cargaHorariaCiclo || '-'}h</span>
            </div>
            <div class="concurso-actions">
                ${toggleBtn}
                <button onclick="abrirConfigConcurso(${c.id})" class="btn-icon-subtle" title="Configurar Matérias"><span class="material-icons">settings</span></button>
                <button onclick="excluirConcurso(${c.id})" class="btn-icon-subtle delete" title="Excluir"><span class="material-icons">delete</span></button>
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
    ul.innerHTML = '<li style="padding:10px;">Carregando...</li>';

    try {
        const res = await fetch(`${API_URL}/concursos/${id}/ciclo-atual`);
        if (!res.ok) throw new Error();
        const ciclo = await res.json();

        ul.innerHTML = '';
        if (ciclo.materias && ciclo.materias.length > 0) {
            ciclo.materias.sort((a, b) => a.ordem - b.ordem).forEach(m => {
                const li = document.createElement('li');
                li.className = 'linked-materia-item';
                li.innerHTML = `
                    <div>
                        <span class="materia-name">${m.nomeMateria}</span>
                        <span class="materia-meta">Peso ${m.peso}</span>
                    </div>
                    <span class="status-ok" style="font-size:0.75rem;">Vinculado</span>
                `;
                ul.appendChild(li);
            });
        } else {
            ul.innerHTML = '<li style="padding:15px; color:#888; text-align:center;">Nenhuma matéria vinculada. Adicione acima.</li>';
        }
    } catch (e) {
        ul.innerHTML = '<li style="padding:10px; color:red;">Erro ao carregar vinculadas ou ciclo zerado.</li>';
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
