
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("problem-form");
    const message = document.getElementById("form-message");

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const category = form.elements.category.value;
        const location = form.elements.location.value.trim();
        const description = form.elements.description.value.trim();
        const status = form.elements.status.value;

        // Validação dos campos obrigatórios.
        if (!form.checkValidity()
            || !isValidText(location, 2, 80)
            || !isValidText(description, 10, 500)) {

            form.reportValidity();

            showMessage(
                message,
                "Verifique os campos e tente novamente.",
                "error"
            );

            return;
        }

        try {

            const records = getRecords();

            // Cria um novo registro.
            const newRecord = {
                id: createId(),
                category: category,
                location: location,
                description: description,
                status: status,
                createdAt: new Date().toISOString()
            };

            records.unshift(newRecord);

            // Salva o registro.
            if (!saveRecords(records)) {
                throw new Error("Falha no armazenamento");
            }

            // Registra a atividade.
            logActivity(
                "Registro adicionado",
                category + " - " + location
            );

            showMessage(
                message,
                "Problema registrado com sucesso!",
                "success"
            );

            form.reset();

        } catch (error) {

            console.error("Erro interno:", error);

            showMessage(
                message,
                "Não foi possível salvar o registro. Tente novamente.",
                "error"
            );
        }

    });

});
