const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const durationDisplay = document.getElementById('duration');
const shiftDropdown = document.getElementById('shift');
const otherLocationInput = document.getElementById('otherLocationInput');
const reportedToInput = document.getElementById('reportedToInput');
const bellTechInfo = document.getElementById('bellTechInfo');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');

// Function to format datetime to HH:MM DD-MM-YYYY
function formatDateTime(datetimeString) {
    const date = new Date(datetimeString);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

// Function to calculate duration between start and end times
function calculateDuration() {
    const startTime = new Date(startInput.value);
    const endTime = new Date(endInput.value);

    if (startTime && endTime && startTime < endTime) {
        const durationInMs = endTime - startTime;
        const durationInHours = (durationInMs / (1000 * 60 * 60)).toFixed(2);
        durationDisplay.textContent = durationInHours;
    } else {
        durationDisplay.textContent = "0";
    }
}

startInput.addEventListener('input', calculateDuration);
endInput.addEventListener('input', calculateDuration);

// Handle shift dropdown visibility logic
shiftDropdown.addEventListener('change', () => {
    if (shiftDropdown.value === 'Other') {
        otherLocationInput.style.display = 'block';
        reportedToInput.style.display = 'block';
    } else {
        otherLocationInput.style.display = 'none';
        reportedToInput.style.display = 'none';
    }

    if (shiftDropdown.value === 'Bell Tech') {
        bellTechInfo.style.display = 'block';
    } else {
        bellTechInfo.style.display = 'none';
    }
});

// Preview button logic
document.getElementById('previewBtn').addEventListener('click', () => {
    const formData = {
        name: document.getElementById('name').value,
        shiftLocation: shiftDropdown.value,
        otherShift: document.getElementById('otherShift').value,
        reportedTo: document.getElementById('reportedTo').value,
        bellTechLocation: document.getElementById('bellTechLocation').value,
        managementInfo: document.getElementById('managementInfo').value,
        technicalInfo: document.getElementById('technicalInfo').value,
        start: startInput.value ? formatDateTime(startInput.value) : null,
        end: endInput.value ? formatDateTime(endInput.value) : null,
        duration: durationDisplay.textContent,
        comments: document.getElementById('comments').value,
    };

    // Create preview dynamically, omitting unfilled fields
    let previewHtml = "";

    for (const [key, value] of Object.entries(formData)) {
        if (value) {
            const label = key
                .replace(/([A-Z])/g, " $1") // Convert camelCase to Title Case
                .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
            previewHtml += `<p><strong>${label}:</strong> ${value}</p>`;
        }
    }

    previewContent.innerHTML = previewHtml;
    previewModal.style.display = 'block';
});

// Edit button logic
document.getElementById('editBtn').addEventListener('click', () => {
    previewModal.style.display = 'none';
});

// Submit button logic
document.getElementById('submitBtn').addEventListener('click', async () => {
    const startTime = new Date(startInput.value);
    const endTime = new Date(endInput.value);
    const currentTime = new Date();
    const durationInHours = parseFloat(durationDisplay.textContent);

    // Validate duration
    if (durationInHours <= 0) {
        alert("Error: Duration must be greater than 0. Please check your start and end times.");
        return;
    }

    // Block submission if end time is more than 9 hours in the past
    const timeDifference = (currentTime - endTime) / (1000 * 60 * 60); // Time difference in hours
    if (timeDifference > 9) {
        alert(
            "Error: You cannot submit this shift because you are past the deadline (9Hours). Please contact the shift manager manually."
        );
        return; // Block the submission
    }

    const formData = {
        name: document.getElementById('name').value,
        shiftLocation: shiftDropdown.value,
        otherShift: document.getElementById('otherShift').value,
        reportedTo: document.getElementById('reportedTo').value,
        bellTechLocation: document.getElementById('bellTechLocation').value,
        managementInfo: document.getElementById('managementInfo').value,
        technicalInfo: document.getElementById('technicalInfo').value,
        start: startInput.value,
        end: endInput.value,
        duration: durationDisplay.textContent,
        comments: document.getElementById('comments').value,
    };

    try {
        const response = await fetch('https://cssrp.up.railway.app/api/shift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Redirect to the Thank You page on successful submission
            window.location.href = "thankyou.html";
        } else {
            const result = await response.json();
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});
