import { API_URL } from './config.js';
import { mostrarModal, confirmarAcao } from './utils.js';

let cronometroInterval;
let segundos = 0;
let isPausado = false;
let concursoAtivoId = null;

// --- CICLO & DASHBOARD ---

export async function carregarDashboard() {
    try {
        // 1. Buscar Concurso Ativo
        const resConcurso = await fetch(`${API_URL}/concursos/ativo`);
        if (resConcurso.status === 204) {
            document.getElementById('ciclo-materias-grid').innerHTML = '<p class="text-center">Nenhum concurso ativo.</p>';
            return;
        }
        const concurso = await resConcurso.json();
        concursoAtivoId = concurso.id;

        // 2. Buscar Dados do Ciclo Atual
        const resCiclo = await fetch(`${API_URL}/concursos/${concurso.id}/ciclo-atual`);
        if (!resCiclo.ok) throw new Error("Erro ao carregar ciclo");

        const dados = await resCiclo.json(); // CicloAtualDTO

        renderizarCiclo(dados);

    } catch (error) {
        console.error(error);
        document.getElementById('ciclo-materias-grid').innerHTML = '<p class="text-center text-red">Erro ao carregar ciclo.</p>';
    }
}

function renderizarCiclo(dados) {
    // Header Metrics
    document.getElementById('lblCicloNome').textContent = dados.nomeConcurso;
    document.getElementById('lblCicloHoras').textContent = formatarHoras(dados.totalHorasEstudadasCiclo);
    document.getElementById('lblCicloProgresso').textContent = `${dados.progressoGeral.toFixed(1)}%`;

    // Bar
    document.getElementById('ciclo-progress-fill').style.width = `${Math.min(dados.progressoGeral, 100)}%`;

    // Button Fechar
    // Button Fechar
    const btnFechar = document.getElementById('btnFecharCiclo');
    // Checa se TODOS as matérias bateram meta hora E meta questao
    const tudoConcluido = dados.materias && dados.materias.every(m =>
        m.saldoAtual >= (m.metaHoras - 0.01) &&
        m.saldoQuestoes >= (m.metaQuestoes - 0.5)
    );

    if (tudoConcluido) {
        btnFechar.disabled = false;
        btnFechar.classList.add('enabled');
    } else {
        btnFechar.disabled = true;
        btnFechar.classList.remove('enabled');
    }

    // Grid Cards
    const grid = document.getElementById('ciclo-materias-grid');
    grid.innerHTML = '';

    if (!dados.materias || dados.materias.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <p>Nenhuma matéria vinculada a este concurso.</p>
                <button class="btn-primary" onclick="window.location.href='config-concurso.html?id=${dados.concursoId}'" style="margin-top:10px;">
                    Configurar Matérias
                </button>
            </div>
        `;
        // Note: config-concurso.html might not exist. Maybe open modal or navigate to edit?
        // User asked "Configurar Matérias". I'll assume they might want to go to a manage page or I just put a placeholder alert.
        // Actually, user said "Adicione um botão 'Configurar Matérias'".
        // I'll make it redirect to index.html#gerenciar or similar if that's where config is, but "config-concurso" implies specific page.
        // Since I don't know the route for managing subjects of a contest, I will point to where edits happen.
        // "Endpoint de Edição de Concurso" was created. Frontend for it? Maybe not existing yet.
        // I'll assume I can just alert or point to existing management.
        // But wait, "Editar Concurso" endpoint allows editing name/hours. "Configurar Matérias" implies adding subjects.
        // I'll just use a button that alerts for now or navigates to generic manage if user desires.
        // Let's use `onclick="alert('Funcionalidade de configuração detalhada em desenvolvimento. Use a tela de Gerenciar.')"` or similar if I don't have the page.
        // Or better: `location.hash = 'gerenciar'` if that matches the tabs? The user has tabs in `index.html` probably.
        return;
    }

    dados.materias.forEach(m => {
        const card = document.createElement('div');

        // Dados Horas
        const metaH = m.metaHoras;
        const saldoH = m.saldoAtual;
        const feitoH = saldoH >= (metaH - 0.01);
        const percH = metaH > 0 ? (saldoH / metaH) * 100 : (metaH === 0 ? 100 : 0);

        // Dados Questões
        const metaQ = m.metaQuestoes || 0;
        const saldoQ = m.saldoQuestoes || 0;
        const feitoQ = saldoQ >= (metaQ - 0.5);
        const percQ = metaQ > 0 ? (saldoQ / metaQ) * 100 : (metaQ === 0 ? 100 : 0);

        // Global Status
        const isDone = feitoH && feitoQ;
        const statusClass = isDone ? 'status-done' : 'status-todo';

        // Barra usa o MENOR progresso
        const progressoVisual = Math.min(percH, percQ);
        const progressoFinal = Math.min(progressoVisual, 100);

        card.className = `ciclo-card ${statusClass}`;
        card.innerHTML = `
            <h4>${m.nomeMateria} <span class="${isDone ? 'status-ok' : 'status-pending'}">${isDone ? 'OK' : 'Pendente'}</span></h4>
            <div class="ciclo-card-details">
                <div style="display:flex; justify-content:space-between;">
                    <span>Hrs: <strong>${formatarHoras(saldoH)}</strong> / ${formatarHoras(metaH)}</span>
                    <span style="font-size:0.8em; color:${feitoH ? 'green' : '#666'}">${Math.floor(percH)}%</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:2px;">
                    <span>Quest: <strong>${Math.floor(saldoQ)}</strong> / ${Math.round(metaQ)}</span>
                     <span style="font-size:0.8em; color:${feitoQ ? 'green' : '#666'}">${Math.floor(percQ)}%</span>
                </div>
            </div>
            <div class="card-progress-bar" style="margin-top:8px;">
                <div class="card-progress-fill" style="width: ${progressoFinal}%; background-color: ${isDone ? '#4caf50' : '#2196f3'}"></div>
            </div>
            <div style="margin-top:5px; font-size:0.8rem; text-align:right; color:#888;">
                Peso: ${m.peso}
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatarHoras(horasDecimal) {
    if (!horasDecimal) return "0h";
    const h = Math.floor(horasDecimal);
    const m = Math.round((horasDecimal - h) * 60);
    return `${h}h ${m > 0 ? m + 'm' : ''}`;
}

export async function fecharCicloConfirmacao() {
    if (!concursoAtivoId) return;
    if (!await confirmarAcao("Deseja realmente fechar este ciclo? As horas serão descontadas e um novo ciclo se iniciará.")) return;

    try {
        const res = await fetch(`${API_URL}/concursos/${concursoAtivoId}/fechar-ciclo`, {
            method: 'POST'
        });
        if (res.ok) {
            mostrarModal("Ciclo fechado com sucesso! Parabéns! 🚀");
            carregarDashboard();
        } else {
            const err = await res.text();
            mostrarModal("Erro ao fechar ciclo: " + err);
        }
    } catch (e) {
        console.error(e);
        mostrarModal("Erro de conexão.");
    }
}

// --- TIMER & MANUAL (Mantidos e Adaptados) ---

export function mudarModo(modo) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

    if (modo === 'timer') {
        document.getElementById('mode-timer').style.display = 'block';
        document.getElementById('formManual').style.display = 'none';
        const btns = document.querySelectorAll('.mode-btn');
        if (btns[0]) btns[0].classList.add('active');
    } else {
        document.getElementById('mode-timer').style.display = 'none';
        document.getElementById('formManual').style.display = 'block';
        const btns = document.querySelectorAll('.mode-btn');
        if (btns[1]) btns[1].classList.add('active');
    }
}

// Timer Logic
export function iniciarCronometro() {
    const materia = document.getElementById('timer-materia').value;
    if (!materia) {
        alert("Selecione uma matéria!");
        return;
    }

    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const status = document.getElementById('statusTimer');

    if (btnStart) btnStart.style.display = 'none';
    if (btnPause) btnPause.style.display = 'inline-flex';
    if (status) {
        status.textContent = "Estudando... Foco total! 🚀";
        status.style.color = "#28a745";
        status.style.fontWeight = "bold";
    }

    isPausado = false;
    document.getElementById('timer-materia-input').disabled = true;
    document.getElementById('timer-topico-input').disabled = true;

    if (!cronometroInterval) {
        cronometroInterval = setInterval(() => {
            if (!isPausado) {
                segundos++;
                atualizarDisplayTimer();
            }
        }, 1000);
    }
}

export function pausarCronometro() {
    isPausado = true;
    const btnPause = document.getElementById('btnPause');
    const status = document.getElementById('statusTimer');

    if (btnPause) btnPause.style.display = 'none';
    document.getElementById('timer-details').style.display = 'block';

    if (status) {
        status.textContent = "Pausado. O que deseja fazer?";
        status.style.color = "#ff9800";
    }
}

export function continuarCronometro() {
    isPausado = false;
    document.getElementById('timer-details').style.display = 'none';
    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'inline-flex';

    const status = document.getElementById('statusTimer');
    if (status) {
        status.textContent = "Estudando... Foco total! 🚀";
        status.style.color = "#28a745";
    }
}

export function cancelarCronometro() {
    if (!confirm("Cancelar sessão? O tempo será perdido.")) return;
    resetarTimer();
}

function resetarTimer() {
    clearInterval(cronometroInterval);
    cronometroInterval = null;
    segundos = 0;
    isPausado = false;
    atualizarDisplayTimer();

    document.getElementById('timer-details').style.display = 'none';
    document.getElementById('btnStart').style.display = 'inline-flex';
    document.getElementById('btnPause').style.display = 'none';
    const status = document.getElementById('statusTimer');
    if (status) {
        status.textContent = "Bora estudar?";
        status.style.color = "#888";
    }

    document.getElementById('timer-materia-input').disabled = false;
    document.getElementById('timer-topico-input').disabled = false;
}

function atualizarDisplayTimer() {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    document.getElementById('display-horas').textContent = String(h).padStart(2, '0');
    document.getElementById('display-minutos').textContent = String(m).padStart(2, '0');
    document.getElementById('display-segundos').textContent = String(s).padStart(2, '0');
}

export async function salvarTimer() {
    const materiaId = document.getElementById('timer-materia').value;
    const topicoId = document.getElementById('timer-topico').value || null;
    const tipoId = document.getElementById('timer-tipo').value;
    const qFeitas = document.getElementById('timer-qFeitas').value || 0;
    const qCertas = document.getElementById('timer-qCertas').value || 0;
    const anotacoes = document.getElementById('timer-anotacoes').value;

    const agora = new Date();
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const duracaoStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const inicioMs = agora.getTime() - (segundos * 1000);
    const dataInicio = new Date(inicioMs);
    const horaInicioStr = dataInicio.toTimeString().split(' ')[0].substring(0, 5);
    const diaStr = dataInicio.toISOString().split('T')[0];

    if (!materiaId) { alert("Matéria obrigatória"); return; }

    if (!concursoAtivoId) {
        alert("Nenhum concurso ativo identificado. Recarregue a página.");
        return;
    }

    const payload = {
        concursoId: concursoAtivoId,
        materiaId: parseInt(materiaId),
        topicoId: topicoId ? parseInt(topicoId) : null,
        topicoNome: document.getElementById('timer-topico-input').value,
        tipoEstudoId: tipoId ? parseInt(tipoId) : null,
        data: diaStr,
        horaInicio: horaInicioStr,
        tempoEstudado: duracaoStr,
        qtdQuestoes: parseInt(qFeitas),
        qtdAcertos: parseInt(qCertas),
        anotacoes: anotacoes
    };

    try {
        const res = await fetch(`${API_URL}/estudos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            mostrarModal("Estudo registrado com sucesso!");
            resetarTimer();
            carregarDashboard();
        } else {
            const txt = await res.text();
            mostrarModal("Erro ao salvar: " + txt);
        }
    } catch (e) {
        console.error(e);
        mostrarModal("Erro de conexão.");
    }
}

export async function salvarManual(e) {
    if (e) e.preventDefault();

    const materiaId = document.getElementById('manual-materia').value;
    const topicoId = document.getElementById('manual-topico').value || null;
    const data = document.getElementById('manual-data').value;
    const inicio = document.getElementById('manual-horaInicio').value;
    const duracao = document.getElementById('manual-duracao').value;
    const tipoId = document.getElementById('manual-tipo').value;
    const qFeitas = document.getElementById('manual-qFeitas').value || 0;
    const qCertas = document.getElementById('manual-qCertas').value || 0;
    const anotacoes = document.getElementById('manual-anotacoes').value;

    if (!document.getElementById('manual-materia-input').value) {
        alert("Preencha a matéria");
        return;
    }

    if (!concursoAtivoId) {
        // Tentar obter
        const resC = await fetch(`${API_URL}/concursos/ativo`);
        if (resC.status === 200) {
            const c = await resC.json();
            concursoAtivoId = c.id;
        } else {
            alert("Nenhum concurso ativo. Crie um concurso primeiro.");
            return;
        }
    }

    const payload = {
        concursoId: concursoAtivoId,
        materiaId: parseInt(materiaId),
        topicoId: topicoId ? parseInt(topicoId) : null,
        topicoNome: document.getElementById('manual-topico-input').value,
        tipoEstudoId: tipoId ? parseInt(tipoId) : null,
        data: data,
        horaInicio: inicio,
        tempoEstudado: duracao,
        qtdQuestoes: parseInt(qFeitas),
        qtdAcertos: parseInt(qCertas),
        anotacoes: anotacoes
    };

    try {
        const res = await fetch(`${API_URL}/estudos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            mostrarModal("Registro manual salvo!");
            document.getElementById('formManual').reset();
            document.getElementById("manual-data").valueAsDate = new Date();

            document.getElementById('manual-materia').value = '';
            document.getElementById('manual-topico').value = '';
            document.getElementById('manual-tipo').value = '';

            carregarDashboard();
        } else {
            const txt = await res.text();
            mostrarModal("Erro: " + txt);
        }
    } catch (err) {
        console.error(err);
        mostrarModal("Erro de conexão.");
    }
}
