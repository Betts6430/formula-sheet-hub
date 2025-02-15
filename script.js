// Open the modal
function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
}

// Close the modal
function closeModal() {
    document.getElementById("createSheetModal").style.display = "none";
}

// Add a formula to the formula list
function addFormula() {
    const formulaInput = document.getElementById("formulaInput");
    const formulaList = document.getElementById("formulaList");

    if (formulaInput.value.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = formulaInput.value;
        formulaList.appendChild(li);
        formulaInput.value = ""; // Clear the input field
    }
}

// Create and add a formula sheet to "Your Formula Sheets"
function createAndAddFormulaSheet() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const formulas = Array.from(document.querySelectorAll("#formulaList li")).map(li => li.textContent);

    if (title && description && formulas.length > 0) {
        createFormulaSheetCard(title, description, formulas);
        alert("Formula sheet created successfully!");

        // Reset the form and formula list
        document.getElementById("formulaSheetForm").reset();
        document.getElementById("formulaList").innerHTML = "";

        closeModal();
    } else {
        alert("Please fill out all fields and add at least one formula.");
    }
}

// Create and display a formula sheet card in "Your Formula Sheets"
function createFormulaSheetCard(title, description, formulas) {
    const formulaContainer = document.querySelector(".your-sheets .sheet-container");

    const newCard = document.createElement("div");
    newCard.classList.add("sheet-card");

    newCard.innerHTML = `
        <div class="sheet-preview"></div>
        <h3 class="sheet-title">${title}</h3>
        <p class="sheet-description">${description}</p>
    `;

    formulaContainer.appendChild(newCard);
}
