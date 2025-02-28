import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PrescriptionHistory = () => {
  const { patientId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        // GET endpoint: /api/prescriptions/:patientId
        const res = await axios.get(`http://localhost:5000/api/prescriptions/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter prescriptions for the current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const filtered = res.data.filter(prescription => {
          const createdAt = new Date(prescription.createdAt);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        });
        setPrescriptions(filtered);
      } catch (error) {
        console.error('Error fetching prescription history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  if (loading) {
    return <p>Loading prescription history...</p>;
  }

  return (
    <div className="prescription-history">
      <h2>Prescription History for Patient {patientId}</h2>
      {prescriptions.length > 0 ? (
        <ul>
          {prescriptions.map(prescription => (
            <li key={prescription._id}>
              <strong>{prescription.medicineName}</strong> - {prescription.dosage} for {prescription.courseDuration}
              {prescription.instructions && <p>Instructions: {prescription.instructions}</p>}
              <p>Date: {new Date(prescription.createdAt).toLocaleDateString()} {new Date(prescription.createdAt).toLocaleTimeString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No prescriptions found for the current month.</p>
      )}
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default PrescriptionHistory;
