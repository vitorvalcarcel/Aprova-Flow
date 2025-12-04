import { state } from './state.js';

export function setupAutocomplete(baseId, type) {
    const input = document.getElementById(`${baseId}-input`);
    const hidden = document.getElementById(baseId);
    const list = document.getElementById(`${baseId}-list`);

    if (!input || !hidden || !list) return;

    input.addEventListener('input', function () {
        const val = this.value;
        const mode = baseId.split('-')[0]; // timer or manual

        let source = [];
        if (type === 'materias') source = state.materiasCache;
        if (type === 'tipos') source = state.tiposEstudoCache;
        if (type === 'topicos') {
            const materiaId = document.getElementById(`${mode}-materia`).value;
            if (materiaId) {
                const mat = state.materiasCache.find(m => m.id == materiaId);
                if (mat) source = mat.topicos || [];
            }
        }

        renderAutocompleteList(source, val, list, hidden, input, type);
    });

    input.addEventListener('focus', function () {
        // Trigger search on focus to show all or filtered
        const event = new Event('input');
        this.dispatchEvent(event);
    });
}

function renderAutocompleteList(source, query, list, hidden, input, type) {
    list.innerHTML = '';
    list.style.display = 'block';

    const matches = source.filter(item => {
        const text = item.nome || item.descricao;
        return text.toLowerCase().includes(query.toLowerCase());
    });

    // Option to create new
    if (query && !matches.find(item => (item.nome || item.descricao).toLowerCase() === query.toLowerCase())) {
        const newItem = document.createElement('div');
        newItem.className = 'autocomplete-item new-item';
        newItem.innerHTML = `Criar novo: "<strong>${query}</strong>"`;
        newItem.onclick = () => {
            hidden.value = ''; // Empty ID means new
            input.value = query;
            list.style.display = 'none';
        };
        list.appendChild(newItem);
    }

    matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerText = item.nome || item.descricao;
        div.onclick = () => {
            hidden.value = item.id;
            input.value = item.nome || item.descricao;
            list.style.display = 'none';

            // If selecting materia, clear topic
            if (type === 'materias') {
                const mode = input.id.split('-')[0];
                document.getElementById(`${mode}-topico`).value = '';
                document.getElementById(`${mode}-topico-input`).value = '';
            }
        };
        list.appendChild(div);
    });

    if (matches.length === 0 && !query) {
        list.style.display = 'none';
    }
}
