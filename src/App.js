import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Register from './Register';
import Login from './Login';
import Loader from './Loader';
import aboutImage from './images.jpeg';


function App() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed
  }, []);

  return (
    <body>
       {isLoading ? (
        <Loader />
      ) : (
        <div>
      <div className="App">
        <div className='App-header'>
        <a>KAPS</a>
        {" "} {/*space*/}
        </div>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
      <section className="about-section">
        <div className="about-container">
          <div className="card">
            <h2 className="about-heading">About Us</h2>
            <p className="about-description">  display: flex;
  justify-content: center;
              This development of this system is to:
             <p> 1. This system is to improve the payment system hence reduce the defaulting rate from the company since most users can't afford to pay for their accounts on a monthly basis hence can pay for them daily as long as they have money on their accounts.</p>
              <p>2.This shall also help a majority of users who forget about paying for their accounts and end up losing them, or gather huge accumulation of areas which might lead to them to making their accounts dormant and prefer to start over.</p>
               <p>3.It also helps those who pay for other peoples accounts hence they can pay for multiple accounts as long as they have sufficient funds in their accounts, they'll only get notifications.</p> 
            </p>
            <div className="about-image">
            <img src={aboutImage} alt="About" />
            </div>
            <div className='about-button'>
            <button onClick={() => navigate('/Register')}>Get Started</button>
            </div>          
          </div>
        </div>
      </section>
      </div>
      )}
    </body>
  );
}

export default App;