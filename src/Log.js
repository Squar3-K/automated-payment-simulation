import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './Log.css';
import { format } from 'date-fns';
import Loader from './Loader';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import CancelSubscriptionButton from './CancelSubscriptionButton';

const Log = () => {
  const [paymentLog, setPaymentLog] = useState([]);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPurchaseButton, setShowPurchaseButton] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [refundMessage, setRefundMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { NHIF_ID, pass } = location.state || {};

  // retrieve from local storage
  const storedNHIF_ID = NHIF_ID || localStorage.getItem('NHIF_ID');
  const storedPass = pass || localStorage.getItem('pass');

  useEffect(() => {
    // loader bring up
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // fetching user id
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
        setIsLoading(false);
      }
    };

    fetchLoggedInUserId();
  }, [storedNHIF_ID, storedPass, location.state, navigate]);

  const fetchPaymentLog = async () => {
    try {
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const response = await axios.get(`http://localhost:5000/api/payment-log?nhifId=${loggedInUserId}`);
        const existingPaymentLog = response.data;

        let updatedPaymentLog = [];

        // Sort the existing payment log in descending order based on PaymentID
        const sortedExistingPaymentLog = existingPaymentLog.sort((a, b) => b.PaymentID - a.PaymentID);

        // Append the sorted existing payment log to the updatedPaymentLog
        updatedPaymentLog = [...updatedPaymentLog, ...sortedExistingPaymentLog];

        setPaymentLog(updatedPaymentLog); // Update the paymentLog state
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the payment log data when the component mounts
  useEffect(() => {
    fetchPaymentLog();
  }, [loggedInUserId]);

  const handleRefund = async (paymentId) => {
    try {
      if (loggedInUserId && !isNaN(loggedInUserId)) {
        const isLatestPayment = paymentLog.length > 0 && paymentLog[0].PaymentID === paymentId;

        if (isLatestPayment) {
          const response = await axios.delete(`http://localhost:5000/api/payment-log`, {
            data: { paymentId },
          });

          if (response.data.success) {
            console.log('Refund successful:', response.data.refundedPayment);
            setRefundMessage('Your refund has been processed.'); // Set refund message
            setTimeout(() => {
              setRefundMessage(null); // Clear refund message after 9 seconds
            }, 9000);

            // Add the refunded amount back to the user's balance
            const refundedAmount = response.data.refundedPayment.Amount;
            await axios.post('http://localhost:5000/api/update-balance', {
              nhifId: loggedInUserId,
              amount: refundedAmount,
            });

            fetchPaymentLog(loggedInUserId);
          } else if (response.status === 404) {
            console.log('Payment log not found');
          } else {
            throw new Error('Refund failed');
          }
        } else {
          console.log('Cannot refund an old payment. Only the latest payment can be refunded.');
        }
      } else {
        console.error('Invalid loggedInUserId:', loggedInUserId);
        setError('Invalid user ID. Please log in again.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (date) {
      const filteredLogs = paymentLog.filter((log) => {
        const logDate = new Date(log.payment_date);
        return (
          logDate.getFullYear() === date.getFullYear() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getDate() === date.getDate()
        );
      });

      setPaymentLog(filteredLogs);
    } else {
      // If no date is selected, show all logs
      fetchPaymentLog(loggedInUserId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('NHIF_ID');
    localStorage.removeItem('pass');

    navigate('/Login');
  };

  const generatePDF = (nhifId, paymentDate) => {
    const doc = new jsPDF();
    
    const receiptNumber = Math.floor(Math.random() * 1000000); // Generate a random 6-digit receipt number
  
    doc.setFontSize(18);
    doc.text('Payment Receipt', 20, 20);
    doc.setFontSize(14);
    doc.text(`NHIF ID: ${nhifId}`, 20, 40);
    doc.text(`Receipt Number: ${receiptNumber}`, 20, 80);
  
    doc.save(`nhif_${nhifId}_receipt_${receiptNumber}.pdf`);
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : !NHIF_ID || !pass ? (
        <Navigate to="/App" replace />
      ) : (
        <div className='log-container'>
          <>
            <div className="log-title">
              <h1>Payment Logs</h1>

              <div className="user-dropdown-container">
                <div className="user-dropdown">
                  <Sidebar
                    loggedInUserId={loggedInUserId}
                    userData={userData}
                    handleLogout={handleLogout}
                    handleDateChange={handleDateChange}
                  />
                </div>
              </div>
            </div>

            <div className='rmessage'>
              {refundMessage && <div>{refundMessage}</div>}
            </div>

            {subscription && (
                <div className="Pcard">
                  <h3>Subscription Details</h3>
                  <p>Subscription Type: {subscription.subscriptionType}</p>
                  <p>Amount: {subscription.amount}</p>
                  <p>End Date: {new Date(subscription.endDate).toLocaleString()}</p>
                </div>
              )}
            <div className='pbutton'>
              {showPurchaseButton && (
                <Link to="/purchase" state={{ loggedInUserId }}>
                  <button>Subscribe</button>
                </Link>
              )}
            </div>

            <table className='Log-table'>
              <thead>
                <tr>
                  <th>NHIF ID</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
        {paymentLog.map((log, index) => (
          <tr key={log.PaymentID} style={{ color: index === 0 ? 'green' : 'inherit' }}>
      <td onClick={() => generatePDF(log.NHIF_ID)}>{log.NHIF_ID}</td>
            <td>{log.Amount}</td>
            <td>{format(new Date(log.payment_date), 'dd/MM/yyyy')}</td>
            <td>
              <button onClick={() => handleRefund(log.PaymentID)}>Refund</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        {error && <div>Error: {error}</div>}
      </>

      <div className='Pbutton'>
  {/* Add the CancelSubscriptionButton component here */}
  <CancelSubscriptionButton
    nhifId={loggedInUserId}
    subscriptionType={subscription?.subscriptionType}
  />
</div>

  </div>
        )}
        </div>
  );
};

export default Log;