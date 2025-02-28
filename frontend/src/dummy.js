import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

const DoctorDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [currentShift, setCurrentShift] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicineName: '',
    dosage: '',
    courseDuration: '',
    instructions: ''
  });

  // Fetch current shift on mount
  useEffect(() => {
    const fetchCurrentShift = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/shifts/current', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentShift(res.data);
      } catch (error) {
        console.error('Error fetching current shift:', error);
      }
    };

    fetchCurrentShift();
  }, []);

  // When a patient is double-clicked in the shift queue, fetch their prescriptions
  const handlePatientDoubleClick = async (patient) => {
    setSelectedPatient(patient);
    try {
      const token = localStorage.getItem('token');
      // GET endpoint: /api/prescriptions/:patientId
      const res = await axios.get(`http://localhost:5000/api/prescriptions/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data);
      setShowAddForm(false); // Hide the add form if it was open previously
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  // Handle changes to the add prescription form inputs
  const handleInputChange = (e) => {
    setNewPrescription({
      ...newPrescription,
      [e.target.name]: e.target.value
    });
  };

  // Submit a new prescription for the selected patient
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const token = localStorage.getItem('token');
      const prescriptionData = {
        patientId: selectedPatient._id,
        ...newPrescription
      };
      // POST endpoint: /api/prescriptions
      const res = await axios.post('http://localhost:5000/api/prescriptions', prescriptionData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      // Append the newly created prescription to the state
      setPrescriptions([...prescriptions, res.data]);
      // Clear the form and hide it
      setNewPrescription({ medicineName: '', dosage: '', courseDuration: '', instructions: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  // Delete a prescription by its ID
  const handleDeletePrescription = async (prescriptionId) => {
    try {
      const token = localStorage.getItem('token');
      // DELETE endpoint: /api/prescriptions/:id
      await axios.delete(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the deleted prescription from the state
      setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Column: Selected Patient's Prescriptions and Add Prescription Form */}
      <div className="dashboard-left">
        <h2>
          Prescriptions for {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '...'}
        </h2>
        {selectedPatient ? (
          <div>
            {prescriptions.length > 0 ? (
              <ul className="prescriptions-list">
                {prescriptions.map((prescription) => (
                  <li key={prescription._id} className="prescription-item">
                    <div>
                      <strong>{prescription.medicineName}</strong> - {prescription.dosage} for {prescription.courseDuration}
                      {prescription.instructions && <p>Instructions: {prescription.instructions}</p>}
                    </div>
                    <button onClick={() => handleDeletePrescription(prescription._id)}>Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No prescriptions found for this patient.</p>
            )}
            <button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Prescription'}
            </button>
            {showAddForm && (
              <form onSubmit={handleAddPrescription} className="prescription-form">
                <input
                  type="text"
                  name="medicineName"
                  placeholder="Medicine Name"
                  value={newPrescription.medicineName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="dosage"
                  placeholder="Dosage"
                  value={newPrescription.dosage}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="courseDuration"
                  placeholder="Course Duration"
                  value={newPrescription.courseDuration}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="instructions"
                  placeholder="Instructions (optional)"
                  value={newPrescription.instructions}
                  onChange={handleInputChange}
                />
                <button type="submit">Submit Prescription</button>
              </form>
            )}
          </div>
        ) : (
          <p>Double-click a patient in the queue to view and manage prescriptions.</p>
        )}
      </div>

      {/* Right Column: Current Shift and Patients Queue */}
      <div className="dashboard-right">
        {currentShift ? (
          <div>
            <h2>Current Shift</h2>
            <p>
              <strong>Date:</strong> {new Date(currentShift.shiftDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Start Time:</strong> {new Date(currentShift.startTime).toLocaleTimeString()}
            </p>
            {currentShift.endTime && (
              <p>
                <strong>End Time:</strong> {new Date(currentShift.endTime).toLocaleTimeString()}
              </p>
            )}
            <h3>Patients Queue</h3>
            <ul className="patients-list">
              {currentShift.queue.map((item) => (
                <li
                  key={item._id}
                  onDoubleClick={() => handlePatientDoubleClick(item.patientId)}
                  className="patient-item"
                >
                  {item.sequenceNo}. {item.patientId.firstName} {item.patientId.lastName}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Loading current shift...</p>
        )}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default DoctorDashboard;
