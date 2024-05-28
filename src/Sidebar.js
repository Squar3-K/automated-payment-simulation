import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import './Sidebar.css';

const Sidebar = ({ loggedInUserId, userData, handleLogout, handleDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDatePickerChange = (date) => {
    setSelectedDate(date);
    handleDateChange(date);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {userData && <span>{userData.name}</span>}
      </div>
      
      <div className="sidebar-content">

        <div className='sidebar-a'>
        <Link to="/user-account" state={{ NHIF_ID: loggedInUserId }}>
          <button className='Lbutton' alt="Account">
                <i>A</i>
                <i>c</i>
                <i>c</i>
                <i>o</i>
                <i>u</i>
                <i>n</i>
                <i>t</i>
          </button>
        </Link>
        </div>
        
        <div className='sidebar-b'>
        <button className='Lbutton' alt="Log Out" onClick={handleLogout}>
                  <i>L</i>
                  <i>o</i>
                  <i>g</i>
                  <i>&nbsp;</i>
                  <i>O</i>
                  <i>u</i>
                  <i>t</i>
                </button>
        </div>

        <div className="date-picker">
          <DatePicker
            onChange={handleDatePickerChange}
            value={selectedDate}
            clearIcon={null}
            calendarIcon={null}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;