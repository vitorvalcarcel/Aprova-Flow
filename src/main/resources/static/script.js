const API_URL = "http://localhost:8080";
let materiasCache = [];

// Variáveis do Cronômetro
let timerInterval;
let segundosTotais = 0;
let isRodando = false;
let modoAtual = 'timer'; // 'timer' ou 'manual'

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    carregarMaterias();
    // Define a data de hoje como padrão
    document.getElementById("data").valueAsDate = new Date();
});

// --- LÓGICA DE ABAS ---
function mudarModo(modo) {
    modoAtual = modo;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Mostra/Esconde os painéis
    if (modo === 'timer') {
        document.getElementById('mode-timer').style.display = 'block';
        document.getElementById('mode-manual').style.display = 'none';
    } else {
        document.getElementById('mode-timer').style.display = 'none';
        document.getElementById('mode-manual').style.display = 'block';
    }
}

// --- LÓGICA DO CRONÔMETRO ---
function iniciarCronometro() {
    if (isRodando) return;
    
    isRodando = true;
    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = 'flex';
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
    document.getElementById('btnStart').style.display = 'flex';
    document.getElementById('btnStart').innerHTML = '<span class="material-icons">play_arrow</span> Continuar';
    document.getElementById('btnPause').style.display = 'none';
    document.getElementById('statusTimer').innerText = "Pausado";
    document.getElementById('statusTimer').style.color = "#ff9800";
}

function resetarCronometro() {
    pausarCronometro();
    segundosTotais = 0;
    atualizarDisplayTimer();
    document.getElementById('btnStart').innerHTML = '<span class="material-icons">play_arrow</span> Iniciar';
    document.getElementById('statusTimer').innerText = "Pronto para começar";
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

// Converte segundos para string "HH:mm" (formato que o backend espera)
function getTempoFormatado() {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// --- FUNÇÕES DE API E FORMULÁRIO ---

async function carregarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        materiasCache = await response.json();
        const select = document.getElementById("materia");
        select.innerHTML = '<option value="">Selecione...</option>';
        
        materiasCache.forEach(m => {
            let option = document.createElement("option");
            option.value = m.id;
            option.text = m.nome;
            select.add(option);
        });
    } catch (error) {
        console.error("Erro ao carregar matérias:", error);
    }
}

function carregarTopicos() {
    const materiaId = document.getElementById("materia").value;
    const selectTopico = document.getElementById("topico");
    selectTopico.innerHTML = '<option value="">(Opcional)</option>';
    
    if (!materiaId) return;

    const materiaSelecionada = materiasCache.find(m => m.id == materiaId);
    if (materiaSelecionada && materiaSelecionada.topicos) {
        materiaSelecionada.topicos.forEach(t => {
            let option = document.createElement("option");
            option.value = t.id;
            // Mostra número e descrição curta
            option.text = `${t.numeroEdital}. ${t.descricao.substring(0, 50)}...`;
            selectTopico.add(option);
        });
    }
}

function toggleQuestoes() {
    const tipo = document.getElementById("tipo").value;
    const div = document.getElementById("areaQuestoes");
    // Mostra se for Questões, Simulado ou Revisão
    div.style.display = (tipo === "Questões" || tipo === "Revisão" || tipo === "Simulado") ? "block" : "none";
}

async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/estudos/dashboard`);
        const data = await response.json();
        document.getElementById("lblHoras").innerText = data.totalHorasCiclo || "00:00";
        document.getElementById("lblMensagem").innerText = data.mensagemMotivacional;
    } catch (e) { console.error(e); }
}

// --- SALVAR ---
document.getElementById("formEstudo").addEventListener("submit", async (e) => {
    e.preventDefault();

    let cargaFinal = "";

    // Decide de onde pegar a hora
    if (modoAtual === 'timer') {
        if (segundosTotais < 60) {
            alert("Estude pelo menos 1 minuto para registrar! 😉");
            return;
        }
        cargaFinal = getTempoFormatado();
        pausarCronometro(); // Pausa para salvar
    } else {
        const manualInput = document.getElementById("cargaManual").value;
        if (!manualInput) {
            alert("Por favor, informe a duração no modo manual.");
            return;
        }
        cargaFinal = manualInput;
    }

    const registro = {
        data: document.getElementById("data").value,
        materiaId: document.getElementById("materia").value,
        topicoId: document.getElementById("topico").value || null,
        tipoEstudo: document.getElementById("tipo").value,
        cargaHoraria: cargaFinal,
        questoesFeitas: document.getElementById("qFeitas").value || 0,
        questoesCertas: document.getElementById("qCertas").value || 0
    };

    try {
        const response = await fetch(`${API_URL}/estudos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            alert(`✅ Estudo salvo com sucesso!\nTempo: ${cargaFinal}`);
            carregarDashboard();
            resetarCronometro();
            document.getElementById("formEstudo").reset();
            document.getElementById("data").valueAsDate = new Date();
        } else {
            alert("Erro ao salvar. Verifique se preencheu a matéria.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    }
});