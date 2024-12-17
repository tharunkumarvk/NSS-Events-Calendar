const calendar = document.getElementById("calendar");
const monthName = document.getElementById("month-name");
const eventListContainer = document.getElementById("events-container");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const adminOptions = document.getElementById("admin-options");
const addEventOptions = document.getElementById("add-event-options");
const editEventBtn = document.getElementById("edit-event");
const deleteEventBtn = document.getElementById("delete-event");
const addEventBtn = document.getElementById("add-event");
let currentMonth = new Date().getMonth(); // Start from current month
let events = {};
const ADMIN_PASSWORD = "admin123";

// Generates the calendar for the given month
function generateCalendar(month) {
    calendar.innerHTML = "";
    monthName.textContent = new Date(2024, month).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(2024, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${day}-${month}`;
        calendar.innerHTML += `
            <div class="day" onclick="showModal(${day}, ${month})">
                ${day}
                ${events[key] ? `<div class="event">${events[key].title}</div>` : ""}
            </div>
        `;
    }
    updateEventList(month);
}

// Displays event details in the modal
function showModal(day, month) {
    const key = `${day}-${month}`;
    const event = events[key];

    modalTitle.textContent = event ? event.title : "No Event";
    modalDescription.textContent = event ? event.description : "No description available";
    modal.style.display = "flex";

    if (event) {
        const password = prompt("Enter Admin Password to Edit/Delete Event:");
        if (password === ADMIN_PASSWORD) {
            adminOptions.style.display = "block";
            addEventOptions.style.display = "none";
            editEventBtn.onclick = () => editEvent(key);
            deleteEventBtn.onclick = () => deleteEvent(key);
        } else {
            adminOptions.style.display = "none";
            addEventOptions.style.display = "none";
        }
    } else {
        adminOptions.style.display = "none";
        addEventOptions.style.display = "block";
        addEventBtn.onclick = () => addEvent(key);
    }
}

// Adds an event to the selected day
function addEvent(key) {
    const title = prompt("Event Title:");
    const description = prompt("Event Description:");

    if (title && description) {
        events[key] = { title, description };
        generateCalendar(currentMonth);
        alert("Event added successfully!");
    }
}

// Edits the selected event
function editEvent(key) {
    const event = events[key];
    const newTitle = prompt("Edit Event Title:", event.title);
    const newDescription = prompt("Edit Event Description:", event.description);

    if (newTitle && newDescription) {
        events[key] = { title: newTitle, description: newDescription };
        generateCalendar(currentMonth);
        alert("Event updated successfully!");
    }
}

// Deletes the selected event
function deleteEvent(key) {
    delete events[key];
    generateCalendar(currentMonth);
    alert("Event deleted successfully!");
}

// Closes the modal
closeModal.onclick = function() {
    modal.style.display = "none";
}

// Updates the upcoming events list
function updateEventList(month) {
    const eventsThisMonth = Object.keys(events).filter(key => key.includes(`-${month}`));
    eventListContainer.innerHTML = "";

    eventsThisMonth.forEach(key => {
        const event = events[key];
        eventListContainer.innerHTML += `
            <div class="event-item">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
            </div>
        `;
    });
}

// Navigation between months
document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) currentMonth = 11;
    generateCalendar(currentMonth);
});
document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) currentMonth = 0;
    generateCalendar(currentMonth);
});

// Initialize calendar for the current month
generateCalendar(currentMonth);
