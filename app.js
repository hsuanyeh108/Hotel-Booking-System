// Fimiliar Figma design of room type data and price
const sampleRooms = [
    { id: 101, name: "1 King Bed", price: "A$120/per night", tag: "Available", desc: "Max 2 Guests • Free Wifi & Gym" },
    { id: 102, name: "2 Single Beds", price: "A$100/per night", tag: "Available", desc: "Max 2 Guests • Free Wifi" },
    { id: 103, name: "Deluxe Ocean Suite", price: "A$180/per night", tag: "Available", desc: "Max 4 Guests • Ocean View" }
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
            <div>
                <span class="tag">${room.tag}</span>
                <h3>${room.name}</h3>
                <p style="color:#64748b; font-size:13px; margin-bottom:10px;">${room.desc}</p>
                <div class="price">${room.price}</div>
            </div>
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
        price: currentSelectedRoom.price,
        status: 'Confirmed'
    };
    bookings.push(newBooking);

    document.getElementById('success-details').innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin: 15px 0;">
            <p><strong>Booking ID:</strong> ${newBooking.id}</p>
            <p><strong>Guest Name:</strong> ${newBooking.guest}</p>
            <p><strong>Room Type:</strong> ${newBooking.room}</p>
            <p><strong>Total Price:</strong> ${newBooking.price}</p>
            <p><strong>Status:</strong> <span style="color:#166534; font-weight:bold;">${newBooking.status}</span></p>
        </div>
    `;
    showSection('success-section');
}

function renderAdminBookings() {
    const tbody = document.getElementById('admin-booking-list');
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:15px; text-align:center; color:#64748b;">No active bookings found.</td></tr>';
        return;
    }
    tbody.innerHTML = bookings.map(b => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding:12px;">${b.id}</td>
            <td style="padding:12px;">${b.guest}</td>
            <td style="padding:12px;">${b.room}</td>
            <td style="padding:12px;"><span style="color:${b.status === 'Confirmed' ? '#166534' : '#991b1b'}; font-weight:bold;">${b.status}</span></td>
            <td style="padding:12px;"><button style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="cancelBooking('${b.id}')">Cancel</button></td>
        </tr>
    `).join('');
}

function cancelBooking(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) b.status = 'Cancelled';
    renderAdminBookings();
}

// Initial load in
searchRooms();