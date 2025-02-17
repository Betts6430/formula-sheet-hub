function openModal() {
    document.getElementById("createSheetModal").style.display = "block";
  }
 
  function closeModal() {
    document.getElementById("createSheetModal").style.display = "none";
    document.getElementById("createSheetModal").removeAttribute("data-editing");
    document.getElementById("formulaSheetForm").reset();
    document.getElementById("formulaList").innerHTML = ""; // Clear the formula list
  }
 
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
 
    if (checkboxes.length > 0) {
      bulkActions.style.display = "block"; // Show the bulk actions
    } else {
      bulkActions.style.display = "none"; // Hide the bulk actions
    }
  }
 
  // Attach event listeners to checkboxes when formulas are added
  function addCheckboxListener(li) {
    const checkbox = li.querySelector(".formula-checkbox");
    checkbox.addEventListener("change", updateBulkActions);
  }
 
  function addFormula() {
    const formulaInput = document.getElementById("formulaInput");
    const formulaList = document.getElementById("formulaList");
 
    if (formulaInput.value.trim() !== "") {
      const li = document.createElement("li");
      li.classList.add("formula-item");
      li.innerHTML = `
        <span class="formula-text">${formulaInput.value}</span>
        <div class="formula-actions">
          <svg class="icon add-to-category-icon" title="Add to Category" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 5v14M5 12h14" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg class="icon trash-icon" title="Delete Formula" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="#ffffff">
            <g transform="scale(4,4)">
              <path d="M28,7c-2.757,0 -5,2.243 -5,5v3h-10c-1.104,0 -2,0.896 -2,2c0,1.104 0.896,2 2,2h2.10938l1.68359,30.33203c0.178,3.178 2.80723,5.66797 5.99023,5.66797h18.43359c3.182,0 5.81223,-2.48997 5.99023,-5.66797l1.68359,-30.33203h2.10938c1.104,0 2,-0.896 2,-2c0,-1.104 -0.896,-2 -2,-2h-10v-3c0,-2.757 -2.243,-5 -5,-5zM28,11h8c0.552,0 1,0.449 1,1v3h-10v-3c0,-0.551 0.448,-1 1,-1zM19.11328,19h25.77344l-1.67383,30.10938c-0.059,1.06 -0.93509,1.89063 -1.99609,1.89063h-18.43359c-1.06,0 -1.93709,-0.82967 -1.99609,-1.88867zM32,23.25c-0.967,0 -1.75,0.784 -1.75,1.75v20c0,0.966 0.783,1.75 1.75,1.75c0.967,0 1.75,-0.784 1.75,-1.75v-20c0,-0.966 -0.783,-1.75 -1.75,-1.75zM24.64258,23.25195c-0.965,0.034 -1.7205,0.84259 -1.6875,1.80859l0.69727,20.08594c0.033,0.945 0.81005,1.68945 1.74805,1.68945c0.021,0 0.0415,0 0.0625,0c0.965,-0.034 1.7205,-0.84455 1.6875,-1.81055l-0.69727,-20.08594c-0.034,-0.965 -0.84655,-1.7105 -1.81055,-1.6875zM39.35547,23.25195c-0.967,-0.027 -1.77459,0.7225 -1.80859,1.6875l-0.69727,20.08594c-0.034,0.966 0.7215,1.77655 1.6875,1.81055c0.021,0.001 0.0415,0 0.0625,0c0.938,0 1.71505,-0.74445 1.74805,-1.68945l0.69727,-20.08594c0.034,-0.966 -0.72345,-1.77459 -1.68945,-1.80859z"></path>
            </g>
          </svg>
          <input type="checkbox" class="formula-checkbox">
        </div>
      `;
 
      li.querySelector(".formula-text").addEventListener("dblclick", () => enterEditMode(li));
      li.querySelector(".trash-icon").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this formula?")) li.remove();
      });
 
      formulaList.appendChild(li);
      formulaInput.value = ""; // Clear input
 
      // Attach checkbox listener to update bulk actions
      addCheckboxListener(li);
    }
  }
 
  // Handle "Delete Selected" button click
  document.getElementById("deleteSelected").addEventListener("click", () => {
    const selectedCheckboxes = document.querySelectorAll(".formula-checkbox:checked");
    selectedCheckboxes.forEach(checkbox => checkbox.closest(".formula-item").remove());
    updateBulkActions(); // Hide bulk actions if all are removed
  });
 
  // Handle "Add to Category" button click
  document.getElementById("addToCategory").addEventListener("click", () => {
    alert("Add to Category functionality coming soon!");
  });
 
 
  function enterEditMode(li) {
    const formulaText = li.querySelector(".formula-text");
    const originalText = formulaText.textContent;
 
    const input = document.createElement("input");
    input.type = "text";
    input.value = originalText;
    input.classList.add("formula-edit-input");
 
    formulaText.replaceWith(input);
    input.focus();
 
    input.addEventListener("blur", () => exitEditMode(li, input, input.value.trim() || originalText));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        exitEditMode(li, input, input.value.trim() || originalText);
      }
    });
  }
 
  function exitEditMode(li, input, newText) {
    const formulaText = document.createElement("span");
    formulaText.classList.add("formula-text");
    formulaText.textContent = newText;
 
    input.replaceWith(formulaText);
    formulaText.addEventListener("dblclick", () => enterEditMode(li));
  }
 
  document.addEventListener("DOMContentLoaded", () => {
    const savedSheets = JSON.parse(localStorage.getItem("formulaSheets")) || [];
    savedSheets.forEach(sheet => createFormulaSheetCard(sheet));
  });
 
  function createAndAddFormulaSheet() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const formulas = Array.from(document.querySelectorAll("#formulaList li .formula-text")).map(el => el.textContent);
 
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
        const newSheet = { id, title, description, formulas };
        savedSheets.push(newSheet);
      }
 
      localStorage.setItem("formulaSheets", JSON.stringify(savedSheets));
      refreshFormulaSheets();
      closeModal();
    } else {
      alert("Please fill out all fields and add at least one formula.");
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
    formulaContainer.innerHTML = ""; // Clear existing cards
    savedSheets.forEach(sheet => createFormulaSheetCard(sheet));
  }
 

