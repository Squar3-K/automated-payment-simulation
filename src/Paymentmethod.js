import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Paymentmethod.css';
import axios from 'axios';

const Paymentmethod = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userAmount, setUserAmount] = useState(''); // Add this line
  const location = useLocation();
  const navigate = useNavigate();

  const { NHIF_ID } = location.state || {};

  const handlePhoneNumberSubmit = async () => {
    try {
      // Update the user's phone number in the database
      await axios.post('http://localhost:5000/api/update-phone-number', { nhifId: NHIF_ID, phoneNumber });
  
        // Generate a random balance and update the user's account balance
        const response = await axios.post('http://localhost:5000/api/generate-random-balance', { nhifId: NHIF_ID });
        const { balance } = response.data;  
        
      // Navigate back to the UserAccount component with the updated phone number
      navigate('/user-account', { state: { NHIF_ID, phoneNumber } });
    } catch (error) {
      console.error('Error updating phone number or account balance:', error);
      // Handle the error appropriately
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleAmountChange = (e) => { // Add this function
    setUserAmount(e.target.value);
  };

  return (
    <div className="phone-number-container">
      <label className="phone-number-label">Phone number</label>
      <div className="relative mt-2 max-w-xs text-gray-500">
        <div className="country-code-container">
        </div>
        <input
          type="number"
          placeholder="+1 (555) 000-000"
          className="phone-number-input"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
      </div>

      <button onClick={handlePhoneNumberSubmit}>Submit</button>
    </div>
  );
};

export default Paymentmethod;