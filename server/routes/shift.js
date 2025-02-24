const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const authenticateToken = require('../middleware/authenticateToken');

// Start a new shift (POST)
router.post('/start', authenticateToken, async (req, res) => {
    try {
        console.log("hitting start");
      const newShift = new Shift({
        startTime: new Date(),
        shiftDate: new Date()
      });
      console.log("before:"+newShift);
      const savedShift = await newShift.save();
      console.log("after:"+savedShift);
      res.status(201).json(savedShift);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // End a shift (PUT)
  router.put('/end/:shiftId', authenticateToken, async (req, res) => {
    try {
        console.log("hitting end");
      const updatedShift = await Shift.findByIdAndUpdate(
        req.params.shiftId,
        { endTime: new Date() },
        { new: true }
      );
      if (!updatedShift) {
        return res.status(404).json({ message: 'Shift not found' });
      }
      res.json(updatedShift);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
      console.log(err);
    }
  });
  
  // Add patient to a shift (PUT)
  router.put('/:shiftId/add-patient', authenticateToken, async (req, res) => {
    try {
      const { sequenceNo, patientId } = req.body;
      if (!sequenceNo || !patientId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Find the shift
      const shift = await Shift.findById(req.params.shiftId);
      if (!shift) {
        return res.status(404).json({ message: 'Shift not found' });
      }
  
      // Check if the patient is already in the queue
      const alreadyInQueue = shift.queue.some(
        (item) => item.patientId && item.patientId._id.toString() === patientId.toString()
      );
      
      if (alreadyInQueue) {
        return res.status(400).json({ message: 'Patient is already in the shift' });
      }
  
      // Add patient to the shift
      shift.queue.push({ sequenceNo, patientId });
      await shift.save();
  
      res.json(shift);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Get today's latest shift (GET)
router.get('/current', authenticateToken, async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const latestShift = await Shift.findOne({ shiftDate: { $gte: startOfDay } }).sort({ startTime: -1 });
      
      if (!latestShift) {
        return res.status(404).json({ message: 'No shift found for today' });
      }
      res.json(latestShift);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
