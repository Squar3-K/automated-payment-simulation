import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pchange.css';

const Pchange = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { NHIF_ID } = location.state || {};

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      if (NHIF_ID) {
        await axios.post('http://localhost:5000/api/update-password', {
          nhifId: NHIF_ID,
          newPassword,
        });

        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { state: { NHIF_ID } });
        }, 2000); // Redirect to Log page after 2 seconds
      } else {
        console.error('Invalid NHIF_ID:', NHIF_ID);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login wrap">
      <div className="h1">Change Password</div>

      {success ? (
        <div>Password changed successfully! Redirecting...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            placeholder="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
          />

          <input
            placeholder="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />

          <input value="Change Password" className="btn" type="submit" />

          {error && <p>Error: {error}</p>}
        </form>
      )}
    </div>
  );
};

export default Pchange;