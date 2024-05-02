import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nhifId, setNhifId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Generate a random 8-digit NHIF_ID
      const randomNhifId = Math.floor(10000000 + Math.random() * 90000000);

      // Check if the generated NHIF_ID already exists in the database
      const response = await axios.get(`http://localhost:5000/api/check-nhif-id?nhifId=${randomNhifId}`);

      if (response.data.exists) {
        // If the NHIF_ID already exists, generate a new one
        setError('An error occurred while generating NHIF_ID. Please try again.');
        return;
      }

      // If the NHIF_ID is unique, register the new user
      await axios.post('http://localhost:5000/api/register', {
        firstName,
        lastName,
        email,
        password,
        nhifId: randomNhifId,
      });

      setNhifId(randomNhifId);
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="title">Register</p>
      <p className="message">Signup now and get full access to our app.</p>
      <div className="flex">
        <label>
          <input
            className="input"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <span>Firstname</span>
        </label>

        <label>
          <input
            className="input"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <span>Lastname</span>
        </label>
      </div>

      <label>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <span>Email</span>
      </label>

      <label>
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span>Password</span>
      </label>
      <label>
        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <span>Confirm password</span>
      </label>
      {nhifId && <p>Your NHIF_ID: {nhifId}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button className="submit" type="submit">
        Submit
      </button>
      <p className="signin">
        Already have an account? <a href="#">Signin</a>
      </p>
    </form>
  );
};

export default Register;