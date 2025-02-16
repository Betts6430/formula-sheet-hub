function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
}

function closeModal() {
    document.getElementById("createSheetModal").style.display = "none";
    document.getElementById("createSheetModal").removeAttribute("data-editing");
}

function addFormula() {
    const formulaInput = document.getElementById("formulaInput");
    const formulaList = document.getElementById("formulaList");

    if (formulaInput.value.trim() !== "") {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="formula-checkbox">
            <span class="formula-text">${formulaInput.value}</span>
        `;
        formulaList.appendChild(li);
        formulaInput.value = "";
    }
}

function removeSelectedFormulas() {
    const formulaList = document.getElementById("formulaList");
    const checkboxes = formulaList.querySelectorAll(".formula-checkbox:checked");
    checkboxes.forEach(checkbox => checkbox.parentElement.remove());
}

function editSelectedFormula() {
    const formulaList = document.getElementById("formulaList");
    const checkedItems = formulaList.querySelectorAll(".formula-checkbox:checked");

    if (checkedItems.length === 1) {
        const formulaText = checkedItems[0].nextElementSibling;
        const newFormula = prompt("Edit the formula:", formulaText.textContent);
        if (newFormula !== null) {
            formulaText.textContent = newFormula;
        }
    } else {
        alert("Please select exactly one formula to edit.");
    }
}

function createAndAddFormulaSheet() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const formulas = Array.from(document.querySelectorAll("#formulaList li .formula-text")).map(span => span.textContent);

    if (title && description && formulas.length > 0) {
        const editingId = document.getElementById("createSheetModal").dataset.editing;
        let savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];

        if (editingId) {
            const sheetIndex = savedSheets.findIndex(sheet => sheet.id === editingId);
            if (sheetIndex !== -1) {
                savedSheets[sheetIndex] = { id: editingId, title, description, formulas };
            }
            document.getElementById("createSheetModal").removeAttribute("data-editing");
        } else {
            const id = Date.now().toString();
            savedSheets.push({ id, title, description, formulas });
        }

        localStorage.setItem("formulaSheets", JSON.stringify(savedSheets));
        refreshFormulaSheets();
        closeModal();
        document.getElementById("formulaSheetForm").reset();
        document.getElementById("formulaList").innerHTML = "";
    }
}

function createFormulaSheetCard(sheet) {
    const formulaContainer = document.querySelector(".your-sheets .sheet-container");

    const newCard = document.createElement("div");
    newCard.classList.add("sheet-card");

    newCard.innerHTML = `
        <div class="sheet-preview"></div>
        <h3 class="sheet-title">${sheet.title}</h3>
        <p class="sheet-description">${sheet.description}</p>
    `;

    newCard.addEventListener("click", () => {
        window.location.href = `sheet.html?id=${sheet.id}`;
    });

    formulaContainer.appendChild(newCard);
}

function refreshFormulaSheets() {
    const savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    const formulaContainer = document.querySelector(".your-sheets .sheet-container");
    formulaContainer.innerHTML = "";
    savedSheets.forEach(sheet => createFormulaSheetCard(sheet));
}

document.addEventListener("DOMContentLoaded", () => {
    refreshFormulaSheets();
});
