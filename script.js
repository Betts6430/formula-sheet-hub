let sheet_information = {
    title: "",
    description: "",
    categories: {}
};


function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
}


function closeModal() {
    const modal = document.getElementById("createSheetModal");
    modal.style.display = "none";
    modal.removeAttribute("data-editing");
    document.getElementById("formulaSheetForm").reset();
    document.getElementById("formulaList").innerHTML = ""; // Clear formulas
    document.getElementById("categoryList").innerHTML = ""; // Clear category UI
    updateBulkActions(); // Reset bulk actions

    // **Reset sheet_information to clear categories on modal close**
    sheet_information = {
        title: "",
        description: "",
        categories: {}
    };
}

// Prevent modal from closing on Escape or outside clicks
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
    }
});


document.addEventListener("click", (event) => {
    const modal = document.getElementById("createSheetModal");
    if (event.target === modal) {
        event.stopPropagation();
    }
});


// Add a formula to the formula list when "+" is clicked or Enter is pressed
document.getElementById("formulaInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addFormula();
    }
});


function updateBulkActions() {
    const checkboxes = document.querySelectorAll(".formula-checkbox:checked");
    const bulkActions = document.getElementById("bulkActions");


    bulkActions.style.display = checkboxes.length > 0 ? "block" : "none";
}


function addFormula() {
    const formulaInput = document.getElementById("formulaInput");
    const formulaList = document.getElementById("formulaList");


    if (formulaInput.value.trim() !== "") {
        const li = document.createElement("li");
        li.classList.add("formula-item");
        li.innerHTML = `
            <span class="formula-text">${formulaInput.value}</span>
            <span class="category-label"></span>
            <div class="formula-actions">
                <svg class="icon add-to-category-icon" title="Add to Category" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 5v14M5 12h14" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg class="icon trash-icon" title="Delete Formula" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="#ffffff">
                    <g transform="scale(4,4)">
                        <path d="M28,7c-2.757,0 -5,2.243 -5,5v3h-10c-1.104,0 -2,0.896 -2,2c0,1.104 0.896,2 2,2h2.10938l1.68359,30.33203c0.178,3.178 2.80723,5.66797 5.99023,5.66797h18.43359c3.182,0 5.81223,-2.48997 5.99023,-5.66797l1.68359,-30.33203h2.10938c1.104,0 2,-0.896 2,-2c0,-1.104 -0.896,-2 -2,-2h-10v-3c0,-2.757 -2.243,-5 -5,-5z"></path>
                    </g>
                </svg>
                <input type="checkbox" class="formula-checkbox">
            </div>
        `;


        li.querySelector(".add-to-category-icon").addEventListener("click", () => openCategoryModal(li));
        li.querySelector(".trash-icon").addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this formula?")) li.remove();
        });


        formulaList.appendChild(li);
        formulaInput.value = "";
        addCheckboxListener(li);
    }
}


function addCheckboxListener(li) {
    const checkbox = li.querySelector(".formula-checkbox");
    checkbox.addEventListener("change", updateBulkActions);
}


// Handle "Delete Selected" button click
document.getElementById("deleteSelected").addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelectorAll(".formula-checkbox:checked").forEach(checkbox => checkbox.closest(".formula-item").remove());
    updateBulkActions();
});


// Category Modal Functions
function openCategoryModal(formulaItem) {
    document.getElementById("categoryModal").style.display = "block";
    document.getElementById("categoryModal").dataset.currentFormula = formulaItem.querySelector(".formula-text").textContent;
}


function closeCategoryModal() {
    document.getElementById("categoryModal").style.display = "none";
}


function createNewCategory() {
    const categoryName = prompt("Enter new category name:");
    if (categoryName && !sheet_information.categories[categoryName]) {
        sheet_information.categories[categoryName] = [];
        updateCategoryList();
    }
}


function updateCategoryList() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";


    Object.keys(sheet_information.categories).forEach(categoryName => {
        const li = document.createElement("li");
        li.textContent = categoryName;
        li.addEventListener("click", () => selectCategory(categoryName));
        categoryList.appendChild(li);
    });
}


function selectCategory(categoryName) {
    const formulaText = document.getElementById("categoryModal").dataset.currentFormula;


    if (!sheet_information.categories[categoryName].includes(formulaText)) {
        sheet_information.categories[categoryName].push(formulaText);
    }


    document.querySelectorAll(".formula-item").forEach(item => {
        if (item.querySelector(".formula-text").textContent === formulaText) {
            item.querySelector(".category-label").textContent = `(${categoryName})`;
        }
    });


    closeCategoryModal();
}


// Creating & Saving Sheets
function createAndAddFormulaSheet() {
    // Get the current title and description from input fields
    sheet_information.title = document.getElementById("title").value.trim();
    sheet_information.description = document.getElementById("description").value.trim();

    // Move unassigned formulas to the "Uncategorized" category
    if (!sheet_information.categories["Uncategorized"]) {
        sheet_information.categories["Uncategorized"] = [];
    }

    // Find formulas in the list that aren't in a category
    document.querySelectorAll("#formulaList li").forEach(li => {
        const formulaText = li.querySelector(".formula-text").textContent;

        let foundInCategory = false;
        for (const category in sheet_information.categories) {
            if (sheet_information.categories[category].includes(formulaText)) {
                foundInCategory = true;
                break;
            }
        }

        if (!foundInCategory) {
            sheet_information.categories["Uncategorized"].push(formulaText);
        }
    });

    // Save to localStorage (or process as needed)
    let savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    const id = Date.now().toString();
    savedSheets.push({ id, ...sheet_information });
    localStorage.setItem("formulaSheets", JSON.stringify(savedSheets));

    // Log updated sheet_information (for debugging)
    console.log("✅ Finalized sheet_information before closing modal:", sheet_information);

    // Reset and close modal
    closeModal();
}





function refreshFormulaSheets() {
    const savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    const formulaContainer = document.querySelector(".your-sheets .sheet-container");
    formulaContainer.innerHTML = "";


    savedSheets.forEach(sheet => {
        const newCard = document.createElement("div");
        newCard.classList.add("sheet-card");
        newCard.innerHTML = `
            <div class="sheet-preview"></div>
            <h3 class="sheet-title">${sheet.title}</h3>
            <p class="sheet-description">${sheet.description}</p>
        `;
        formulaContainer.appendChild(newCard);
    });
}


// Load sheets on page load
document.addEventListener("DOMContentLoaded", refreshFormulaSheets);


/* Print sheet_information every 5 seconds for debugging
setInterval(() => {
    console.log("🔹 Current sheet_information:", sheet_information);
}, 5000);
*/

// Connecting to python backend
function sendDataToPython() {
    fetch('/save-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sheet_information)
    })
    .then(response => response.json())
    .then(data => console.log("✅ JSON file saved successfully:", data))
    .catch(error => console.error("❌ Error saving JSON:", error));
}

// Call sendDataToPython() when the create button is pressed
document.getElementById("create-formula-btn").addEventListener("click", () => {
    sendDataToPython();
});

function runPythonScript() {
    fetch('/run-script', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => console.log("✅ Python Script Response:", data))
    .catch(error => console.error("❌ Error running Python script:", error));
}

// Run Python script after saving JSON
document.getElementById("create-formula-btn").addEventListener("click", () => {
    sendDataToPython();
    setTimeout(runPythonScript, 1000);  // Wait 1 second before running script
});