// CompounderDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/compounderDashboard.css';

const CompounderDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Create an axios instance with base URL and headers
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // States for search, patient list and modals
  const [searchType, setSearchType] = useState('name'); // "name" or "address"
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatientData, setEditPatientData] = useState(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollFormData, setEnrollFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    address: '',
  });

  // State for shift management
  const [shift, setShift] = useState(null);

  // Fetch the current (latest) shift on component mount
  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      console.log("trying to fetch the current shift");
      const res = await axiosInstance.get('/api/shifts/current');
      console.log(res.data);
      setShift(res.data);
    } catch (error) {
      console.error('Error fetching current shift:', error);
      setShift(null);
    }
  };

  // --- Search functionality ---
  const handleSearch = async () => {
    console.log("trying to search");
    if (!searchQuery.trim()) return;

    let url = '';
    if (searchType === 'name') {
      console.log("name search");
      // Split search query by space.
      const parts = searchQuery.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || '';
      url = `/api/patients/search?firstName=${encodeURIComponent(
        firstName
      )}&lastName=${encodeURIComponent(lastName)}`;
      console.log(url);
    } else {
      console.log("address search");
      url = `/api/patients/search/address?address=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
    try {
      const res = await axiosInstance.get(url);
      setPatients(res.data);
      console.log(res.data);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // --- Patient Detail Modal Handlers ---
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setEditPatientData(patient); // Pre-fill the edit form
  };

  const handleEditChange = (e) => {
    setEditPatientData({
      ...editPatientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePatient = async () => {
    try {
      const res = await axiosInstance.put(
        `/api/patients/update/${editPatientData._id}`,
        editPatientData
      );
      const updatedPatient = res.data;
      setPatients(
        patients.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
      );
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleDeletePatient = async () => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await axiosInstance.delete(`/api/patients/delete/${selectedPatient._id}`);
      setPatients(patients.filter((p) => p._id !== selectedPatient._id));
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  // --- Enroll New Patient Handlers ---
  const handleEnrollPatient = async (e) => {
    console.log("Enrolling a new patient");
    e.preventDefault();
    const { firstName, lastName, phone, dob, address } = enrollFormData;
    if (!firstName || !lastName || !phone || !dob || !address) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const res = await axiosInstance.post('/api/patients', enrollFormData);
      const newPatient = res.data;
      setPatients([...patients, newPatient]);
      setShowEnrollForm(false);
      setEnrollFormData({
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        address: '',
      });
    } catch (error) {
      console.error('Error enrolling patient:', error);
      alert(error.response.data.message || 'Failed to enroll patient.');
    }
  };

  // --- Shift Handlers ---
  const handleStartShift = async () => {
    try {
      const res = await axiosInstance.post('/api/shifts/start');
      setShift(res.data);
    } catch (error) {
      console.error('Error starting shift:', error);
    }
  };

  const handleEndShift = async () => {
    if (!shift) return;
    try {
      const res = await axiosInstance.put(`/api/shifts/end/${shift._id}`);
      setShift(res.data);
    } catch (error) {
      console.error('Error ending shift:', error);
    }
  };

  // Add a patient to the current shift
  const handleAddToShift = async (patient) => {
    if (!shift || shift.endTime) {
      alert('No active shift. Please start a shift first.');
      return;
    }
    // Determine the sequence number as (current queue length + 1)
    const sequenceNo = shift.queue ? shift.queue.length + 1 : 1;
    try {
      const res = await axiosInstance.put(
        `/api/shifts/${shift._id}/add-patient`,
        { sequenceNo, patientId: patient._id }
      );
      setShift(res.data);
    } catch (error) {
      console.error('Error adding patient to shift:', error);
    }
  };

  // --- Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="compounder-dashboard">
      <header className="header">
        <div className="top-bar">
          <div className="search-bar">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="name">Search by Name</option>
              <option value="address">Search by Address</option>
            </select>
            <input
              type="text"
              placeholder={
                searchType === 'name'
                  ? 'Enter first name and/or last name'
                  : 'Enter address'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={() => setShowEnrollForm(true)}>
              Enroll New Patient
            </button>
          </div>
          <div className="shift-button">
            {shift && !shift.endTime ? (
              <button onClick={handleEndShift}>End Shift</button>
            ) : (
              <button onClick={handleStartShift}>Start Shift</button>
            )}
          </div>
        </div>
        <div className="user-info">
          <h2>Compounder Dashboard</h2>
          <p>
            Welcome, {user.role} (User ID: {user.userId})
          </p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* LEFT: Patient List Section */}
        <div className="patient-search-section">
          <div className="patient-list">
            {patients.length === 0 ? (
              <p>No patients found.</p>
            ) : (
              patients.map((patient) => (
                <div key={patient._id} className="patient-item">
                  <div
                    className="patient-summary"
                    onClick={() => handlePatientClick(patient)}
                  >
                    {patient.firstName} {patient.lastName} – {patient.phone}
                  </div>
                  <button onClick={() => handleAddToShift(patient)}>
                    Add to Shift
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Shift Column */}
        <div className="shift-column">
          <div className="shift-details">
            {shift ? (
              <div>
                <p>
                  <strong>Shift Start:</strong>{' '}
                  {new Date(shift.startTime).toLocaleString()}
                </p>
                {shift.endTime && (
                  <p>
                    <strong>Shift End:</strong>{' '}
                    {new Date(shift.endTime).toLocaleString()}
                  </p>
                )}
                <h3>Patients in Shift</h3>
                {shift.queue && shift.queue.length > 0 ? (
                  <ul>
                    {shift.queue.map((item, index) => (
                      <li key={index}>
                        {item.sequenceNo}. Patient ID: {item.patientId}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No patients added to shift.</p>
                )}
              </div>
            ) : (
              <p>No active shift.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Patient Details (with Edit/Delete) */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Patient Details</h3>
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={editPatientData.firstName}
              onChange={handleEditChange}
            />
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={editPatientData.lastName}
              onChange={handleEditChange}
            />
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={editPatientData.phone}
              onChange={handleEditChange}
            />
            <label>Date of Birth:</label>
            <input
              type="date"
              name="dob"
              value={new Date(editPatientData.dob)
                .toISOString()
                .split('T')[0]}
              onChange={handleEditChange}
            />
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={editPatientData.address}
              onChange={handleEditChange}
            />
            <div className="modal-buttons">
              <button onClick={handleUpdatePatient}>Save</button>
              <button onClick={handleDeletePatient}>Delete</button>
              <button onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Enrolling a New Patient */}
      {showEnrollForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Enroll New Patient</h3>
            <form onSubmit={handleEnrollPatient}>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={enrollFormData.firstName}
                onChange={(e) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    firstName: e.target.value,
                  })
                }
              />
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={enrollFormData.lastName}
                onChange={(e) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    lastName: e.target.value,
                  })
                }
              />
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={enrollFormData.phone}
                onChange={(e) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    phone: e.target.value,
                  })
                }
              />
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={enrollFormData.dob}
                onChange={(e) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    dob: e.target.value,
                  })
                }
              />
              <label>Address:</label>
              <input
                type="text"
                name="address"
                value={enrollFormData.address}
                onChange={(e) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    address: e.target.value,
                  })
                }
              />
              <div className="modal-buttons">
                <button type="submit">Enroll Patient</button>
                <button type="button" onClick={() => setShowEnrollForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompounderDashboard;
