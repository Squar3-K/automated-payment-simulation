import React, { useState, useEffect } from 'react';
import './Register.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nhifId, setNhifId] = useState('');
  const [error, setError] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const nameRegex = /^[a-zA-Z]+$/; // Accepts only alphabetic characters
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation pattern
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])[\w!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]{5,}$/; // Requires at least one digit, one lowercase letter, one uppercase letter, one special character, and a minimum length of 8 characters

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      setError('First and last names should contain only letters');
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('Password should be at least 8 characters long and contain at least one digit, one lowercase letter, one uppercase letter, and one special character');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Check if the email already exists in the database (assuming you have an API endpoint)
      const emailResponse = await axios.get(`http://localhost:5000/api/check-email?email=${email}`);

      if (emailResponse.data.exists) {
        setError('Email already exists');
        return;
      }

      // If all validations pass, proceed with registration
      // Generate a random 8-digit NHIF_ID
      const randomNhifId = Math.floor(10000000 + Math.random() * 90000000);

      // Check if the generated NHIF_ID already exists in the database (assuming you have an API endpoint)
      const nhifIdResponse = await axios.get(`http://localhost:5000/api/check-nhif-id?nhifId=${randomNhifId}`);

      if (nhifIdResponse.data.exists) {
        // If the NHIF_ID already exists, generate a new one
        setError('An error occurred while generating NHIF_ID. Please try again.');
        return;
      }

      // If the email is unique and the NHIF_ID is unique, register the new user
      await axios.post('http://localhost:5000/api/register', {
        firstName,
        lastName,
        email,
        password,
        nhifId: randomNhifId,
        initialBalance,
      });

      setNhifId(randomNhifId);
      setRegistrationSuccess(true);
      setError('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
    setIsLoading(false)
  };

  useEffect(() => {
    // This will simulate a delay to show the Loader component
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed
  }, []);

  const handleRedirect = () => {
    navigate('/Log', { state: { NHIF_ID: nhifId } });
  };

  return (
    <div className="Rfor">

      {isLoading ? ( // Render the Loader component while loading
        <Loader />
      ) : !registrationSuccess ? (

        <form onSubmit={handleSubmit}>
          <p className="Rtitl">Register</p>
          <p className="Rmessag">Signup now and get full access to our app.</p>
          <div className='cont'>
          <div className="Rfle">
            <>
            <label>
              <input
                className="Rinpu"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <span>First Name</span>
            </label>
                </>
                <>
            <label>
              <input
                className="Rinpu"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <span>Last Name</span>
            </label>
            </>
          </div>
            <>
          <label>
            <input
              className="Rinpu"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span>Email</span>
          </label>
              </>
              <>
          <label>
            <input
              className="Rinpu"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span>Password</span>
          </label>
          </>
          <>
          <label>
            <input
              className="Rinpu"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span>Confirm Password</span>
          </label>
          </>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button className="Rsubmi" type="submit">
            Submit
          </button>
          <p className="Rsigni">
            Already have an account? <a href="#">Signin</a>
          </p>
        </form>
      ) : (
        <div>
          <p>Registration successful!</p>
          <p>New NHIF_ID: {nhifId}</p>
          <button onClick={handleRedirect}>Go to Log</button>
        </div>
      )}
    </div>
  );
};

export default Register;