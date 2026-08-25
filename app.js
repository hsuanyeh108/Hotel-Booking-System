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

// 輔助函式：檢查房間是否已被預訂
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

// (1) 渲染房間列表（含判斷是否可預訂及 Non-available 樣式）
function renderRooms(roomsToRender) {
    const list = document.getElementById('room-list');
    
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
                    <h3 style="font-size:16px; margin: 6px 0;">${room.name} (#${room.id})</h3>
                    <div class="price" style="margin-bottom:12px; font-weight:bold; color:#1E3A8A;">${room.price}</div>
                </div>
                <button ${btnAttr} onclick="selectRoom(${room.id})">${btnText}</button>
            </div>
        `;
    }).join('');
}

// (2) & (3) 搜尋與日期邏輯驗證防呆
function searchRooms() {
    const checkinInput = document.getElementById('checkin').value;
    const checkoutInput = document.getElementById('checkout').value;

    // (3) 日期防呆驗證跳窗
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
    }

    // (2) 渲染搜尋結果
    renderRooms(sampleRooms);

    // (2) 提供搜尋視覺回饋提示
    let notice = document.getElementById('search-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'search-notice';
        notice.style.cssText = "margin-top: 12px; padding: 8px 12px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: 500;";
        document.querySelector('.search-box').appendChild(notice);
    }
    
    if (checkinInput && checkoutInput) {
        notice.innerText = `Search applied for ${checkinInput} to ${checkoutInput}. Showing available statuses below.`;
    } else {
        notice.innerText = `Showing all room statuses below.`;
    }
}

function filterRooms() {
    const query = document.getElementById('global-search').value.toLowerCase();
    const filtered = sampleRooms.filter(r => r.name.toLowerCase().includes(query));
    renderRooms(filtered);
}

function selectRoom(roomId) {
    // 防呆：已預訂房間不可選擇
    if (isRoomBooked(roomId)) {
        alert("This room is already booked!");
        return;
    }

    currentSelectedRoom = sampleRooms.find(r => r.id === roomId);
    document.getElementById('selected-room-name').innerText = `${currentSelectedRoom.name} (#${currentSelectedRoom.id})`;
    document.getElementById('selected-room-price').innerText = currentSelectedRoom.price;

    const previewContainer = document.getElementById('selected-room-card-preview');
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

    showSection('booking-section');
}

// (1) 提交預訂並鎖定該房間 ID
function submitBooking(event) {
    event.preventDefault();

    if (isRoomBooked(currentSelectedRoom.id)) {
        alert("Sorry, this room was just booked by someone else!");
        showSection('search-section');
        return;
    }

    const newBooking = {
        id: 'BK-' + Date.now().toString().slice(-4),
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

    // 重設表單輸入值
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-email').value = '';
    document.getElementById('guest-phone').value = '';

    showBookingDetails(newBooking.id);
}

function showBookingDetails(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('success-details').innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e2e8f0; margin: 15px 0;">
            <p style="margin-bottom:8px;"><strong>Booking ID:</strong> ${b.id}</p>
            <p style="margin-bottom:8px;"><strong>Guest Name:</strong> ${b.guest}</p>
            <p style="margin-bottom:8px;"><strong>Room Type:</strong> ${b.room} (#${b.roomId})</p>
            <p style="margin-bottom:8px;"><strong>Total Price:</strong> ${b.price}</p>
            <p><strong>Status:</strong> <span class="${b.status === 'Confirmed' ? 'status-confirm' : 'status-cancelled'}">${b.status}</span></p>
        </div>
    `;
    showSection('success-section');
}

function renderGuestBookings() {
    const container = document.getElementById('guest-booking-cards');
    const visibleBookings = bookings.filter(b => b.status !== 'Cancelled by Guest');

    if (visibleBookings.length === 0) {
        container.innerHTML = '<p style="color:#64748b;">No active bookings found.</p>';
        return;
    }

    container.innerHTML = visibleBookings.map(b => `
        <div class="room-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: white;">
            <img src="${b.img}" style="width:100%; height:160px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
            <div>
                <span class="tag" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">Booking ID: ${b.id}</span>
                <h3 style="font-size:16px; margin: 6px 0;">${b.room} (#${b.roomId})</h3>
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

// 房客取消訂單，房間釋放回 Available
function cancelBookingByGuest(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const b = bookings.find(item => item.id === bookingId);
        if (b) {
            b.status = 'Cancelled by Guest';
            renderGuestBookings();
            renderRooms(sampleRooms); // 釋放房間，更新卡片狀態為 Available
        }
    }
}

function renderAdminRoomTypes() {
    const container = document.getElementById('admin-room-type-grid');
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
                    <h3 style="font-size:16px; margin: 4px 0;">${room.name} (#${room.id})</h3>
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

function renderAdminBookings() {
    const tbody = document.getElementById('admin-booking-list');
    const visibleBookings = bookings.filter(b => b.status !== 'Cancelled by Guest');

    if (visibleBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:15px; text-align:center; color:#64748b;">No active bookings found.</td></tr>';
        return;
    }
    tbody.innerHTML = visibleBookings.map(b => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding:12px;">${b.id}</td>
            <td style="padding:12px;">${b.guest}</td>
            <td style="padding:12px;">${b.room} (#${b.roomId})</td>
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

// Admin 取消訂單也會釋放房間
function updateBookingStatus(bookingId, newStatus) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
        b.status = newStatus;
        renderAdminBookings();
        renderRooms(sampleRooms);
    }
}

// 初始化
searchRooms();