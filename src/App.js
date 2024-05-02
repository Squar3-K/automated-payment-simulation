import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Register from './Register';

function App() {
  const [NHIF_ID, setNHIF_ID] = useState('');
  const [pass, setpass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleFormSubmit(e) {
    e.preventDefault();

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
    }
  }
  return (
    <body>
    <div className="App">
        <a>NATIONAL HEALTH INSURANCE FUND</a>
        {" "} {/*space*/}
        <h6>(NHIF)</h6>
    </div>
    <section className="about-section">
      <div className="about-container">
      <div className="card">
          <h2 className="about-heading">About Us</h2>
          <p className="about-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla aliquet magna ut orci ultricies, nec dictum purus convallis. Fusce sit amet eros at purus feugiat facilisis. Nam eu urna tristique, lobortis arcu nec, euismod elit. Quisque eget velit ligula. Nullam consectetur, magna sit amet lacinia suscipit, magna felis accumsan dui, a sagittis lorem ligula et odio. Proin quis consectetur dui. Ut sagittis, est nec vestibulum fermentum, nisi urna ullamcorper ex, et ultrices odio risus nec dui. Aenean non metus sit amet quam convallis consectetur. Nunc nec orci nec nulla faucibus finibus. Nulla ut sapien in ligula pharetra egestas. Sed quis massa non libero posuere aliquet.
          </p>
          <p className="about-description">
            Phasellus luctus, mi quis fringilla eleifend, dolor mi faucibus sem, eu tincidunt nulla purus a nisi. Sed auctor magna ut justo rhoncus, et dapibus magna suscipit. Nulla vestibulum luctus nisi, id dignissim elit commodo nec. Vestibulum at justo tellus. Aliquam sed enim sed nisi fermentum accumsan ut eget libero. Donec non semper justo. Aliquam erat volutpat. Nullam sodales ultricies nulla, nec efficitur magna mollis et.
          </p>
        </div>
      </div>
    </section>
    
<div className="form-container">
        <form className="form" onSubmit={handleFormSubmit}>
          <div className="flex-column">
            <label>NHIF no</label>
            <div className="inputForm">
              <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
              </svg>
              <input type="digits" className="input-nhif" placeholder="Enter your NHIF number" value={NHIF_ID} onChange={(e) => setNHIF_ID(e.target.value)} />
            </div>
          </div>

          <div className="flex-column">
            <label>Password</label>
            <div className="inputForm">
              <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
              </svg>
              <input type="password" className="input-pass" placeholder="Enter your Password" value={pass} onChange={(e) => setpass(e.target.value)} />
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
      </div>
  </body>
  );
}

export default App;