import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao, fecharModal } from './utils.js';
import { state, setMateriasCache, setTiposEstudoCache } from './state.js';

// --- GERENCIAR MATÉRIAS ---

export async function carregarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        const data = await response.json();
        setMateriasCache(data);

        // Update filters and edit modal (still using selects)
        const selects = ['filtro-materia', 'edit-materia', 'topico-materia-pai'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const valorAtual = el.value;
            el.innerHTML = id.includes('filtro') ? '<option value="">Todas Matérias</option>' : '<option value="">Selecione...</option>';
            data.forEach(m => {
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

function renderizarGerenciarMaterias() {
    const lista = document.getElementById('lista-materias-gerenciar');
    if (!lista) return;
    lista.innerHTML = '';

    state.materiasCache.forEach(m => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>${m.nome}</span>
                <div class="actions">
                    <button class="btn-icon-small" onclick="event.stopPropagation(); abrirModalMateria(${m.id}, '${m.nome}')"><span class="material-icons">edit</span></button>
                    <button class="btn-icon-small delete" onclick="event.stopPropagation(); excluirMateria(${m.id})"><span class="material-icons">delete</span></button>
                    <button class="btn-icon-small" onclick="event.stopPropagation(); abrirModalTopico(${m.id})"><span class="material-icons">add</span> Tópico</button>
                </div>
            </div>
            <div class="accordion-body">
                ${m.topicos ? m.topicos.map(t => `
                    <div class="topic-item">
                        <span>${t.numeroEdital ? t.numeroEdital + '. ' : ''}${t.descricao}</span>
                        <div class="actions">
                            <button class="btn-icon-small" onclick="abrirModalTopico(${m.id}, ${t.id}, '${t.descricao}', '${t.numeroEdital || ''}')"><span class="material-icons">edit</span></button>
                            <button class="btn-icon-small delete" onclick="excluirTopico(${t.id})"><span class="material-icons">delete</span></button>
                        </div>
                    </div>
                `).join('') : '<p style="font-size:0.8em; color:#888;">Sem tópicos</p>'}
            </div>
        `;
        lista.appendChild(item);
    });
}

// Helper for accordion toggle (attached to window in app.js)
export function toggleAccordion(header) {
    const item = header.parentElement;
    item.classList.toggle('active');
}

export function abrirModalMateria(id = null, nome = '') {
    document.getElementById('materia-id').value = id || '';
    document.getElementById('materia-nome').value = nome;
    document.getElementById('modal-materia').style.display = 'flex';
}

export function fecharModalMateria() {
    document.getElementById('modal-materia').style.display = 'none';
}

export async function salvarMateria(e) {
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

export async function excluirMateria(id) {
    confirmarAcao("Excluir matéria apagará todos os tópicos e estudos relacionados. Continuar?", async () => {
        await fetch(`${API_URL}/materias/${id}`, { method: 'DELETE' });
        carregarMaterias();
    });
}

// --- GERENCIAR TÓPICOS ---

export function abrirModalTopico(materiaId, id = null, nome = '', numero = '') {
    document.getElementById('topico-id').value = id || '';
    document.getElementById('topico-materia-pai').value = materiaId;
    document.getElementById('topico-nome').value = nome;
    document.getElementById('topico-numero').value = numero;

    const select = document.getElementById('topico-materia-pai');
    select.innerHTML = '';
    state.materiasCache.forEach(m => {
        let opt = document.createElement("option");
        opt.value = m.id;
        opt.text = m.nome;
        select.add(opt);
    });
    select.value = materiaId;

    document.getElementById('modal-topico').style.display = 'flex';
}

export function fecharModalTopico() {
    document.getElementById('modal-topico').style.display = 'none';
}

export async function salvarTopico(e) {
    e.preventDefault();
    const id = document.getElementById('topico-id').value;
    const materiaId = document.getElementById('topico-materia-pai').value;
    const descricao = document.getElementById('topico-nome').value;
    const numeroEdital = document.getElementById('topico-numero').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/topicos/${id}` : `${API_URL}/topicos`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao, numeroEdital, materia: { id: materiaId } })
        });
        if (response.ok) {
            fecharModalTopico();
            carregarMaterias();
        }
    } catch (e) { console.error(e); }
}

export async function excluirTopico(id) {
    confirmarAcao("Excluir tópico? Estudos vinculados serão perdidos.", async () => {
        await fetch(`${API_URL}/topicos/${id}`, { method: 'DELETE' });
        carregarMaterias();
    });
}

// --- GERENCIAR TIPOS ---

export async function carregarTiposEstudo() {
    try {
        const response = await fetch(`${API_URL}/tipos-estudo`);
        const data = await response.json();
        setTiposEstudoCache(data);

        const selects = ['filtro-tipo', 'edit-tipo'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const valorAtual = el.value;
            el.innerHTML = id.includes('filtro') ? '<option value="">Todos Tipos</option>' : '<option value="">Selecione...</option>';
            data.forEach(t => {
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

function renderizarGerenciarTipos() {
    const lista = document.getElementById('lista-tipos-gerenciar');
    if (!lista) return;
    lista.innerHTML = '';
    state.tiposEstudoCache.forEach(t => {
        const item = document.createElement('div');
        item.className = 'card-simple'; // Matches CSS
        item.innerHTML = `
            <span>${t.nome}</span>
            <div class="actions">
                <button class="btn-icon-small" onclick="abrirModalTipo(${t.id}, '${t.nome}')"><span class="material-icons">edit</span></button>
                <button class="btn-icon-small delete" onclick="excluirTipo(${t.id})"><span class="material-icons">delete</span></button>
            </div>
        `;
        lista.appendChild(item);
    });
}

export function abrirModalTipo(id = null, nome = '') {
    document.getElementById('tipo-id').value = id || '';
    document.getElementById('tipo-nome').value = nome;
    document.getElementById('modal-tipo').style.display = 'flex';
}

export function fecharModalTipo() {
    document.getElementById('modal-tipo').style.display = 'none';
}

export async function salvarTipo(e) {
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

export async function excluirTipo(id) {
    confirmarAcao("Tem certeza que deseja excluir este tipo de estudo?", async () => {
        await fetch(`${API_URL}/tipos-estudo/${id}`, { method: 'DELETE' });
        carregarTiposEstudo();
    });
}
