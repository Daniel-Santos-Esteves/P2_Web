
// Chaves utilizadas para armazenar os dados.
const STORAGE_KEYS = {
    records: "bairroEmAcao_records",
    activities: "bairroEmAcao_activities"
};

// Gera um identificador único para cada registro.
function createId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString() + Math.random().toString(16);
}

// Recupera dados do navegador.
function readStorage(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Erro ao recuperar dados:", error);
        return [];
    }
}

// Salva dados no navegador.
function writeStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;

    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        return false;
    }
}

// Recupera todos os registros.
function getRecords() {
    return readStorage(STORAGE_KEYS.records);
}

// Salva os registros.
function saveRecords(records) {
    return writeStorage(STORAGE_KEYS.records, records);
}

// Registra as atividades do sistema.
function logActivity(action, result) {
    const activities = readStorage(STORAGE_KEYS.activities);

    activities.unshift({
        id: createId(),
        date: new Date().toISOString(),
        action: action,
        result: result
    });

    return writeStorage(
        STORAGE_KEYS.activities,
        activities.slice(0, 100)
    );
}

// Formata a data e o horário.
function formatDate(date) {
    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
        return "Data indisponível";
    }

    return formatted.toLocaleString("pt-BR");
}

// Exibe mensagens na página.
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = type;
}

// Verifica tamanho e conteúdo dos textos.
function isValidText(value, min, max) {
    return typeof value === "string"
        && value.trim().length >= min
        && value.trim().length <= max;
}

// Atualiza o ano do rodapé.
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-current-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });
});
