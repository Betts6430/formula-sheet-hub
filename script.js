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
  