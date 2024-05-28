import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './purchase.css';
import Loader from './Loader';

const Purchase = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [subscription, setSubscription] = useState(null); // New state for subscription
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUserId } = location.state || {};

  const calculateEndDate = (subscriptionType) => {
    const startDate = new Date();
  if (subscriptionType === 'minute') {
    return new Date(startDate.setMinutes(startDate.getMinutes() + 1)).toISOString();
  } else if (subscriptionType === '30seconds') {
    return new Date(startDate.setSeconds(startDate.getSeconds() + 30)).toISOString();
  } else if (subscriptionType === '2minutes') {
    return new Date(startDate.setMinutes(startDate.getMinutes() + 2)).toISOString();
  }
};


  const handleSubscription = async (amount, subscriptionType) => {
    try {
      setIsLoading(true);
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const subscriptionData = {
          nhifId: loggedInUserId,
          amount,
          subscriptionType,
          startDate: new Date().toISOString(),
          endDate: calculateEndDate(subscriptionType),
        };

        // Check if the user has enough balance
        const balanceResponse = await axios.get(`http://localhost:5000/api/get-balance?nhifId=${loggedInUserId}`);
        const userBalance = balanceResponse.data.balance;

        if (userBalance >= amount) {
          const response = await axios.post('http://localhost:5000/api/create-subscription', subscriptionData);
          if (response.data.success) {
            setPaymentSuccess(true);
            setSubscription(subscriptionData);

            // Deduct the subscription amount from the user's balance
            await axios.post('http://localhost:5000/api/update-balance', {
              nhifId: loggedInUserId,
              amount: -amount,
            });

            setTimeout(() => {
              navigate('/login', { state: { NHIF_ID: loggedInUserId, subscription: subscriptionData } });
            }, 2000);
          } else {
            console.error('Subscription creation failed:', response.data);
            alert(`Subscription creation failed: ${response.data.message}`);
          }
        } else {
          alert('Insufficient balance. Please add funds to your account.');
        }
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error during subscription creation:', error);
      alert(`Error during subscription creation: ${error.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed
  }, []);

  return (
    <div className="membership-container">
      {isLoading ? (
        <Loader />
      ) : paymentSuccess ? (
        <>
          <div>Payment successful!</div>
          <Loader /> {/* Render the Loader component while redirecting */}
        </>
      ) : (
        <div>
          <h1>Membership Options</h1>
          <div className="subscription-container">
            <section className="subscriptions">
              <div className="content">
                <div className="title">1 Minute</div>
                <div className="price">KSH 200</div>
                <div className="description">Pay for 1 minute of access</div>
              </div>
              <button onClick={() => handleSubscription(200, 'minute')}>Subscribe</button>
            </section>

              <section className="subscriptions">
                <div className="content">
                  <div className="title">30 Seconds</div>
                  <div className="price">KSH 100</div>
                  <div className="description">Pay for 30 seconds of access</div>
                </div>
                <button onClick={() => handleSubscription(100, '30seconds')}>Subscribe</button>
              </section>

              <section className="subscriptions">
                <div className="content">
                  <div className="title">2 Minutes</div>
                  <div className="price">KSH 300</div>
                  <div className="description">Pay for 2 minutes of access</div>
                </div>
                <button onClick={() => handleSubscription(300, '2minutes')}>Subscribe</button>
              </section>

          </div>
        </div>
      )}
    </div>
  );
};

export default Purchase;