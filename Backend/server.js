/* put in express template, Node.js using for Web servers tools */
const express = require('express');
/* put in CORS, because frontend and backend using different port number, needs this to approve the frontend submission demands */
const cors = require('cors');
/* .env file can be upload to this coding */
const path = require('path');
/* path modal */
require('dotenv').config();
const mongoose = require('mongoose');
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

const roomSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  img: {
    type: String,
    default: 'img/Hotel Single Room.jpg'
  }
});

const Room = mongoose.model('Room', roomSchema);

async function initializeRooms() {
  try {
    const roomCount = await Room.countDocuments();

    if (roomCount === 0) {
      await Room.insertMany(rooms);
      console.log('Default rooms inserted into MongoDB');
    } else {
      console.log(`Rooms already exist: ${roomCount}`);
    }
  } catch (error) {
    console.error('Failed to initialize rooms:', error.message);
  }
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await initializeRooms();
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });

/* Booking Schema */
const bookingSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  guest: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  room: {
    type: String
  },
  price: {
    type: String
  },
  img: {
    type: String
  },
  roomId: {
    type: Number,
    required: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Cancelled by Admin',
      'Cancelled by Guest'
    ],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

/* build an empty space for guest's submit the booking in the future */
const bookings = [];


/* API Router compare to Sequence Diagram */
/*Frontend sent Search Rooms to Booking Service to execute Query Available Rooms (To searching for available rooms)*/
/*GET / api / rooms*/
app.get('/api/rooms', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    const rooms = await Room.find().sort({ id: 1 });

    if (checkIn && checkOut) {
      const reqStart = new Date(checkIn);
      const reqEnd = new Date(checkOut);

      const bookings = await Booking.find({
        status: { $in: ['Pending', 'Confirmed'] }
      });

      const roomsWithAvailability = rooms.map(room => {
        const isOverlap = bookings.some(b => {
          if (b.roomId !== room.id) return false;

          const bStart = new Date(b.checkIn);
          const bEnd = new Date(b.checkOut);

          return reqStart < bEnd && reqEnd > bStart;
        });

        return {
          id: room.id,
          name: room.name,
          price: room.price,
          description: room.description,
          img: room.img,
          available: !isOverlap
        };
      });

      return res.json({
        success: true,
        data: roomsWithAvailability
      });
    }

    res.json({
      success: true,
      data: rooms.map(room => ({
        id: room.id,
        name: room.name,
        price: room.price,
        description: room.description,
        img: room.img,
        available: true
      }))
    });

  } catch (error) {
    console.error('GET /api/rooms error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load rooms'
    });
  }
});


/* Frontend sent Submit Booking details to Booking Server to execute Validate or Insert Booking, and return Booking saved or Booking Confirmed*/
/*POST /api/bookings */
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      guestName,
      roomId,
      checkIn,
      checkOut,
      phone,
      email
    } = req.body;

    if (!guestName || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in the completed booking information!'
      });
    }

    const reqStart = new Date(checkIn);
    const reqEnd = new Date(checkOut);

    const hasConflict = await Booking.findOne({
      roomId: Number(roomId),
      status: { $in: ['Pending', 'Confirmed'] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This room is already booked for the selected dates!'
      });
    }

    const room = await Room.findOne({
      id: Number(roomId)
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const lastBooking = await Booking.findOne()
      .sort({ id: -1 });

    const newId = lastBooking
      ? lastBooking.id + 1
      : 1;

    const newBooking = await Booking.create({
      id: newId,
      guest: guestName,
      phone,
      email,
      room: room.name,
      price: room.price,
      img: room.img,
      roomId: Number(roomId),
      checkIn,
      checkOut,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking Confirmed',
      booking: newBooking
    });

  } catch (error) {
    console.error('POST /api/bookings error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

/*Admin APIs*/
/* GET /api/bookings - Admin view all orders*/
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ id: 1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('GET /api/bookings error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load bookings'
    });
  }
});

/* PATCH /api/bookings/:id/status - Admin confirm or cancel orders */
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Cancelled by Admin',
      'Cancelled by Guest'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findOne({
      id: bookingId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });

  } catch (error) {
    console.error('PATCH booking status error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

/* POST /api/rooms - Admin add room types */
app.post('/api/rooms', async (req, res) => {
  try {
    const { name, price, description, img } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Room name and price are required'
      });
    }

    const lastRoom = await Room.findOne()
      .sort({ id: -1 });

    const newId = lastRoom
      ? lastRoom.id + 1
      : 101;

    const newRoom = await Room.create({
      id: newId,
      name,
      price,
      description: description || '',
      img: img || 'img/Hotel Single Room.jpg'
    });

    res.status(201).json({
      success: true,
      message: 'Room type added',
      room: newRoom
    });

  } catch (error) {
    console.error('POST /api/rooms error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to add room'
    });
  }
});

/* PUT /api/rooms/:id - Admin update room types */
app.put('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = Number(req.params.id);

    const { name, price, description, img } = req.body;

    const room = await Room.findOne({
      id: roomId
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    if (name) room.name = name;
    if (price) room.price = price;
    if (description !== undefined) {
      room.description = description;
    }
    if (img) room.img = img;

    await room.save();

    res.json({
      success: true,
      message: 'Room type updated',
      room
    });

  } catch (error) {
    console.error('PUT /api/rooms error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
});

/* DELETE /api/rooms/:id - Admin delete room types */
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = Number(req.params.id);

    const hasActiveBooking = await Booking.findOne({
      roomId,
      status: {
        $in: ['Pending', 'Confirmed']
      }
    });

    if (hasActiveBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a room type with active bookings'
      });
    }

    const deletedRoom = await Room.findOneAndDelete({
      id: roomId
    });

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Room type deleted'
    });

  } catch (error) {
    console.error('DELETE /api/rooms error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete room'
    });
  }
});

/* Server started in the port and listen to the demand, if successfully start will print the words in the terminal */
app.listen(PORT, () => {
  console.log(`Booking Service are operating on Port ${PORT}...`);
});
/* export app for the using of Mocha/Chai testing*/
module.exports = app;
