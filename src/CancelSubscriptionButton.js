import React, { useState } from 'react';
import axios from 'axios';

const CancelSubscriptionButton = ({ nhifId, subscriptionType }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      await axios.post('http://localhost:5000/api/cancel-subscription', {
        nhifId,
        subscriptionType,
      });
      console.log('Subscription canceled successfully');
      // Optionally, you can update the UI or perform any other necessary actions
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // Handle the error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancelSubscription}
      disabled={isLoading}
      // Add any additional styles or classes as needed
    >
      {isLoading ? 'Canceling...' : 'Cancel Subscription'}
    </button>
  );
};

export default CancelSubscriptionButton;