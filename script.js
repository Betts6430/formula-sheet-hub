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
    } else {
        alert("Please enter a valid formula.");
    }
}

// Handle form submission with validation
document.getElementById("formulaSheetForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    if (title && description) {
        alert("Formula sheet created successfully! Title: " + title + " | Description: " + description);
        closeModal();
    } else {
        alert("Please fill out all fields.");
    }
});

// Search functionality with debounce for "Your Sheets" and "Community Sheets"
const searchInput = document.querySelector(".search-input");
if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("keyup", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase();
            const sheets = document.querySelectorAll(".sheet-card");

            sheets.forEach(sheet => {
                const title = sheet.querySelector(".sheet-title").innerText.toLowerCase();
                const description = sheet.querySelector(".sheet-description").innerText.toLowerCase();
                sheet.style.display = (title.includes(searchTerm) || description.includes(searchTerm)) ? "block" : "none";
            });
        }, 300);  // Debounce delay of 300ms
    });
}

// Placeholder for filter button functionality
const filterBtn = document.querySelector(".search-btn");
if (filterBtn) {
    filterBtn.addEventListener("click", function () {
        alert("Filter functionality coming soon! This will allow filtering by subject, date, etc.");
    });
}