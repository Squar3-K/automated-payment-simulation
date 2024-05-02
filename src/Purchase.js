import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './purchase.css';

const Purchase = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [subscription, setSubscription] = useState(null); // New state for subscription
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUserId } = location.state || {};

  const handlePaymentSimulation = async (amount) => {
    try {
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const paymentData = {
          nhifId: loggedInUserId,
          amount,
          paymentDate: new Date().toISOString(),
        };

        const response = await axios.post('http://localhost:5000/api/payment-log', paymentData);
        if (response.data.success) {
          setPaymentSuccess(true);
          setSubscription({ amount, paymentDate: new Date().toISOString() });

          setTimeout(() => {
            navigate('/Log', { state: { NHIF_ID: loggedInUserId, subscription } });
          }, 2000);
        } else {
          console.error('Payment simulation failed:', response.data);
        }
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
      }
    } catch (error) {
      console.error('Error during payment simulation:', error);
    }
  };

  return (
    <div className="membership-container">
    <h1>Membership Options</h1>
      {paymentSuccess ? (
        <div>Payment successful! Redirecting...</div>
      ) : (
        <div className="subscription-container">
          <section className="subscriptions">
            <div className="content">
              <div className="title">Monthly edition</div>
              <div className="price">KSH 39.99</div>
              <div className="description">Pay for your subscriptions monthly</div>
            </div>
            <button onClick={() => handlePaymentSimulation(39.99)}>Pay</button>
          </section>
          <section className="subscriptions">
            <div className="content">
              <div className="title">Quarterly edition</div>
              <div className="price">KSH 59.99</div>
              <div className="description">Pay for your subscriptions Quarterly</div>
            </div>
            <button onClick={() => handlePaymentSimulation(59.99)}>Pay</button>
          </section>
          <section className="subscriptions">
            <div className="content">
              <div className="title">Yearly edition</div>
              <div className="price">KSH 99.99</div>
              <div className="description">Pay for your subscriptions Yearly</div>
            </div>
            <button onClick={() => handlePaymentSimulation(99.99)}>Pay</button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Purchase;