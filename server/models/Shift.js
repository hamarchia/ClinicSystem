const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  shiftDate: {
    type: Date,
    required: true
  },
  queue: [{
    sequenceNo: {
      type: Number,
      required: true
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    }
  }]
});

// Index for quick retrieval of shifts by date
shiftSchema.index({ shiftDate: 1 });

module.exports = mongoose.model('Shift', shiftSchema);