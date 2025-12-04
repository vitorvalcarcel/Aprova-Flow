const API_URL = "http://localhost:8080";
let materiasCache = [];

// Variáveis do Cronômetro
let timerInterval;
let segundosTotais = 0;
let isRodando = false;
let horaInicioTimer = null; // Para armazenar quando começou o timer

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    carregarMaterias(); // Carrega para ambas as listas (manual e timer)
    
    // Define a data de hoje como padrão no Manual
    document.getElementById("manual-data").valueAsDate = new Date();
});

// --- LÓGICA DE ABAS ---
function mudarModo(modo) {
    if (isRodando && modo === 'manual') {
        alert("Pause ou pare o cronômetro antes de trocar de modo!");
        return;
    }

    // Atualiza visual dos botões
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Mostra/Esconde os painéis
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
    const materia = document.getElementById('timer-materia').value;
    if (!materia) {
        alert("Selecione uma matéria antes de iniciar!");
        return;
    }

    if (isRodando) return;
    
    // Se for a primeira vez iniciando (não é uma retomada de pausa), grava a hora
    if (segundosTotais === 0) {
        const agora = new Date();
        horaInicioTimer = agora.toTimeString().split(' ')[0]; // Formato HH:mm:ss
    }

    isRodando = true;
    
    // UI Updates
    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'flex';
    document.getElementById('timer-setup').style.opacity = '0.5'; // Deixa cinza pra indicar que travou
    document.getElementById('timer-setup').style.pointerEvents = 'none'; // Bloqueia clicks
    document.getElementById('timer-details').style.display = 'none'; // Garante que detalhes sumam
    
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
    
    // UI Updates
    document.getElementById('btnStart').style.display = 'none'; // Esconde botão iniciar
    document.getElementById('btnPause').style.display = 'none'; // Esconde botão pause
    
    // Mostra painel de detalhes
    document.getElementById('timer-details').style.display = 'block';

    document.getElementById('statusTimer').innerText = "Pausado - Preencha os dados abaixo";
    document.getElementById('statusTimer').style.color = "#ff9800";
}

function continuarCronometro() {
    // Retoma o timer e esconde os detalhes
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
    if(!confirm("Tem certeza que deseja descartar esse tempo de estudo?")) return;

    isRodando = false;
    clearInterval(timerInterval);
    segundosTotais = 0;
    horaInicioTimer = null;
    atualizarDisplayTimer();
    
    // Reseta UI
    document.getElementById('timer-details').style.display = 'none';
    document.getElementById('btnStart').style.display = 'flex';
    document.getElementById('btnPause').style.display = 'none';
    
    // Libera setup
    document.getElementById('timer-setup').style.opacity = '1';
    document.getElementById('timer-setup').style.pointerEvents = 'auto';
    document.getElementById('timer-materia').value = "";
    document.getElementById('timer-topico').innerHTML = '<option value="">(Opcional)</option>';

    // Limpa inputs do timer
    document.getElementById('timer-qFeitas').value = "";
    document.getElementById('timer-qCertas').value = "";
    document.getElementById('timer-anotacoes').value = "";

    document.getElementById('statusTimer').innerText = "Escolha a matéria e dê o play!";
    document.getElementById('statusTimer').style.color = "#888";
}

function atualizarDisplayTimer() {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    document.getElementById('display-horas').innerText = String(horas).padStart(2, '0');
    document.getElementById('display-minutos').innerText = String(minutos).padStart(2, '0');
    document.getElementById('display-segundos').innerText = String(segundos).padStart(2, '0');
}

// Converte segundos para string "HH:mm"
function getTempoFormatado() {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// --- API E DADOS ---

async function carregarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        materiasCache = await response.json();
        
        const selectTimer = document.getElementById("timer-materia");
        const selectManual = document.getElementById("manual-materia");
        
        // Limpa
        selectTimer.innerHTML = '<option value="">Selecione a Matéria...</option>';
        selectManual.innerHTML = '<option value="">Selecione...</option>';
        
        materiasCache.forEach(m => {
            // Popula Timer
            let opt1 = document.createElement("option");
            opt1.value = m.id;
            opt1.text = m.nome;
            selectTimer.add(opt1);

            // Popula Manual
            let opt2 = document.createElement("option");
            opt2.value = m.id;
            opt2.text = m.nome;
            selectManual.add(opt2);
        });
    } catch (error) {
        console.error("Erro ao carregar matérias:", error);
    }
}

function carregarTopicos(modo) {
    const idMateria = document.getElementById(`${modo}-materia`).value;
    const selectTopico = document.getElementById(`${modo}-topico`);
    selectTopico.innerHTML = '<option value="">(Opcional) Selecione...</option>';
    
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
    if (segundosTotais < 60) {
        alert("Estude pelo menos 1 minuto para registrar! 😉");
        return;
    }

    const registro = {
        data: new Date().toISOString().split('T')[0], // Hoje
        horaInicio: horaInicioTimer,
        materiaId: document.getElementById("timer-materia").value,
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
        horaInicio: document.getElementById("manual-horaInicio").value + ":00", // Adiciona segundos para compatibilidade
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
            alert(`✅ Estudo salvo com sucesso!\nTempo: ${registro.cargaHoraria}`);
            carregarDashboard();
            
            if (isTimer) {
                // Reseta Timer mas sem pedir confirmação pois já salvou
                isRodando = false;
                clearInterval(timerInterval);
                segundosTotais = 0;
                horaInicioTimer = null;
                atualizarDisplayTimer();
                
                // Reseta UI Timer
                document.getElementById('timer-details').style.display = 'none';
                document.getElementById('btnStart').style.display = 'flex';
                document.getElementById('timer-setup').style.opacity = '1';
                document.getElementById('timer-setup').style.pointerEvents = 'auto';
                document.getElementById('statusTimer').innerText = "Pronto para o próximo!";
                
                // Limpa campos
                document.getElementById('timer-qFeitas').value = "";
                document.getElementById('timer-qCertas').value = "";
                document.getElementById('timer-anotacoes').value = "";
            } else {
                document.getElementById("formManual").reset();
                document.getElementById("manual-data").valueAsDate = new Date();
            }
        } else {
            alert("Erro ao salvar. Verifique os dados.");
        }
    } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
    }
}