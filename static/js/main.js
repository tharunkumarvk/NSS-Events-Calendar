const API_URL = "http://127.0.0.1:5000"; // Use this exact URL
const ADMIN_PASSWORD = "admin123";
let currentMonth = new Date().getMonth();

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

let events = {}; // This will now be populated from the backend

// Fetch events for the current month
async function fetchEvents(month) {
    try {
        const response = await fetch(`${API_URL}/events/${month}`);
        const monthEvents = await response.json();
        
        // Reset events and populate with backend data
        events = {};
        monthEvents.forEach(event => {
            const key = `${event.day}-${event.month}`;
            events[key] = {
                id: event.id,
                title: event.title,
                description: event.description
            };
        });
        
        generateCalendar(month);
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

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
            editEventBtn.onclick = () => editEvent(key, event.id);
            deleteEventBtn.onclick = () => deleteEvent(key, event.id);
        } else {
            adminOptions.style.display = "none";
            addEventOptions.style.display = "none";
        }
    } else {
        adminOptions.style.display = "none";
        addEventOptions.style.display = "block";
        addEventBtn.onclick = () => addEvent(day, month);
    }
}

// Updates the upcoming events list based on the current month
function updateEventList(month) {
    eventListContainer.innerHTML = "";
    for (const key in events) {
        const [day, eventMonth] = key.split("-");
        if (parseInt(eventMonth) === month) {
            const event = events[key];
            eventListContainer.innerHTML += `
                <div class="event-item">
                    <h4>${event.title}</h4>
                    <p><strong>Date:</strong> ${new Date(2024, eventMonth, day).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                </div>
            `;
        }
    }
}

// Add event
async function addEvent(day, month) {
    const password = prompt("Enter Admin Password to Add Event:");
    if (password === ADMIN_PASSWORD) {
        const title = prompt("Enter Event Title:");
        const description = prompt("Enter Event Description:");
        
        if (title && description) {
            try {
                const response = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Admin-Password': ADMIN_PASSWORD
                    },
                    body: JSON.stringify({
                        day: day,
                        month: month,
                        title: title,
                        description: description
                    })
                });

                if (response.ok) {
                    alert("Event added successfully!");
                    modal.style.display = "none";
                    fetchEvents(currentMonth);
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error("Error adding event:", error);
                alert("Failed to add event");
            }
        }
    } else {
        alert("Incorrect Admin Password.");
    }
}

// Edit event
async function editEvent(key, eventId) {
    const event = events[key];
    const title = prompt("Edit Event Title:", event.title);
    const description = prompt("Edit Event Description:", event.description);
    
    if (title && description) {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': ADMIN_PASSWORD
                },
                body: JSON.stringify({
                    title: title,
                    description: description
                })
            });

            if (response.ok) {
                alert("Event updated successfully!");
                modal.style.display = "none";
                fetchEvents(currentMonth);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error editing event:", error);
            alert("Failed to edit event");
        }
    }
}

// Delete event
async function deleteEvent(key, eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Password': ADMIN_PASSWORD
                }
            });

            if (response.ok) {
                alert("Event deleted successfully!");
                modal.style.display = "none";
                fetchEvents(currentMonth);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event");
        }
    }
}

closeModal.onclick = () => (modal.style.display = "none");

// Previous month button logic (wraps around to December if January is selected)
document.getElementById("prev-month").onclick = () => {
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1; // Loop back to December if it's January
    fetchEvents(currentMonth);
};

// Next month button logic (wraps around to January if December is selected)
document.getElementById("next-month").onclick = () => {
    currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1; // Loop back to January if it's December
    fetchEvents(currentMonth);
};

// Initial events fetch
fetchEvents(currentMonth);