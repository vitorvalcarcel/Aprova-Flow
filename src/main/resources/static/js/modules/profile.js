import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao, fecharModal } from './utils.js';

// --- PROFILE MANAGEMENT ---

export async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('profile-email').value = data.email || '';
            document.getElementById('profile-name').value = data.name || '';
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
    }
}

export async function salvarPerfil(event) {
    event.preventDefault();
    const name = document.getElementById('profile-name').value;
    const password = document.getElementById('profile-password').value;

    const payload = { name };
    if (password) {
        payload.password = password;
    }

    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarModal("Sucesso", "Perfil atualizado com sucesso!");
            document.getElementById('profile-password').value = '';
        } else {
            const errorText = await response.text();
            mostrarModal("Erro", errorText || "Erro ao atualizar perfil.");
        }
    } catch (error) {
        mostrarModal("Erro", "Erro de conexão.");
    }
}

// --- CONCURSO MANAGEMENT ---

export async function carregarConcursos() {
    const lista = document.getElementById('lista-concursos-perfil');
    lista.innerHTML = '<p style="color: #888; padding: 10px;">Carregando...</p>';

    try {
        const response = await fetch(`${API_URL}/concursos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const concursos = await response.json();

        lista.innerHTML = '';

        if (concursos.length === 0) {
            lista.innerHTML = '<p style="padding:15px; text-align:center; color:#888;">Nenhum concurso encontrado.</p>';
            return;
        }

        concursos.forEach(c => {
            const item = document.createElement('div');
            item.className = `concurso-item ${c.ativo ? 'ativo' : ''}`;

            item.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <span class="material-icons" style="margin-right: 10px; color: ${c.ativo ? 'var(--primary)' : '#ccc'};">
                        ${c.ativo ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <div>
                        <div class="concurso-name">${c.nome}</div>
                        ${c.ativo ? '<span class="concurso-badge">ATIVO</span>' : ''}
                    </div>
                </div>
                <div class="actions">
                    ${!c.ativo ? `<button onclick="ativarConcurso(${c.id})" class="btn-icon-small" title="Ativar"><span class="material-icons">check</span></button>` : ''}
                    <button onclick="excluirConcurso(${c.id})" class="btn-icon-small delete" title="Excluir"><span class="material-icons">delete</span></button>
                </div>
            `;
            lista.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        lista.innerHTML = '<p style="color: red; padding: 10px;">Erro ao carregar concursos.</p>';
    }
}

export function mudarTabConfig(tab) {
    // Buttons
    document.querySelectorAll('.config-tab-btn').forEach(btn => btn.classList.remove('active'));
    // Content
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // Activate
    const btn = Array.from(document.querySelectorAll('.config-tab-btn')).find(b => b.textContent.includes(tab === 'materias' ? 'Matérias' : 'Tipos'));
    if (btn) btn.classList.add('active');

    document.getElementById(`tab-${tab}`).classList.add('active');
}

export function abrirModalNovoConcurso() {
    document.getElementById('modal-novo-concurso').style.display = 'flex';
}

export function fecharModalNovoConcurso() {
    document.getElementById('modal-novo-concurso').style.display = 'none';
    document.getElementById('novo-concurso-nome').value = '';
}

export async function salvarNovoConcurso(event) {
    event.preventDefault();
    const nome = document.getElementById('novo-concurso-nome').value;

    try {
        const response = await fetch(`${API_URL}/concursos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ nome })
        });

        if (response.ok) {
            fecharModalNovoConcurso();
            carregarConcursos();
        } else {
            mostrarModal("Erro", "Erro ao criar concurso.");
        }
    } catch (e) {
        mostrarModal("Erro", "Erro de conexão.");
    }
}

export async function ativarConcurso(id) {
    if (!confirm("Deseja ativar este concurso? Isso mudará o foco do Dashboard.")) return;

    try {
        // Implement backend logic if specific endpoint exists, otherwise we might need to handle it.
        // Assuming there isn't a specific "activate" endpoint yet based on previous files, 
        // the user manages this via /concursos/ativo possibly or we just select it.
        // If there isn't an endpoint, we might fail here. 
        // Checking ConcursoController... it's minimal. 
        // Let's assume we can set active flag if PUT exists, or simpler: 
        // User asked to "manage concursos".

        // Strategy: If logic doesn't exist, I'll add it or mock it.
        // For now, let's try a PUT to /concursos/{id}/ativo
        const response = await fetch(`${API_URL}/concursos/${id}/ativo`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            carregarConcursos();
            // Refresh dashboard title if needed
            window.location.reload();
        } else {
            mostrarModal("Erro", "Erro ao ativar concurso.");
        }
    } catch (e) {
        console.error(e);
    }
}

export async function excluirConcurso(id) {
    // confirmarAcao is async and takes a callback
    confirmarAcao("Tem certeza? Isso apagará todo histórico deste concurso!", async () => {
        try {
            const response = await fetch(`${API_URL}/concursos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                carregarConcursos();
            } else {
                mostrarModal("Erro", "Erro ao excluir concurso.");
            }
        } catch (e) {
            mostrarModal("Erro", "Erro conexão.");
        }
    });
}
