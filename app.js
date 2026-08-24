// model the room type and booking data(State management)
const sampleRooms = [
    { id: 101, name: "Deluxe Ocean View", price: "$120/night" },
    { id: 102, name: "Standard Double Room", price: "$80/night" }
];

let bookings = [];
let currentSelectedRoom = null;

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(sectionId).classList.remove('hidden-section');
    if (sectionId === 'admin-section') renderAdminBookings();
}

function searchRooms() {
    const list = document.getElementById('room-list');
    list.innerHTML = sampleRooms.map(room => `
        <div class="room-card">
            <h3>${room.name}</h3>
            <p>Price: ${room.price}</p>
            <button onclick="selectRoom(${room.id})">Book Now</button>
        </div>
    `).join('');
}

function selectRoom(roomId) {
    currentSelectedRoom = sampleRooms.find(r => r.id === roomId);
    document.getElementById('selected-room-name').innerText = currentSelectedRoom.name;
    document.getElementById('selected-room-price').innerText = currentSelectedRoom.price;
    showSection('booking-section');
}

function submitBooking(event) {
    event.preventDefault();
    const newBooking = {
        id: 'BK-' + Date.now().toString().slice(-4),
        guest: document.getElementById('guest-name').value,
        room: currentSelectedRoom.name,
        status: 'Confirmed'
    };
    bookings.push(newBooking);

    document.getElementById('success-details').innerHTML = `
        <p><strong>Booking ID:</strong> ${newBooking.id}</p>
        <p><strong>Guest:</strong> ${newBooking.guest}</p>
        <p><strong>Room:</strong> ${newBooking.room}</p>
    `;
    showSection('success-section');
}

function renderAdminBookings() {
    const tbody = document.getElementById('admin-booking-list');
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No bookings yet.</td></tr>';
        return;
    }
    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.guest}</td>
            <td>${b.room}</td>
            <td>${b.status}</td>
            <td><button onclick="cancelBooking('${b.id}')">Cancel</button></td>
        </tr>
    `).join('');
}

function cancelBooking(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) b.status = 'Cancelled';
    renderAdminBookings();
}

// default to load in room type list
searchRooms();