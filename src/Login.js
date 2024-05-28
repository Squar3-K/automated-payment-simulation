import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './Loader'; // Import the Loader component

const Login = () => {
  const [NHIF_ID, setNHIF_ID] = useState('');
  const [pass, setpass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const navigate = useNavigate();

  async function handleFormSubmit(e) {
    e.preventDefault();
    setIsLoading(true); // Set isLoading to true before making the request

    try {
      const response = await axios.post('http://localhost:5000/db', { NHIF_ID, pass });
      console.log(response);

      if (response.data.loggedInUserId) {
        // Store NHIF_ID and pass in local storage
        localStorage.setItem('NHIF_ID', NHIF_ID);
        localStorage.setItem('pass', pass);

        // Pass the NHIF_ID and pass values to the Log component
        navigate('/Log', { state: { NHIF_ID, pass } });
      } else {
        setError('Login failed');
      }
    } catch (err) {
      console.log(err);
      setError('An error occurred');
    } finally {
      setIsLoading(false); // Set isLoading to false after the request is completed
    }
  }

  useEffect(() => {

    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed
  }, []);

  return (
    <div className="form-container">
      {isLoading ? ( 
        <Loader />
      ) : (
      <form className="form" onSubmit={handleFormSubmit}>
        <div className="flex-column">
          <label>ID no</label>
          <div className="inputForm">
            <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
            </svg>
            <input
              type="digits"
              className="input-nhif"
              placeholder="Enter your ID number"
              value={NHIF_ID}
              onChange={(e) => setNHIF_ID(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className="inputForm">
            <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
            </svg>
            <input
              type="password"
              className="input-pass"
              placeholder="Enter your Password"
              value={pass}
              onChange={(e) => setpass(e.target.value)}
            />
          </div>
        </div>

        <button className="button-submit" type='submit'> Sign In</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p className="p">
          Don't have an account?{' '}
          <span className="span">
            <a href="#" onClick={() => navigate('/register')}>
              Sign Up
            </a>
          </span>
        </p>
      </form>
      )}
    </div>
  );
};

export default Login;