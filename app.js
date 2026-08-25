let sampleRooms = [
    { id: 101, name: "Standard Single Room", price: "A$45/per night", tag: "Available", img: "img/Hotel Single Room.jpg" },
    { id: 102, name: "Double Room", price: "A$90/per night", tag: "Available", img: "img/Double Room.jpg" },
    { id: 103, name: "Excutive Room", price: "A$120/per night", tag: "Available", img: "img/Excutive Room.jpg" },
    { id: 104, name: "Standard Single Room", price: "A$45/per night", tag: "Available", img: "img/Single Room2.jpg" },
    { id: 105, name: "Double Room", price: "A$90/per night", tag: "Available", img: "img/Double Room2.jpg" },
    { id: 106, name: "Excutive Room", price: "A$120/per night", tag: "Available", img: "img/Excutive Room2.jpg" }
];

let bookings = [];
let currentSelectedRoom = null;

// 取得當前裝置儲存的個人訂單 ID 列表
function getMyBookingIds() {
    return JSON.parse(localStorage.getItem('my_booking_ids') || '[]');
}

// 儲存新訂單 ID 到當前裝置
function saveMyBookingId(id) {
    const ids = getMyBookingIds();
    ids.push(id);
    localStorage.setItem('my_booking_ids', JSON.stringify(ids));
}

// 檢查房間是否已被預訂
function isRoomBooked(roomId) {
    return bookings.some(b => b.roomId === roomId && (b.status === 'Confirmed' || b.status === 'Pending'));
}

// 切換頁面視圖
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

// Admin 登入與註冊
function handleAdminLogin(event) {
    event.preventDefault();
    showSection('admin-home-section');
}

function handleAdminRegister(event) {
    event.preventDefault();
    alert('Account created successfully!');
    showSection('admin-login-section');
}

// 渲染房間列表
function renderRooms(roomsToRender) {
    const list = document.getElementById('room-list');
    if (!list) return;

    list.innerHTML = roomsToRender.map(room => {
        const booked = isRoomBooked(room.id);
        const tagText = booked ? "Non-available" : "Available";
        const tagBg = booked ? "#fee2e2" : "#dcfce7";
        const tagColor = booked ? "#dc2626" : "#15803d";
        const btnAttr = booked ? "disabled style='background:#94a3b8; cursor:not-allowed;'" : "style='background:#1E3A8A; cursor:pointer;'";
        const btnText = booked ? "Already Booked" : "Book Now";

        return `
            <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
                <img src="${room.img}" alt="${room.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                <div>
                    <span class="tag" style="background:${tagBg}; color:${tagColor}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold;">${tagText}</span>
                    <h3 style="font-size:16px; margin: 6px 0;">${room.name}</h3>
                    <div class="price" style="margin-bottom:12px; font-weight:bold; color:#1E3A8A;">${room.price}</div>
                </div>
                <button ${btnAttr} onclick="selectRoom(${room.id})">${btnText}</button>
            </div>
        `;
    }).join('');
}

// (1) 關鍵修復：即時關鍵字搜尋過濾
function filterRooms() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    const filtered = sampleRooms.filter(r => r.name.toLowerCase().includes(query));
    renderRooms(filtered);
}

// 日期驗證與搜尋
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
            alert("Check-in date cannot be in the past! Please select a valid date.");
            return;
        }

        if (checkoutDate <= checkinDate) {
            alert("Check-out date must be later than Check-in date! Please select a valid date range.");
            return;
        }
    } else if (checkinInput || checkoutInput) {
        alert("Please select both Check-in and Check-out dates!");
        return;
    }

    renderRooms(sampleRooms);
}

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
                    <div class="price">${currentSelectedRoom.price}</div>
                </div>
            </div>
        `;
    }

    showSection('booking-section');
}

// 提交預訂
function submitBooking(event) {
    event.preventDefault();

    if (!currentSelectedRoom || isRoomBooked(currentSelectedRoom.id)) {
        alert("Sorry, this room is no longer available!");
        renderRooms(sampleRooms);
        showSection('search-section');
        return;
    }

    const newBookingId = 'BK-' + Date.now().toString().slice(-4);
    const newBooking = {
        id: newBookingId,
        roomId: currentSelectedRoom.id,
        guest: document.getElementById('guest-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        room: currentSelectedRoom.name,
        price: currentSelectedRoom.price,
        img: currentSelectedRoom.img,
        status: 'Confirmed'
    };
    
    bookings.push(newBooking);

    // (2) 關鍵修復：紀錄這筆訂單屬於當前 Guest 瀏覽器
    saveMyBookingId(newBookingId);

    // 清空表單
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-email').value = '';
    document.getElementById('guest-phone').value = '';

    renderRooms(sampleRooms);
    showBookingDetails(newBooking.id);
}

function showBookingDetails(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('success-details').innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin: 15px 0;">
            <p style="margin-bottom:8px;"><strong>Booking ID:</strong> ${b.id}</p>
            <p style="margin-bottom:8px;"><strong>Guest Name:</strong> ${b.guest}</p>
            <p style="margin-bottom:8px;"><strong>Room Type:</strong> ${b.room}</p>
            <p style="margin-bottom:8px;"><strong>Total Price:</strong> ${b.price}</p>
            <p><strong>Status:</strong> <span class="${b.status === 'Confirmed' ? 'status-confirm' : 'status-cancelled'}">${b.status}</span></p>
        </div>
    `;
    showSection('success-section');
}

// 方案 B：預設清空，必須搜尋才顯示
function renderGuestBookings() {
    const container = document.getElementById('guest-booking-cards');
    const input = document.getElementById('booking-search-input');
    if (input) input.value = ''; // 清空搜尋框
    if (container) container.innerHTML = '<p style="color:#64748b;">Please enter your Name, Email, or Booking ID above to search your booking.</p>';
}

// 執行訂單查詢
function searchGuestBookings() {
    const query = document.getElementById('booking-search-input').value.toLowerCase().trim();
    const container = document.getElementById('guest-booking-cards');
    if (!container) return;

    if (!query) {
        alert("Please enter a Name, Email or Booking ID to search!");
        return;
    }

    // 只搜尋符合 Name / Email / Booking ID 的訂單
    const matchedBookings = bookings.filter(b => 
        b.status !== 'Cancelled by Guest' && 
        (b.id.toLowerCase().includes(query) || 
         b.guest.toLowerCase().includes(query) || 
         b.email.toLowerCase().includes(query))
    );

    if (matchedBookings.length === 0) {
        container.innerHTML = '<p style="color:#dc2626;">No matching bookings found.</p>';
        return;
    }

    container.innerHTML = matchedBookings.map(b => `
        <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
            <img src="${b.img}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
            <div>
                <span class="tag" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">Booking ID: ${b.id}</span>
                <h3 style="font-size:16px; margin: 6px 0;">${b.room}</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:4px;">Guest: ${b.guest}</p>
                <div class="price" style="margin-bottom:8px; font-weight:bold;">${b.price}</div>
                <p style="margin-bottom:12px;">Status: <strong style="color: ${b.status === 'Confirmed' ? '#166534' : '#dc2626'}">${b.status}</strong></p>
            </div>
            <div style="display:flex; gap:8px;">
                <button style="background:#1E3A8A; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="showBookingDetails('${b.id}')">View</button>
                <button style="background:#dc2626; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="cancelBookingByGuest('${b.id}')">Cancel</button>
            </div>
        </div>
    `).join('');
}

function cancelBookingByGuest(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const b = bookings.find(item => item.id === bookingId);
        if (b) {
            b.status = 'Cancelled by Guest';
            renderGuestBookings();
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
            <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
                <img src="${room.img}" alt="${room.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                <div>
                    <span class="tag" style="background:${tagBg}; color:${tagColor}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold;">${tagText}</span>
                    <h3 style="font-size:16px; margin: 4px 0;">${room.name}</h3>
                    <div class="price" style="margin-bottom:12px;">${room.price}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button style="background:#1E3A8A; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="editRoomType(${room.id})">Edit</button>
                    <button style="background:#dc2626; flex:1; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="deleteRoomType(${room.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function editRoomType(roomId) {
    const room = sampleRooms.find(r => r.id === roomId);
    if (!room) return;

    const newName = prompt("Edit Room Name:", room.name);
    if (newName === null || newName.trim() === "") return;

    const newPrice = prompt("Edit Room Price:", room.price);
    if (newPrice === null || newPrice.trim() === "") return;

    room.name = newName.trim();
    room.price = newPrice.trim();

    renderAdminRoomTypes();
    renderRooms(sampleRooms);
}

function deleteRoomType(roomId) {
    if (confirm("Are you sure you want to delete this room type?")) {
        sampleRooms = sampleRooms.filter(r => r.id !== roomId);
        renderAdminRoomTypes();
        renderRooms(sampleRooms);
    }
}

// Admin 後台（可以看到「所有人」的訂單）
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
                    <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
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

function updateBookingStatus(bookingId, newStatus) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
        b.status = newStatus;
        renderAdminBookings();
        renderRooms(sampleRooms);
    }
}

// 預設初始化載入
renderRooms(sampleRooms);