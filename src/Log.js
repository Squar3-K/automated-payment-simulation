import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './Log.css';
import { format } from 'date-fns';

const Log = () => {
  const [paymentLog, setPaymentLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPurchaseButton, setShowPurchaseButton] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [refundMessage, setRefundMessage] = useState(null);
  const [userData, setUserData] = useState(null); // Declare userData state
  const [showUserDropdown, setShowUserDropdown] = useState(false); // Declare showUserDropdown state
  const navigate = useNavigate();
  const location = useLocation();

  const { NHIF_ID, pass } = location.state || {};

  // retrieve from local storage
  const storedNHIF_ID = NHIF_ID || localStorage.getItem('NHIF_ID');
  const storedPass = pass || localStorage.getItem('pass');

  useEffect(() => {
    const fetchLoggedInUserId = async () => {
      try {
        if (storedNHIF_ID && storedPass) {
          console.log('storedNHIF_ID:', storedNHIF_ID);
          console.log('storedPass:', storedPass);

          const response = await axios.post('http://localhost:5000/db', { NHIF_ID: storedNHIF_ID, pass: storedPass });
          console.log('Response from server:', response.data);

          const fetchedLoggedInUserId = response.data.loggedInUserId;
          setLoggedInUserId(fetchedLoggedInUserId);

          const subscriptionFromPurchase = location.state?.subscription;
          fetchPaymentLog(fetchedLoggedInUserId, subscriptionFromPurchase);

          // Fetch user data
          const userDataResponse = await axios.get(`http://localhost:5000/api/user-data?nhifId=${fetchedLoggedInUserId}`);
          setUserData(userDataResponse.data);
        } else {
          console.error('Invalid loggedInUserId:', loggedInUserId);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedInUserId();
  }, [storedNHIF_ID, storedPass, location.state]);

  const fetchPaymentLog = async (loggedInUserId, subscription) => {
    try {
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const response = await axios.get(`http://localhost:5000/api/payment-log?nhifId=${loggedInUserId}`);
        let updatedPaymentLog = response.data;
  
        // If there is a new subscription, add it to the payment log
        if (subscription) {
          updatedPaymentLog = [
            {
              NHIF_ID: loggedInUserId,
              Amount: subscription.amount,
              payment_date: subscription.paymentDate,
            },
            ...updatedPaymentLog,
          ];
        }
  
        // Sort the payment log in descending order based on payment_date
        updatedPaymentLog.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  
        setPaymentLog(updatedPaymentLog); // Update the paymentLog state
  
        setShowPurchaseButton(!subscription); // Show "Subscribe" button if there's no new subscription
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    try {
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const response = await axios.delete(`http://localhost:5000/api/payment-log`, {
          data: { paymentId },
        });
        if (response.data.success) {
          console.log('Refund successful:', response.data.refundedPayment);
          setRefundMessage('Your refund has been processed.'); // Set refund message
          setTimeout(() => {
            setRefundMessage(null); // Clear refund message after 9 seconds
          }, 9000);
          fetchPaymentLog(loggedInUserId);
        } else if (response.status === 404) {
          console.log('Payment log not found');
        } else {
          throw new Error('Refund failed');
        }
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
        setError('Invalid user ID. Please log in again.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <div>
    {!NHIF_ID || !pass ? (
      <Navigate to="/Log" replace />
    ) : (
      <>
        <div className="header">
          <h1>Payment Logs</h1>
          <div className="user-dropdown">
            <button onClick={toggleUserDropdown}>
              <i className="fas fa-user"></i> {/* Replace with your desired icon */}
            </button>
            {showUserDropdown && userData && (
              <div className="user-data">
                <p>First Name: {userData.FirstName}</p>
                <p>Last Name: {userData.LastName}</p>
                <p>Email: {userData.Email}</p>
              </div>
            )}
          </div>
        </div>
        {refundMessage && <div>{refundMessage}</div>}
        {showPurchaseButton && (
          <Link to="/purchase" state={{ loggedInUserId }}>
            <button>Subscribe</button>
          </Link>
        )}
        <ul>
          {paymentLog.map((log, index) => (
            <li key={log.PaymentID} style={{ color: index === 0 ? 'green' : 'inherit' }}>
              <div>NHIF ID: {log.NHIF_ID}</div>
              <div>Amount: {log.Amount}</div>
              <div>Payment Date: {format(new Date(log.payment_date), 'dd/MM/yyyy')}</div>
              <button onClick={() => handleRefund(log.PaymentID)}>Refund</button>
            </li>
          ))}
        </ul>
        {error && <div>Error: {error}</div>}
      </>
    )}
  </div>
  );
};

export default Log;