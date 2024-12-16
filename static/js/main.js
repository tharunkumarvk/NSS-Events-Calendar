const calendar = document.getElementById("calendar");
const monthName = document.getElementById("month-name");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const eventForm = document.getElementById("event-form");
const eventTitle = document.getElementById("event-title");
const eventDate = document.getElementById("event-date");
const eventDescription = document.getElementById("event-description");
const secretCode = document.getElementById("secret-code");

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
let currentMonth = new Date().getMonth();

async function fetchEvents() {
    const response = await fetch("/get-events");
    return response.json();
}

function generateCalendar(month, events) {
    calendar.innerHTML = "";
    monthName.textContent = `${monthNames[month]}`;

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(day => {
        calendar.innerHTML += `<div class='day-header'>${day}</div>`;
    });

    const firstDay = new Date(new Date().getFullYear(), month, 1).getDay();
    const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div class='day'></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `2024-${month + 1}-${day}`;
        let eventsHTML = "";
        if (events[dateKey]) {
            events[dateKey].forEach((event, index) => {
                eventsHTML += `<div class='event'>${event.title}</div>`;
            });
        }
        calendar.innerHTML += `<div class='day'>
            <strong>${day}</strong>
            ${eventsHTML}
        </div>`;
    }
}

async function updateCalendar() {
    const events = await fetchEvents();
    generateCalendar(currentMonth, events);
}

eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: eventTitle.value,
            description: eventDescription.value,
            date: eventDate.value,
            secretCode: secretCode.value
        })
    });
    const result = await response.json();
    if (response.ok) {
        alert("Event added successfully!");
        updateCalendar();
    } else {
        alert(result.message);
    }
});

prevMonthBtn.addEventListener("click", () => {
    currentMonth = (currentMonth - 1 + 12) % 12;
    updateCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentMonth = (currentMonth + 1) % 12;
    updateCalendar();
});

updateCalendar();
