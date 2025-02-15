function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
}

function closeModal() {
    document.getElementById("createSheetModal").style.display = "none";
    document.getElementById("createSheetModal").removeAttribute("data-editing");
}


// Detect Enter key press in the formula input
document.getElementById("formulaInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the form from submitting
      addFormula(); // Call the addFormula function
    }
  });
  

// Add a formula to the formula list

function addFormula() {
    const formulaInput = document.getElementById("formulaInput");
    const formulaList = document.getElementById("formulaList");

    if (formulaInput.value.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = formulaInput.value;
        formulaList.appendChild(li);
        formulaInput.value = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    savedSheets.forEach(sheet => createFormulaSheetCard(sheet));

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        const sheetToEdit = savedSheets.find(sheet => sheet.id === editId);
        if (sheetToEdit) {
            openModal();
            prefillModal(sheetToEdit);
            document.getElementById("createSheetModal").dataset.editing = editId; // Add editing flag
        }
    }
});

function prefillModal(sheet) {
    document.getElementById("title").value = sheet.title;
    document.getElementById("description").value = sheet.description;
    document.getElementById("formulaList").innerHTML = "";

    sheet.formulas.forEach(formula => {
        const li = document.createElement("li");
        li.textContent = formula;
        document.getElementById("formulaList").appendChild(li);
    });
}

function createAndAddFormulaSheet() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const formulas = Array.from(document.querySelectorAll("#formulaList li")).map(li => li.textContent);

    if (title && description && formulas.length > 0) {
        createFormulaSheetCard(title, description, formulas);
        alert("Formula sheet created successfully!");  //REMOVE LATER
        const id = Date.now().toString();
        const newSheet = { id, title, description, formulas };
        const existingSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
        existingSheets.push(newSheet);
        localStorage.setItem("formulaSheets", JSON.stringify(existingSheets));
        const editingId = document.getElementById("createSheetModal").dataset.editing;
        let savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];

        if (editingId) {
            // Edit existing sheet
            const sheetIndex = savedSheets.findIndex(sheet => sheet.id === editingId);
            if (sheetIndex !== -1) {
                savedSheets[sheetIndex] = { id: editingId, title, description, formulas };
            }
            document.getElementById("createSheetModal").removeAttribute("data-editing");
        } else {
            // Create new sheet
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
