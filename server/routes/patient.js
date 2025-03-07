const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authenticateToken = require('../middleware/authenticateToken');

// Add New Patient (POST)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, dob, address } = req.body;
    
    if (!firstName || !lastName || !phone || !dob || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPatient = new Patient({ firstName, lastName, phone, dob, address });
    const savedPatient = await newPatient.save();
    
    res.status(201).json(savedPatient);
  } catch (err) {
    if (err.code === 11000) { // Duplicate phone error
      res.status(400).json({ message: 'Phone number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Get All Patients (GET)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Patient (PUT)
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    console.log("hitting update");
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return updated document
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Patient (DELETE)
router.delete('/delete/:patientId', authenticateToken, async (req, res) => {
  try {
    console.log("hitting delete");

    // Find the patient first
    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Call remove() to trigger the pre('remove') middleware
    await patient.deleteOne();
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
});


// Search Patients by First Name, Last Name, or Both (GET)
router.get('/search', authenticateToken, async (req, res) => {
    console.log("HIT: seach api");
    try {
      const { firstName, lastName } = req.query;
      //console.log(firstName)
      if (!firstName && !lastName) {
        return res.status(400).json({ message: 'Provide at least one search parameter (firstName or lastName)' });
      }
      
      let searchQuery = {};
      
      if (firstName && lastName) {
        searchQuery = { $and: [
          { firstName: { $regex: new RegExp(firstName, 'i') } },
          { lastName: { $regex: new RegExp(lastName, 'i') } }
        ] };
      } else if (firstName) {
        searchQuery = { firstName: { $regex: new RegExp(firstName, 'i') } };
      } else if (lastName) {
        searchQuery = { lastName: { $regex: new RegExp(lastName, 'i') } };
      }
      
      const patients = await Patient.find(searchQuery);
      res.json(patients);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  //GET address search
  router.get('/search/address', authenticateToken, async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ message: 'Provide an address to search' });
      }
      
      const searchQuery = { address: { $regex: new RegExp(address, 'i') } };
      const patients = await Patient.find(searchQuery);
      res.json(patients);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;