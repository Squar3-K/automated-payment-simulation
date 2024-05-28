import React, { useState, useEffect } from 'react';
import { useLocation, Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UA.css';

const UserAccount = () => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const { NHIF_ID } = location.state || {};

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (NHIF_ID) {
          const userDataResponse = await axios.get(`http://localhost:5000/api/user-data?nhifId=${NHIF_ID}`);
          setUserData(userDataResponse.data);

          const { phoneNumber, balance } = location.state || {};
        setPhoneNumber(phoneNumber || '');
        setBalance(balance || 0);

          console.error('Invalid NHIF_ID:', NHIF_ID);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUserData();
  }, [NHIF_ID]);

  const handleAddCard = () => {
    navigate('/paymentmethod', { state: { NHIF_ID } });
  };

  const handlePhoneNumberSubmit = (number) => {
    setPhoneNumber(number);
    // You can perform additional actions here, such as updating the user's phone number in the database
  };

 const handleGoToLog = () => {
    navigate('/login', { state: { NHIF_ID } });
  };

  return (
    <div className="user-account-container">
      {userData ? (
        <>
          <h2>User Account</h2>
          <div className="name-container">
            <div className="FN">
              <div className="notification">
                <div className="notiglow"></div>
                <div className="notiborderglow"></div>
                <div className="notititle">First Name</div>
                <div className="notibody">{userData.FirstName}</div>
              </div>
            </div>
            <div className="LN">
              <div className="notification">
                <div className="notiglow"></div>
                <div className="notiborderglow"></div>
                <div className="notititle">Last Name</div>
                <div className="notibody">{userData.LastName}</div>
              </div>
            </div>
          </div>
          <div className="EL">
            <div className="notification">
              <div className="notiglow"></div>
              <div className="notiborderglow"></div>
              <div className="notititle">Email</div>
              <div className="notibody"> {userData.Email} </div>
            </div>
          </div>

          <Link to="/pchange" state={{ NHIF_ID }}>
            <button>Change Password</button>
          </Link>

                      <div className="Balance">
              <div className="notification">
                <div className="notiglow"></div>
                <div className="notiborderglow"></div>
                <div className="notititle">Balance</div>
                <div className="notibody">{balance}</div>
              </div>
            </div>

          <button type="button" className="Abutton" onClick={handleAddCard}>
            <span className="Abutton__text">Add card</span>
            <span className="Abutton__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height="24" fill="none" className="svg">
                <line y2="19" y1="5" x2="12" x1="12"></line>
                <line y2="12" y1="12" x2="19" x1="5"></line>
              </svg>
            </span>
          </button>

          <div className="PN">
          {phoneNumber && (
            <div className="notification">
              <div className="notiglow"></div>
              <div className="notiborderglow"></div>
              <div className="notititle">Phone Number</div>
              <div className="notibody">               <>
              <p>{phoneNumber}</p>
              </>
              </div>
            </div>
            )}
             {NHIF_ID && (

<button onClick={handleGoToLog}>Go to Login</button>
      )}

          </div>

        </>
      ) : (
        <p>Loading...</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default UserAccount;