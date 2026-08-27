/* Room types contents */
const API_BASE_URL = 'http://localhost:5000/api'; /* Writing in my backend Port API, if it is 3000 then change to 3000 */
let sampleRooms = []; /* Initialize sampleRooms as an empty array, should load in dynamically by backend */

/* Add function to request room data from backend */
async function loadRoomsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const result = await response.json();
        /* If the response format is { success: true, data: [...]} */
        sampleRooms = result.data || result; 
        renderRooms(sampleRooms);
    } catch (err) {
        console.error("Can not load in room data:", err);
    }
}
let currentSelectedRoom = null;

/* Show the Bookings Status */
function isRoomBooked(roomId) {
    return bookings.some(b => b.roomId === roomId && (b.status === 'Confirmed' || b.status === 'Pending'));
}

/* Admin management page for delete or add room types */
function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });

    /* If booking cancel by guest, the Admin manage page will delete the order instantly */
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
    }

    if (sectionId === 'admin-manage-section') renderAdminBookings();
    if (sectionId === 'guest-booking-list-section') renderGuestBookings();
    if (sectionId === 'admin-room-types-section') renderAdminRoomTypes();
    if (sectionId === 'search-section') renderRooms(sampleRooms);
    if (sectionId === 'admin-home-section') {
        const activeBookings = bookings.filter(b => b.status !== 'Cancelled by Guest');
        document.getElementById('total-bookings-count').innerText = activeBookings.length;
        document.getElementById('total-room-types-count').innerText = sampleRooms.length;
    }
}

/* Admin login page warning windows */
function handleAdminLogin(event) {
    event.preventDefault();
    showSection('admin-home-section');
}

function handleAdminRegister(event) {
    event.preventDefault();
    alert('Account created successfully!');
    showSection('admin-login-section');
}

/* The room cards should shown the active status */
function renderRooms(roomsToRender) {
    const list = document.getElementById('room-list');
    if (!list) return;

    list.innerHTML = roomsToRender.map(room => {
        const booked = isRoomBooked(room.id);
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

/* Search function for calendar checkin /  checkout dates */
function filterRooms() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    const filtered = sampleRooms.filter(r => 
        r.name.toLowerCase().includes(query) || 
        (r.description && r.description.toLowerCase().includes(query))
    );
    renderRooms(filtered);
}

/* Check the logic of checkin and checkout dates, checkout date should be later than checkin date */
function searchRooms() {
    const checkinElem = document.getElementById('checkin');
    const checkoutElem = document.getElementById('checkout');

    const checkinInput = checkinElem ? checkinElem.value : '';
    const checkoutInput = checkoutElem ? checkoutElem.value : '';

    if (checkinInput && checkoutInput) {
        const checkinDate = new Date(checkinInput);
        const checkoutDate = new Date(checkoutInput);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkinDate < today) {
            alert("Check-in date cannot be in the past!");
            return;
        }

        if (checkoutDate <= checkinDate) {
            alert("Check-out date must be later than Check-in date!");
            return;
        }
    } else if (checkinInput || checkoutInput) {
        alert("Please select both Check-in and Check-out dates!");
        return;
    }

    renderRooms(sampleRooms);
}
/* When the room been booked will show the already booked words */
function selectRoom(roomId) {
    if (isRoomBooked(roomId)) {
        alert("This room is already booked!");
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

/* Submit Booking and warning if it is already been booked */
async function submitBooking(event) {
    event.preventDefault();

    if (!currentSelectedRoom || isRoomBooked(currentSelectedRoom.id)) {
        alert("Sorry, this room is no longer available!");
        renderRooms(sampleRooms);
        showSection('search-section');
        return;
    }

    /* The data format prepare to send to the backend */
    const bookingPayload = {
        roomId: currentSelectedRoom.id,
        guestName: document.getElementById('guest-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        checkIn: "2026-09-01",  /* Compare to the real field */
        checkOut: "2026-09-05"
    };

    try {
        /* Send POST to request to the backend Booking Service */
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });

        const result = await response.json();

        if (response.ok) {
            /* When the backend save successfully, synchronize update the frontend display bookings */
            const newBooking = {
                id: 'BK-' + (result.booking?.id || Date.now().toString().slice(-4)),
                roomId: currentSelectedRoom.id,
                guest: bookingPayload.guestName,
                email: bookingPayload.email,
                phone: bookingPayload.phone,
                room: currentSelectedRoom.name,
                price: currentSelectedRoom.price,
                img: currentSelectedRoom.img,
                status: 'Pending'
            };

            bookings.push(newBooking);

            document.getElementById('guest-name').value = '';
            document.getElementById('guest-email').value = '';
            document.getElementById('guest-phone').value = '';

            renderRooms(sampleRooms);
            showBookingDetails(newBooking.id);
        } else {
            alert(result.message || "Booking failed! Please try again.");
        }
    } catch (error) {
        console.error("Linking error:", error);
        alert("Can not connect to the backend server!");
    }
}

/* Booking Successful page including copy booking ID and modal the email/SMS message to guest */
function showBookingDetails(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('success-details').innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin: 15px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:#f8fafc; padding:10px; border-radius:6px; border:1px dashed #cbd5e1;">
                <div>
                    <span style="font-size:12px; color:#64748b; display:block;">Your Booking ID</span>
                    <strong style="color:#1E3A8A; font-size:18px;">${b.id}</strong>
                </div>
                <button onclick="copyBookingId('${b.id}')" style="background:#1E3A8A; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;">Copy ID</button>
            </div>

            <p style="margin-bottom:8px;"><strong>Guest Name:</strong> ${b.guest}</p>
            <p style="margin-bottom:8px;"><strong>Phone:</strong> ${b.phone}</p>
            <p style="margin-bottom:8px;"><strong>Email:</strong> ${b.email}</p>
            <p style="margin-bottom:8px;"><strong>Room Type:</strong> ${b.room}</p>
            <p style="margin-bottom:8px;"><strong>Total Price:</strong> ${b.price}</p>
            <p style="margin-bottom:16px;"><strong>Status:</strong> <span style="font-weight:bold; color:${b.status === 'Confirmed' ? '#166534' : b.status === 'Pending' ? '#d97706' : '#dc2626'}">${b.status}</span></p>

            <!-- Modal Email / SMS sending message to guest --> 
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px; border-radius:6px; font-size:13px; color:#166534;">
                <p style="margin:0 0 4px 0; font-weight:bold;">✉️ Confirmation Sent!</p>
                <p style="margin:0; line-height:1.4;">A booking confirmation email has been sent to <strong>${b.email}</strong> and SMS notification to <strong>${b.phone}</strong>. Please save your Booking ID for future search.</p>
            </div>
        </div>
    `;
    showSection('success-section');
}

/* Copy Booking ID for guest's order */
function copyBookingId(id) {
    navigator.clipboard.writeText(id).then(() => {
        alert("Booking ID copied to clipboard: " + id);
    }).catch(() => {
        alert("Booking ID: " + id);
    });
}

/* Guest Finding Order page */
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

/* executive searching for Booking ID + Phone (Compare) */
function searchGuestBookings() {
    const queryId = document.getElementById('search-booking-id').value.toLowerCase().trim();
    const queryPhone = document.getElementById('search-booking-phone').value.toLowerCase().trim();
    const container = document.getElementById('guest-booking-cards');
    if (!container) return;

    if (!queryId || !queryPhone) {
        alert("Please enter BOTH Booking ID and Phone Number to search!");
        return;
    }

    const matchedBookings = bookings.filter(b => 
        b.status !== 'Cancelled by Guest' && 
        b.id.toLowerCase() === queryId &&
        b.phone.toLowerCase() === queryPhone
    );

    if (matchedBookings.length === 0) {
        container.innerHTML = '<p style="color:#dc2626;">No matching booking found. Please check your Booking ID and Phone Number.</p>';
        return;
    }

    container.innerHTML = matchedBookings.map(b => `
        <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
            <img src="${b.img}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
            <div>
                <span class="tag" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">Booking ID: ${b.id}</span>
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

/* Order cancel by guest */
function cancelBookingByGuest(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const b = bookings.find(item => item.id === bookingId);
        if (b) {
            b.status = 'Cancelled by Guest';
            searchGuestBookings();
            renderRooms(sampleRooms);
        }
    }
}

function renderAdminRoomTypes() {
    const container = document.getElementById('admin-room-type-grid');
    if (!container) return;

    if (sampleRooms.length === 0) {
        container.innerHTML = '<p style="color:#64748b;">No room types available.</p>';
        return;
    }
    container.innerHTML = sampleRooms.map(room => {
        const booked = isRoomBooked(room.id);
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

/* Admin add new room type */
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

/* Admin edit room type */
function handleSaveRoomType(event) {
    event.preventDefault();
    const editId = document.getElementById('edit-room-id').value;
    const name = document.getElementById('new-room-name').value.trim();
    const price = document.getElementById('new-room-price').value.trim();
    const desc = document.getElementById('new-room-desc').value.trim();
    let img = document.getElementById('new-room-img').value.trim();

    if (!img) img = 'img/Hotel Single Room.jpg';

    if (editId) {
        const room = sampleRooms.find(r => r.id == editId);
        if (room) {
            room.name = name;
            room.price = price;
            room.description = desc;
            room.img = img;
        }
    } else {
        const newRoom = {
            id: Date.now(),
            name: name,
            price: price,
            description: desc,
            tag: "Available",
            img: img
        };
        sampleRooms.push(newRoom);
    }

    closeAddRoomModal();
    renderAdminRoomTypes();
    renderRooms(sampleRooms);
}

/* Admin delete room type */
function deleteRoomType(roomId) {
    if (confirm("Are you sure you want to delete this room type?")) {
        sampleRooms = sampleRooms.filter(r => r.id !== roomId);
        renderAdminRoomTypes();
        renderRooms(sampleRooms);
    }   
}

/* Admin bookings list shown */
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
            <td style="padding:12px;">${b.id}</td>
            <td style="padding:12px;">${b.guest}</td>
            <td style="padding:12px;">${b.room}</td>
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

/* Admin update booking status function */
function updateBookingStatus(bookingId, newStatus) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
        b.status = newStatus;
        renderAdminBookings();
        renderRooms(sampleRooms);
    }
}

/* If webpage is loaded, execute this */
document.addEventListener('DOMContentLoaded', loadRoomsFromBackend);