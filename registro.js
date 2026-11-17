
document.addEventListener("DOMContentLoaded", () => {

    const list = document.getElementById("records-list");
    const message = document.getElementById("records-message");
    const activityList = document.getElementById("activity-list");
    const filter = document.getElementById("filter-category");
    const clearButton = document.getElementById("clear-activities");

    // Cria elementos de texto sem interpretar HTML digitado pelo usuário.
    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        return element;
    }

    // OPERAÇÃO: LISTAR
    function renderRecords() {

        try {

            const records = getRecords();
            const selectedCategory = filter.value;

            list.replaceChildren();

            const filtered = records.filter(record =>
                !selectedCategory || record.category === selectedCategory
            );

            if (filtered.length === 0) {
                list.append(
                    createElement(
                        "div",
                        "empty-state",
                        "Nenhum problema encontrado."
                    )
                );
                return;
            }

            filtered.forEach(record => {

                const card = document.createElement("article");
                card.className = "record-card";

                const title = createElement(
                    "h3",
                    "",
                    record.category
                );

                let statusClass = "status";

                if (record.status === "Resolvido") {
                    statusClass += " resolved";
                } else if (record.status === "Em acompanhamento") {
                    statusClass += " progress";
                }

                const status = createElement(
                    "span",
                    statusClass,
                    record.status
                );

                const location = createElement(
                    "p",
                    "",
                    "📍 " + record.location
                );

                const description = createElement(
                    "p",
                    "",
                    record.description
                );

                const date = createElement(
                    "small",
                    "record-meta",
                    "Criado em: " + formatDate(record.createdAt)
                );

                const actions = document.createElement("div");
                actions.className = "record-actions";

                // Botão de editar.
                const editButton = createElement(
                    "button",
                    "btn btn-outline-primary btn-sm",
                    "Editar"
                );

                editButton.type = "button";
                editButton.addEventListener("click", () => {
                    editRecord(record.id);
                });

                // Botão de excluir.
                const deleteButton = createElement(
                    "button",
                    "btn btn-outline-danger btn-sm",
                    "Excluir"
                );

                deleteButton.type = "button";
                deleteButton.addEventListener("click", () => {
                    deleteRecord(record.id);
                });

                actions.append(editButton, deleteButton);

                card.append(
                    title,
                    status,
                    location,
                    description,
                    date,
                    actions
                );

                list.append(card);
            });

        } catch (error) {

            console.error("Erro interno ao listar:", error);

            showMessage(
                message,
                "Não foi possível carregar os dados. Tente novamente.",
                "error"
            );
        }
    }

    // OPERAÇÃO: EDITAR
    function editRecord(id) {

        try {

            const records = getRecords();

            const record = records.find(item => item.id === id);

            if (!record) {
                showMessage(
                    message,
                    "Registro não encontrado.",
                    "error"
                );
                return;
            }

            const category = prompt(
                "Tipo de problema:",
                record.category
            );

            if (category === null) return;

            const categories = [
                "Buraco na rua",
                "Iluminação pública",
                "Lixo acumulado",
                "Acessibilidade",
                "Praça ou área verde",
                "Outro"
            ];

            if (!categories.includes(category)) {
                showMessage(message, "Categoria inválida.", "error");
                return;
            }

            const location = prompt(
                "Localização:",
                record.location
            );

            if (location === null) return;

            const description = prompt(
                "Descrição:",
                record.description
            );

            if (description === null) return;

            const status = prompt(
                "Situação: Pendente, Em acompanhamento ou Resolvido",
                record.status
            );

            if (status === null) return;

            const statuses = [
                "Pendente",
                "Em acompanhamento",
                "Resolvido"
            ];

            if (
                !isValidText(location, 2, 80) ||
                !isValidText(description, 10, 500) ||
                !statuses.includes(status)
            ) {
                showMessage(
                    message,
                    "Dados inválidos. Verifique as informações.",
                    "error"
                );
                return;
            }

            const index = records.findIndex(item => item.id === id);

            records[index] = {
                ...record,
                category: category,
                location: location.trim(),
                description: description.trim(),
                status: status,
                updatedAt: new Date().toISOString()
            };

            if (!saveRecords(records)) {
                throw new Error("Falha ao atualizar");
            }

            logActivity(
                "Registro editado",
                category + " - " + location
            );

            showMessage(
                message,
                "Registro atualizado com sucesso!",
                "success"
            );

            renderRecords();
            renderActivities();

        } catch (error) {

            console.error("Erro interno ao editar:", error);

            showMessage(
                message,
                "Não foi possível editar o registro. Tente novamente.",
                "error"
            );
        }
    }

    // OPERAÇÃO: REMOVER
    function deleteRecord(id) {

        try {

            const records = getRecords();

            const record = records.find(item => item.id === id);

            if (!record) return;

            const confirmation = confirm(
                "Deseja realmente excluir este registro?"
            );

            if (!confirmation) return;

            const updatedRecords = records.filter(
                item => item.id !== id
            );

            if (!saveRecords(updatedRecords)) {
                throw new Error("Falha ao excluir");
            }

            logActivity(
                "Registro removido",
                record.category + " - " + record.location
            );

            showMessage(
                message,
                "Registro removido com sucesso!",
                "success"
            );

            renderRecords();
            renderActivities();

        } catch (error) {

            console.error("Erro interno ao remover:", error);

            showMessage(
                message,
                "Não foi possível remover o registro. Tente novamente.",
                "error"
            );
        }
    }

    // PAINEL DE ATIVIDADES
    function renderActivities() {

        try {

            const activities = readStorage(STORAGE_KEYS.activities);

            activityList.replaceChildren();

            if (activities.length === 0) {
                activityList.append(
                    createElement(
                        "li",
                        "",
                        "Nenhuma atividade registrada."
                    )
                );
                return;
            }

            activities.forEach(activity => {

                const item = createElement(
                    "li",
                    "",
                    formatDate(activity.date) +
                    " — " +
                    activity.action +
                    " — " +
                    activity.result
                );

                activityList.append(item);
            });

        } catch (error) {

            console.error("Erro no histórico:", error);

            activityList.textContent =
                "Não foi possível carregar as atividades.";
        }
    }

    // Filtrar registros.
    filter.addEventListener("change", renderRecords);

    // Limpar histórico.
    clearButton.addEventListener("click", () => {

        if (!confirm("Deseja limpar o histórico de atividades?")) {
            return;
        }

        if (writeStorage(STORAGE_KEYS.activities, [])) {
            renderActivities();
        } else {
            showMessage(
                message,
                "Não foi possível limpar as atividades.",
                "error"
            );
        }
    });

    // Carrega os dados ao abrir a página.
    renderRecords();
    renderActivities();

});
