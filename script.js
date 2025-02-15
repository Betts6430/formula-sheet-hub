function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
}

function closeModal() {
    document.getElementById("createSheetModal").style.display = "none";
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

        createFormulaSheetCard(newSheet);
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

document.addEventListener("DOMContentLoaded", () => {
    const savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    savedSheets.forEach(sheet => createFormulaSheetCard(sheet));
});
