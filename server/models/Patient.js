const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to delete associated prescriptions
patientSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const Prescription = mongoose.model('Prescription');
    
    // Delete all prescriptions where patientId matches this patient's _id
    await Prescription.deleteMany({ patientId: this._id });
    console.log("deleting patient's prescriptions");
    
    next();
  } catch (err) {
    next(err);
  }
});


// Index for faster search on patient name
patientSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Patient', patientSchema);