/* put in express template, Node.js using for Web servers tools */
const express = require('express');
/* put in CORS, because frontend and backend using different port number, needs this to approve the frontend submission demands */
const cors = require('cors');
/* .env file can be upload to this coding */
require('dotenv').config();
/* build an express servers to application using, name as app */
const app = express();
/* using .env file port number priority, if non then using the default setting 5000 */
const PORT = process.env.PORT || 5000;
/*Middleware setting */
app.use(cors()); /* permit the frontend can call the API */
app.use(express.json()); /* Transfer the JSON data send by frontend to JavaScript objects*/
/* Modal Database before connecting to MongoDB, replacing by the Matrix */
/* Modal the room's data, including room types, price and status */
const rooms = [
  { id: 1, name: 'Single Room', price: 100, available: true },
  { id: 2, name: 'Double Room', price: 150, available: true },
  { id: 3, name: 'Executive Room', price: 250, available: true }
];
/* build an empty space for guest's submit the booking in the future */
const bookings = [];
/* API Router compare to Sequence Diagram */
/*Frontend sent Search Rooms to Booking Service to execute Query Available Rooms (To searching for available rooms)*/
/*GET / api / rooms*/
app.get('/api/rooms', (req, res) => {
  /*Backend searching Database and Return Room List*/
  const availableRooms = rooms.filter(room => room.available);
  res.json({ success: true, data: availableRooms });
});
/* Frontend sent Submit Booking details to Booking Server to execute Validate or Insert Booking, and return Booking saved or Booking Confirmed*/
/*POST /api/bookings */
app.post('/api/bookings', (req, res) => {
  const { guestName, roomId, checkIn, checkOut } = req.body;/* Frontend sent the content of guestname, roomID, checkin and checkout dates */
 /* Simple validate to the data authorization, if something missing will sent HTTP 400 error message*/
  if (!guestName || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Please fill in the completed booking information!' });
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
