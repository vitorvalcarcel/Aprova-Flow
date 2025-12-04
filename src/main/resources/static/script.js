const API_URL = "http://localhost:8080";
let materiasCache = []; // Para guardar os tópicos na memória

// Ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    carregarMaterias();
    
    // Define a data de hoje no input automaticamente
    document.getElementById("data").valueAsDate = new Date();
});

// 1. Busca dados do Dashboard
async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}/estudos/dashboard`);
        const data = await response.json();
        
        document.getElementById("lblHoras").innerText = data.totalHorasCiclo;
        document.getElementById("lblMensagem").innerText = data.mensagemMotivacional;
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

// 2. Busca matérias para o Select
async function carregarMaterias() {
    try {
        const response = await fetch(`${API_URL}/materias`);
        materiasCache = await response.json();
        
        const select = document.getElementById("materia");
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

// 3. Carrega tópicos quando muda a matéria
function carregarTopicos() {
    const materiaId = document.getElementById("materia").value;
    const selectTopico = document.getElementById("topico");
    
    // Limpa anteriores
    selectTopico.innerHTML = '<option value="">Selecione...</option>';
    
    if (!materiaId) return;

    // Encontra a matéria na memória e pega os tópicos dela
    const materiaSelecionada = materiasCache.find(m => m.id == materiaId);
    
    if (materiaSelecionada && materiaSelecionada.topicos) {
        materiaSelecionada.topicos.forEach(t => {
            let option = document.createElement("option");
            option.value = t.id;
            // Mostra o número e um pedaço da descrição
            option.text = `${t.numeroEdital}. ${t.descricao.substring(0, 40)}...`; 
            option.title = t.descricao; // Tooltip com descrição completa
            selectTopico.add(option);
        });
    }
}

// 4. Mostra/Esconde campos de questões
function toggleQuestoes() {
    const tipo = document.getElementById("tipo").value;
    const divQuestoes = document.getElementById("areaQuestoes");
    
    if (tipo === "Questões" || tipo === "Simulado") {
        divQuestoes.style.display = "block";
    } else {
        divQuestoes.style.display = "none";
        document.getElementById("qFeitas").value = "";
        document.getElementById("qCertas").value = "";
    }
}

// 5. Salva o Estudo (POST)
document.getElementById("formEstudo").addEventListener("submit", async (e) => {
    e.preventDefault(); // Não recarrega a página

    const registro = {
        data: document.getElementById("data").value,
        materiaId: document.getElementById("materia").value,
        topicoId: document.getElementById("topico").value || null,
        cargaHoraria: document.getElementById("carga").value,
        tipoEstudo: document.getElementById("tipo").value,
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
            alert("Estudo registrado com sucesso! 📚");
            carregarDashboard(); // Atualiza as horas na hora
            // Opcional: Limpar formulário
            // document.getElementById("formEstudo").reset(); 
        } else {
            alert("Erro ao salvar. Verifique o console.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão com o servidor.");
    }
});