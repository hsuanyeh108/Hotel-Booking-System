/* put in express template, Node.js using for Web servers tools */
const express = require('express');
/* put in CORS, because frontend and backend using different port number, needs this to approve the frontend submission demands */
const cors = require('cors');
/* .env file can be upload to this coding */
const path = require('path');
/* path modal */
require('dotenv').config();
/* build an express servers to application using, name as app */
const app = express();
/* using .env file port number priority, if non then using the default setting 80 */
const PORT = process.env.PORT || 80;

/*Middleware setting */
app.use(cors()); /* permit the frontend can call the API */
app.use(express.json()); /* Transfer the JSON data send by frontend to JavaScript objects*/
app.use(express.static(path.join(__dirname, '../Frontend')));/* provide the static files*/


/* Modal Database before connecting to MongoDB, replacing by the Matrix */
/* Modal the room's data, including room types, price and status */
const rooms = [
  { id: 101, name: 'Standard Single Room', price: 'A$45/per night', description: 'Free Wi-Fi, Single Bed, Air Conditioning', img: 'img/Hotel Single Room.jpg' },
  { id: 102, name: 'Double Room', price: 'A$90/per night', description: 'Free Wi-Fi, Queen Bed, Breakfast included, City View', img: 'img/Double Room.jpg' },
  { id: 103, name: 'Excutive Room', price: 'A$120/per night', description: 'Free Wi-Fi, King Bed, Ocean View, Free Parking & Breakfast', img: 'img/Excutive Room.jpg' },
  { id: 104, name: 'Standard Single Room', price: 'A$45/per night', description: 'Free Wi-Fi, Single Bed, Garden View', img: 'img/Single Room2.jpg' },
  { id: 105, name: 'Double Room', price: 'A$90/per night', description: 'Free Wi-Fi, Double Bed, Work Desk', img: 'img/Double Room2.jpg' },
  { id: 106, name: 'Excutive Room', price: 'A$120/per night', description: 'Free Wi-Fi, King Bed, Balcony, VIP Lounge Access', img: 'img/Excutive Room2.jpg' }
];
/* build an empty space for guest's submit the booking in the future */
const bookings = [];


/* API Router compare to Sequence Diagram */
/*Frontend sent Search Rooms to Booking Service to execute Query Available Rooms (To searching for available rooms)*/
/*GET / api / rooms*/
app.get('/api/rooms', (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (checkIn && checkOut) {
    const reqStart = new Date(checkIn);
    const reqEnd = new Date(checkOut);

    const roomsWithAvailability = rooms.map(room => {
      const isOverlap = bookings.some(b => {
        if (b.roomId !== room.id) return false;
        const bStart = new Date(b.checkIn);
        const bEnd = new Date(b.checkOut);
        return reqStart < bEnd && reqEnd > bStart;
      });
      return { ...room, available: !isOverlap };
    });

    return res.json({ success: true, data: roomsWithAvailability });
  }

  res.json({ success: true, data: rooms.map(r => ({ ...r, available: true })) });
});


/* Frontend sent Submit Booking details to Booking Server to execute Validate or Insert Booking, and return Booking saved or Booking Confirmed*/
/*POST /api/bookings */
app.post('/api/bookings', (req, res) => {
  const { guestName, roomId, checkIn, checkOut } = req.body;/* Frontend sent the content of guestname, roomID, checkin and checkout dates */
 /* Simple validate to the data authorization, if something missing will sent HTTP 400 error message*/
  if (!guestName || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Please fill in the completed booking information!' });
  }

  const reqStart = new Date(checkIn);
  const reqEnd = new Date(checkOut);

  const hasConflict = bookings.some(b => {
    if (b.roomId !== Number(roomId)) return false;
    const bStart = new Date(b.checkIn);
    const bEnd = new Date(b.checkOut);
    return reqStart < bEnd && reqEnd > bStart;
  });

  if (hasConflict) {
    return res.status(400).json({ success: false, message: 'This room is already booked for the selected dates!' });
  }

  /* Modal Insert Booking write into database */
  const newBooking = {
    id: bookings.length + 1,
    guestName,
    roomId,
    checkIn,
    checkOut,
    createdAt: new Date()
  };
  bookings.push(newBooking);
  /* Booking Confirmed stage, return HTTP 201 and the message and information when booking successful */
  res.status(201).json({
    success: true,
    message: 'Booking Confirmed',
    booking: newBooking
  });
});
/* Server started in the port and listen to the demand, if successfully start will print the words in the terminal */
app.listen(PORT, () => {
  console.log(`Booking Service are operating on Port ${PORT}...`);
});
/* export app for the using of Mocha/Chai testing*/
module.exports = app;
