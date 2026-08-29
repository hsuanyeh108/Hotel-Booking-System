/*Room types and card content*/
const API_BASE_URL = '/api';
let sampleRooms = [];

async function loadRoomsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const result = await response.json();
        sampleRooms = result.data || [];
        renderRooms(sampleRooms);
    } catch (err) {
        console.error("Cannot load rooms from backend:", err);
    }
}

async function loadRoomsWithDates(checkIn, checkOut) {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
        const result = await response.json();
        sampleRooms = result.data || [];
        renderRooms(sampleRooms);
    } catch (err) {
        console.error("Cannot load rooms:", err);
    }
}

let bookings = [];
let currentSelectedRoom = null;
/*Store the dates selected by the guest*/
let selectedCheckIn = '';
let selectedCheckOut = '';

/*Checking the date is booked or not*/
function isRoomBooked(roomId, checkIn, checkOut) {

    /*If guest has not selected dates yet,do not mark the room as unavailable*/
    if (!checkIn || !checkOut) {
        return false;
    }

    const selectedStart = new Date(checkIn);
    const selectedEnd = new Date(checkOut);

    return bookings.some(b => {

        /*Only check the same room*/
        if (b.roomId !== roomId) {
            return false;
        }

        /*Cancelled bookings do not block the room*/
        if (b.status !== 'Confirmed' && b.status !== 'Pending') {
            return false;
        }

        /*Existing booking dates*/
        const existingStart = new Date(b.checkIn);
        const existingEnd = new Date(b.checkOut);

        /*Check whether the two booking periods overlap*/
        return selectedStart < existingEnd && selectedEnd > existingStart;
    });
}

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
    }

    if (sectionId === 'admin-manage-section') loadAdminBookings();
    if (sectionId === 'guest-booking-list-section') renderGuestBookings();
    if (sectionId === 'admin-room-types-section') loadAdminRoomTypes();
    if (sectionId === 'search-section') renderRooms(sampleRooms);
    if (sectionId === 'admin-home-section') {
        const activeBookings = bookings.filter(b => b.status !== 'Cancelled by Guest');
        document.getElementById('total-bookings-count').innerText = activeBookings.length;
        document.getElementById('total-room-types-count').innerText = sampleRooms.length;
    }
}

/*Admin Login page*/
function handleAdminLogin(event) {
    event.preventDefault();
    showSection('admin-home-section');
}

/*Admin register page*/
function handleAdminRegister(event) {
    event.preventDefault();
    alert('Account created successfully!');
    showSection('admin-login-section');
}

/*Room list*/
function renderRooms(roomsToRender) {
    const list = document.getElementById('room-list');
    if (!list) return;

    list.innerHTML = roomsToRender.map(room => {
        const booked = room.available === false;
        const tagText = booked ? "Non-available" : "Available";
        const tagBg = booked ? "#fee2e2" : "#dcfce7";
        const tagColor = booked ? "#dc2626" : "#15803d";
        const btnAttr = booked ? "disabled style='background:#94a3b8; cursor:not-allowed; width:100%; padding:8px; border:none; border-radius:6px; color:white;'" : "style='background:#1E3A8A; cursor:pointer; width:100%; padding:8px; border:none; border-radius:6px; color:white;'";
        const btnText = booked ? "Already Booked" : "Book Now";

        return `
            <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <img src="${room.img}" alt="${room.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                    <span class="tag" style="background:${tagBg}; color:${tagColor}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold;">${tagText}</span>
                    <h3 style="font-size:16px; margin: 6px 0;">${room.name}</h3>
                    <p style="font-size:13px; color:#64748b; margin-bottom:8px; line-height:1.4;">${room.description || ''}</p>
                    <div class="price" style="margin-bottom:12px; font-weight:bold; color:#1E3A8A;">${room.price}</div>
                </div>
                <button ${btnAttr} onclick="selectRoom(${room.id})">${btnText}</button>
            </div>
        `;
    }).join('');
}

/*Room filter*/
function filterRooms() {

    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    const filtered = sampleRooms.filter(room => {

        /*Check room name / description*/
        const matchesSearch =
            room.name.toLowerCase().includes(query) ||
            (room.description &&
             room.description.toLowerCase().includes(query));

        /*Check whether the room is available for selected dates*/
        const availableForDates = room.available !== false;
        return matchesSearch && availableForDates;
    });

    renderRooms(filtered);
}

/*Room search by navbar*/
function searchRoomsByNavbar() {

    /*Go to Search Rooms section*/
    showSection('search-section');

    /*Get the room name entered in the navbar search bar*/
    const searchInput = document.getElementById('global-search');

    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    /*Filter by room name/description*/
    const filtered = sampleRooms.filter(room => {

        const matchesSearch =
            room.name.toLowerCase().includes(query) ||
            (room.description &&
             room.description.toLowerCase().includes(query));

        /*Filter by selected check-in / check-out dates*/
        const availableForDates = room.available !== false;

        return matchesSearch && availableForDates;
    });

    renderRooms(filtered);
}

/*Room search checkin and checkout dates*/
function searchRooms() {

    const checkinElem = document.getElementById('checkin');
    const checkoutElem = document.getElementById('checkout');

    const checkinInput = checkinElem ? checkinElem.value : '';
    const checkoutInput = checkoutElem ? checkoutElem.value : '';

    if (!checkinInput || !checkoutInput) {
        alert("Please select both Check-in and Check-out dates!");
        return;
    }

    const checkinDate = new Date(checkinInput);
    const checkoutDate = new Date(checkoutInput);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /*Check-in cannot be in the past*/
    if (checkinDate < today) {
        alert("Check-in date cannot be in the past!");
        return;
    }

    /*Check-out must be later than check-in*/
    if (checkoutDate <= checkinDate) {
        alert("Check-out date must be later than Check-in date!");
        return;
    }

    /*Save the selected dates*/
    selectedCheckIn = checkinInput;
    selectedCheckOut = checkoutInput;

    /*Send dates to backend to get rooms filtered by availability*/
    loadRoomsWithDates(selectedCheckIn, selectedCheckOut);
}

/*Room seletion*/
function selectRoom(roomId) {

    if (isRoomBooked(roomId, selectedCheckIn, selectedCheckOut)) {
        alert("This room is already booked for the selected dates!");
        renderRooms(sampleRooms);
        return;
    }

    currentSelectedRoom = sampleRooms.find(r => r.id === roomId);
    document.getElementById('selected-room-name').innerText = currentSelectedRoom.name;
    document.getElementById('selected-room-price').innerText = currentSelectedRoom.price;

    const previewContainer = document.getElementById('selected-room-card-preview');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
                <img src="${currentSelectedRoom.img}" alt="${currentSelectedRoom.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                <div>
                    <span class="tag" style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold;">Available</span>
                    <h3 style="font-size:16px; margin: 4px 0;">${currentSelectedRoom.name}</h3>
                    <p style="font-size:13px; color:#64748b; margin-bottom:8px;">${currentSelectedRoom.description || ''}</p>
                    <div class="price">${currentSelectedRoom.price}</div>
                </div>
            </div>
        `;
    }

    showSection('booking-section');
}

/*Submit booking form*/
async function submitBooking(event) {

    event.preventDefault();

    if (!selectedCheckIn || !selectedCheckOut) {
        alert("Please select Check-in and Check-out dates first!");
        showSection('search-section');
        return;
    }

    if (!currentSelectedRoom) {
        alert("Please select a room first!");
        showSection('search-section');
        return;
    }

    const bookingPayload = {
        guestName: document.getElementById('guest-name').value,
        roomId: currentSelectedRoom.id,
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        phone: document.getElementById('guest-phone').value,
        email: document.getElementById('guest-email').value
    };

    try {

        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingPayload)
        });

        const result = await response.json();

        if (response.ok) {

            // Use the booking created by the Backend
            const newBooking = result.booking;

            // Add the Backend booking to Frontend memory
            bookings.push(newBooking);

            // Clear guest form
            document.getElementById('guest-name').value = '';
            document.getElementById('guest-email').value = '';
            document.getElementById('guest-phone').value = '';

            // Show booking success page
            showBookingDetails(newBooking.id);

        } else {

            alert(result.message || "Booking failed! Please try again.");

        }

    } catch (error) {

        console.error("Connection error:", error);
        alert("Cannot connect to the backend server!");

    }
}

/*Booking Successful page, including CopyID button and modal to send message to email/ SMS to phone*/
function showBookingDetails(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('success-details').innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin: 15px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:#f8fafc; padding:10px; border-radius:6px; border:1px dashed #cbd5e1;">
                <div>
                    <span style="font-size:12px; color:#64748b; display:block;">Your Booking ID</span>
                    <strong style="color:#1E3A8A; font-size:18px;">BK-${b.id}</strong>
                </div>
                <button onclick="copyBookingId('${b.id}')" style="background:#1E3A8A; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;">Copy ID</button>
            </div>

            <p style="margin-bottom:8px;"><strong>Guest Name:</strong> ${b.guest}</p>
            <p style="margin-bottom:8px;"><strong>Phone:</strong> ${b.phone}</p>
            <p style="margin-bottom:8px;"><strong>Email:</strong> ${b.email}</p>
            <p style="margin-bottom:8px;"><strong>Room Type:</strong> ${b.room}</p>
            <p style="margin-bottom:8px;"><strong>Total Price:</strong> ${b.price}</p>
            <p style="margin-bottom:16px;"><strong>Status:</strong> <span style="font-weight:bold; color:${b.status === 'Confirmed' ? '#166534' : b.status === 'Pending' ? '#d97706' : '#dc2626'}">${b.status}</span></p>

            <!-- modal for Email / SMS to phone-->
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:6px; font-size:13px; color:#166534;">
                <p style="margin:0 0 4px 0; font-weight:bold;">✉️ Confirmation Sent!</p>
                <p style="margin:0; line-height:1.4;">A booking confirmation email has been sent to <strong>${b.email}</strong> and SMS notification to <strong>${b.phone}</strong>. Please save your Booking ID for future search.</p>
            </div>
        </div>
    `;
    showSection('success-section');
}

/* One button to copy Booking ID*/
function copyBookingId(id) {
    navigator.clipboard.writeText(id).then(() => {
        alert("Booking ID copied to clipboard: " + id);
    }).catch(() => {
        alert("Booking ID: " + id);
    });
}

/*Guest Booking Finding page*/
function renderGuestBookings() {
    const container = document.getElementById('guest-booking-cards');
    const inputId = document.getElementById('search-booking-id');
    const inputPhone = document.getElementById('search-booking-phone');
    
    if (inputId) inputId.value = '';
    if (inputPhone) inputPhone.value = '';
    if (container) {
        container.innerHTML = '<p style="color:#64748b;">Please enter your <strong>Booking ID</strong> and <strong>Phone Number</strong> above to search your booking.</p>';
    }
}

/* Excute searching(Booking ID + Phone compare)*/
async function searchGuestBookings() {
    const queryId = document.getElementById('search-booking-id').value.toLowerCase().trim();
    const queryPhone = document.getElementById('search-booking-phone').value.toLowerCase().trim();
    const container = document.getElementById('guest-booking-cards');
    if (!container) return;

    if (!queryId || !queryPhone) {
        alert("Please enter BOTH Booking ID and Phone Number to search!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const result = await response.json();
        bookings = result.data || [];
    } catch (err) {
        console.error("Cannot load bookings:", err);
        container.innerHTML = '<p style="color:#dc2626;">Cannot connect to server.</p>';
        return;
    }

    const matchedBookings = bookings.filter(b => {
    const displayId = ('BK-' + b.id).toLowerCase();
    return b.status !== 'Cancelled by Guest' &&
           displayId === queryId &&
           b.phone && b.phone.toLowerCase() === queryPhone;
    });

    if (matchedBookings.length === 0) {
        container.innerHTML = '<p style="color:#dc2626;">No matching booking found. Please check your Booking ID and Phone Number.</p>';
        return;
    }

    container.innerHTML = matchedBookings.map(b => `
        <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
            <img src="${b.img}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
            <div>
                <span class="tag" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">Booking ID: BK-${b.id}</span>
                <h3 style="font-size:16px; margin: 6px 0;">${b.room}</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:4px;">Guest: ${b.guest}</p>
                <p style="font-size:14px; color:#475569; margin-bottom:4px;">Phone: ${b.phone}</p>
                <div class="price" style="margin-bottom:8px; font-weight:bold;">${b.price}</div>
                <p style="margin-bottom:12px;">Status: <strong style="color: ${b.status === 'Confirmed' ? '#166534' : b.status === 'Pending' ? '#d97706' : '#dc2626'}">${b.status}</strong></p>
            </div>
            <div style="display:flex; gap:8px;">
                <button style="background:#1E3A8A; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="showBookingDetails('${b.id}')">View</button>
                <button style="background:#dc2626; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="cancelBookingByGuest('${b.id}')">Cancel</button>
            </div>
        </div>
    `).join('');
}

/*Cancel booking order*/
async function cancelBookingByGuest(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const numericId = Number(String(bookingId).replace('BK-', ''));

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${numericId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled by Guest' })
        });
        const result = await response.json();

        if (response.ok) {
            searchGuestBookings();
        } else {
            alert(result.message || "Failed to cancel booking");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot connect to backend server!");
    }
}

/*Admin room types page*/
function renderAdminRoomTypes() {
    const container = document.getElementById('admin-room-type-grid');
    if (!container) return;

    if (sampleRooms.length === 0) {
        container.innerHTML = '<p style="color:#64748b;">No room types available.</p>';
        return;
    }
    container.innerHTML = sampleRooms.map(room => {
        const booked = false;
        const tagText = booked ? "Non-available" : "Available";
        const tagBg = booked ? "#fee2e2" : "#dcfce7";
        const tagColor = booked ? "#dc2626" : "#15803d";

        return `
            <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <img src="${room.img}" alt="${room.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                    <span class="tag" style="background:${tagBg}; color:${tagColor}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold;">${tagText}</span>
                    <h3 style="font-size:16px; margin: 4px 0;">${room.name}</h3>
                    <p style="font-size:13px; color:#64748b; margin-bottom:8px; line-height:1.4;">${room.description || ''}</p>
                    <div class="price" style="margin-bottom:12px;">${room.price}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button style="background:#1E3A8A; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="openEditRoomModal(${room.id})">Edit</button>
                    <button style="background:#dc2626; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="deleteRoomType(${room.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/*Room types page add function*/
function openAddRoomModal() {
    document.getElementById('modal-title').innerText = "Add New Room Type";
    document.getElementById('edit-room-id').value = "";
    document.getElementById('new-room-name').value = "";
    document.getElementById('new-room-price').value = "";
    document.getElementById('new-room-desc').value = "";
    document.getElementById('new-room-img').value = "";
    document.getElementById('add-room-modal').style.display = 'flex';
}

function openEditRoomModal(roomId) {
    const room = sampleRooms.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('modal-title').innerText = "Edit Room Type";
    document.getElementById('edit-room-id').value = room.id;
    document.getElementById('new-room-name').value = room.name;
    document.getElementById('new-room-price').value = room.price;
    document.getElementById('new-room-desc').value = room.description || "";
    document.getElementById('new-room-img').value = room.img;
    document.getElementById('add-room-modal').style.display = 'flex';
}

function closeAddRoomModal() {
    document.getElementById('add-room-modal').style.display = 'none';
}

async function handleSaveRoomType(event) {
    event.preventDefault();
    const editId = document.getElementById('edit-room-id').value;
    const name = document.getElementById('new-room-name').value.trim();
    const price = document.getElementById('new-room-price').value.trim();
    const desc = document.getElementById('new-room-desc').value.trim();
    let img = document.getElementById('new-room-img').value.trim();

    if (!img) img = 'img/Hotel Single Room.jpg';

    const payload = { name, price, description: desc, img };

    try {
        let response;
        if (editId) {
            response = await fetch(`${API_BASE_URL}/rooms/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (response.ok) {
            closeAddRoomModal();
            loadAdminRoomTypes();
        } else {
            alert(result.message || "Failed to save room type");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot connect to backend server!");
    }
}

/*Room type page delete function*/
async function deleteRoomType(roomId) {
    if (!confirm("Are you sure you want to delete this room type?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (response.ok) {
            loadAdminRoomTypes();
        } else {
            alert(result.message || "Failed to delete room type");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot connect to backend server!");
    }
}

async function loadAdminBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const result = await response.json();
        bookings = result.data || [];
        renderAdminBookings();
    } catch (err) {
        console.error("Cannot load bookings:", err);
    }
}

async function loadAdminRoomTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const result = await response.json();
        sampleRooms = result.data || [];
        renderAdminRoomTypes();
    } catch (err) {
        console.error("Cannot load room types:", err);
    }
}

function renderAdminBookings() {
    const tbody = document.getElementById('admin-booking-list');
    if (!tbody) return;

    const visibleBookings = bookings.filter(b => b.status !== 'Cancelled by Guest');

    if (visibleBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:15px; text-align:center; color:#64748b;">No active bookings found.</td></tr>';
        return;
    }
    tbody.innerHTML = visibleBookings.map(b => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding:12px;">BK-${b.id}</td>
            <td style="padding:12px;">${b.guest}</td>
            <td style="padding:12px;">${b.room}</td>
            <td style="padding:12px;">
                ${b.checkIn} → ${b.checkOut}
            </td>
            <td style="padding:12px;">
                <select onchange="updateBookingStatus('${b.id}', this.value)" style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1;">
                    <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Cancelled by Admin" ${b.status === 'Cancelled by Admin' ? 'selected' : ''}>Cancelled by Admin</option>
                </select>
            </td>
            <td style="padding:12px;">
                <button style="background:#166534; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:6px;" onclick="updateBookingStatus('${b.id}', 'Confirmed')">Confirm</button>
                <button style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="updateBookingStatus('${b.id}', 'Cancelled by Admin')">Cancel</button>
            </td>
        </tr>
    `).join('');
}

/*Room type page update*/
async function updateBookingStatus(bookingId, newStatus) {
    const numericId = Number(String(bookingId).replace('BK-', ''));

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${numericId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();

        if (response.ok) {
            loadAdminBookings();
            renderRooms(sampleRooms);
        } else {
            alert(result.message || "Failed to update booking status");
        }
    } catch (err) {
        console.error(err);
        alert("Cannot connect to backend server!");
    }
}

document.addEventListener('DOMContentLoaded', loadRoomsFromBackend);