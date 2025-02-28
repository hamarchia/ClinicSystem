const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const authenticateToken = require('../middleware/authenticateToken');

// Add a new prescription (POST)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, medicineName, dosage, courseDuration, instructions } = req.body;
    
    if (!patientId || !medicineName || !dosage || !courseDuration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPrescription = new Prescription({ patientId, medicineName, dosage, courseDuration, instructions });
    const savedPrescription = await newPrescription.save();
    
    res.status(201).json(savedPrescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a prescription (PUT)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedPrescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(updatedPrescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a prescription (DELETE)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);
    
    if (!deletedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all prescriptions of a patient by patientId (GET)
router.get('/:patientId', authenticateToken, async (req, res) => {
    try {
        console.log("all prescriptions");
      const prescriptions = await Prescription.find({ patientId: req.params.patientId });
      
      if (prescriptions.length === 0) {
        return res.status(404).json({ message: 'No prescriptions found for this patient' });
      }
  
      res.json(prescriptions);
    } catch (err) {
      res.status(500).json({err});
    }
  });

//Get current prescriptions
router.get('/current/:patientId', async (req, res) => {
  try {
    const dateFilter = req.query.date ? new Date(req.query.date) : new Date();
    
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
      createdAt: {
        $gte: new Date(dateFilter.setHours(0, 0, 0, 0)),
        $lt: new Date(dateFilter.setHours(23, 59, 59, 999))
      }
    }).sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});  
  
module.exports = router;
