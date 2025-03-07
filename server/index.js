const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Add this
const { Server } = require('socket.io'); // Add this


const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const prescriptionRoutes = require('./routes/prescription');
const shiftRoutes = require('./routes/shift');

require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(express.json());
app.use(cors());

// Add Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React frontend URL
    methods: ["GET", "POST"]
  }
});

let donePatients = [];

io.on('connection', (socket) => {
  console.log('🌐 New client connected:', socket.id);

  // Send current state to new connections
  socket.emit('done-patients-update', donePatients);

  // Handle updates from doctors
  socket.on('update-done-patients', (newDonePatients) => {
    console.log('🔄 Received update from doctor:', newDonePatients);
    donePatients = newDonePatients;
    // Broadcast to all connected clients
    donePatients = [];
    io.emit('done-patients-update', donePatients);
    console.log('📢 Broadcasted update to all clients');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    console.log("trying to clear");
    donePatients = []; // Hardcode clear
    io.emit('done-patients-update', donePatients);
  });
});

// Database connection to local db
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error(err));

// Database connection using MongoDB Atlas connection string from .env file
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
};

mongoose.connect(process.env.MONGODB_URI, clientOptions)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas: ', err));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/shifts', shiftRoutes)

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));