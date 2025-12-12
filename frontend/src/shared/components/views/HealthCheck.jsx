import React, { useState, useEffect } from 'react';
import { healthCheck, getCareers } from '@/shared/services/api';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Test health endpoint
        const healthResponse = await healthCheck();
        setHealthStatus(healthResponse.data);

        // Test careers endpoint
        const careersResponse = await getCareers();
        setCareers(careersResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setHealthStatus('Error');
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="health-check">
      <h2>Backend Health Status: {healthStatus}</h2>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <h3>Sample Careers from Database:</h3>
      <ul className="careers-list">
        {careers.map(career => (
          <li key={career.id} className="career-item">
            <strong>{career.name}</strong> - {career.description}
            <br />
            Job Outlook: {career.jobOutlook}
            <br />
            Required Skills: {career.requiredSkills?.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthCheck;
