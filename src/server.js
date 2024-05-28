const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors'); 
const port = 5000;
const child_process = require('child_process');

app.use(express.json());
app.use(cors());


// Database configuration
const config = {
  user: 'sa',
  password: 'PoPcorn360.',
  server: 'localhost',
  database: 'Automated2',
  options: {
    trustedconnection: true,
    enableArithAbort: true,
    encrypt: false,
  },
};

// Route to handle login requests
app.post('/db', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const query = "SELECT * FROM ACC_INFO WHERE NHIF_ID = @NHIF_ID AND pass = @pass";
    const result = await pool.request()
      .input('NHIF_ID', sql.Int, req.body.NHIF_ID)
      .input('pass', sql.VarChar(50), req.body.pass)
      .query(query);

    if (result.recordset.length > 0) {
      res.json({ loggedInUserId: result.recordset[0].NHIF_ID });
    } else {
      res.status(401).json({ message: 'Login failed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

//check and getting user data to be displayed on user info
app.get('/api/user-data', async (req, res) => {
  const nhifId = req.query.nhifId;

  if (nhifId === null || nhifId === undefined) {
    return res.status(400).json({ message: 'NHIF_ID is required' });
  }

  console.log('Fetching user data for NHIF_ID:', nhifId);

  try {
    const pool = await sql.connect(config);
    const query = "SELECT FirstName, LastName, Email FROM ACC_INFO WHERE NHIF_ID = CAST(@NHIF_ID AS VARCHAR(50))";
    const result = await pool.request()
      .input('NHIF_ID', sql.VarChar(50), nhifId)
      .query(query);

    console.log('Query result:', result.recordset);

    if (result.recordset.length > 0) {
      const userData = result.recordset[0];
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

//check if the random ID generated has been repeated
app.get('/api/check-nhif-id', async (req, res) => {
  const nhifId = req.query.nhifId;

  try {
    const pool = await sql.connect(config);
    const query = "SELECT * FROM ACC_INFO WHERE NHIF_ID = @NHIF_ID";
    const result = await pool.request()
      .input('NHIF_ID', sql.Int, nhifId)
      .query(query);

    res.json({ exists: result.recordset.length > 0 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

//check if the email used in registration has been used before
app.get('/api/check-email', async (req, res) => {
  const email = req.query.email;

  try {
    const pool = await sql.connect(config);
    const query = "SELECT * FROM ACC_INFO WHERE Email = @Email";
    const result = await pool.request()
      .input('Email', sql.VarChar(50), email)
      .query(query);

    res.json({ exists: result.recordset.length > 0 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Route to register a new user
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password, nhifId } = req.body;

  try {
    const pool = await sql.connect(config);
    const query = `
      INSERT INTO ACC_INFO (NHIF_ID, FirstName, LastName, Email, pass)
      VALUES (@NHIF_ID, @FirstName, @LastName, @Email, @pass)
    `;
    await pool.request()
      .input('NHIF_ID', sql.Int, nhifId)
      .input('FirstName', sql.VarChar(50), firstName)
      .input('LastName', sql.VarChar(50), lastName)
      .input('Email', sql.VarChar(50), email)
      .input('pass', sql.VarChar(50), password)
      .query(query);

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/api/update-password', async (req, res) => {
  const { nhifId, newPassword } = req.body;

  try {
    const pool = await sql.connect(config);
    const query = "UPDATE ACC_INFO SET pass = @pass WHERE NHIF_ID = @NHIF_ID";
    await pool.request()
      .input('NHIF_ID', sql.Int, nhifId)
      .input('pass', sql.VarChar(10), newPassword)
      .query(query);

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Route to handle payment log requests
app.get('/api/payment-log', async (req, res) => {
  const loggedInUserId = req.query.nhifId;
  if (!loggedInUserId) {
    return res.status(400).json({ message: 'NHIF_ID is required' });
  }

  try {
    const pool = await sql.connect(config);
    const query = "SELECT * FROM Payment_logs WHERE NHIF_ID = @NHIF_ID ORDER BY payment_date DESC";
    const result = await pool.request()
      .input('NHIF_ID', sql.Int, loggedInUserId)
      .query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/api/payment-log', async (req, res) => {
  const { nhifId, amount, paymentDate } = req.body;

  // Check if nhifId is present and a valid number
  if (!nhifId || isNaN(nhifId)) {
    return res.status(400).json({ message: 'Invalid NHIF_ID' });
  }

  // Check if amount is present and a valid number
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  // Check if paymentDate is present and a valid date string
  if (!paymentDate || isNaN(Date.parse(paymentDate))) {
    return res.status(400).json({ message: 'Invalid payment date' });
  }

  try {
    const pool = await sql.connect(config);
    const query = "INSERT INTO Payment_logs (NHIF_ID, Amount, payment_date) VALUES (@NHIF_ID, @Amount, @payment_date)";
    await pool.request()
      .input('NHIF_ID', sql.Int, nhifId)
      .input('Amount', sql.Decimal(10, 2), amount)
      .input('payment_date', sql.Date, paymentDate)
      .query(query);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

//delete a user log when a refund is requested
app.delete('/api/payment-log', async (req, res) => {
    const paymentId = req.body.paymentId;
    if (!paymentId || isNaN(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }
  
    try {
      const pool = await sql.connect(config);
  
      // Check if the payment log entry exists
      const getPaymentQuery = `
        SELECT * 
        FROM Payment_logs
        WHERE PaymentID = @PaymentID
      `;
      const getPaymentResult = await pool.request()
        .input('PaymentID', sql.Int, paymentId)
        .query(getPaymentQuery);
  
      if (getPaymentResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Payment log not found' });
      }
  
      const paymentLog = getPaymentResult.recordset[0];
  
      // Delete the payment log entry
      const deleteQuery = `
        DELETE FROM Payment_logs
        WHERE PaymentID = @PaymentID
      `;
      await pool.request()
        .input('PaymentID', sql.Int, paymentId)
        .query(deleteQuery);
  
      res.json({ success: true, refundedPayment: paymentLog });
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'XXXXX') {
        res.status(500).json({ message: 'Specific error message for this error code' });
      } else {
        res.status(500).json({ message: 'An error occurred', error: error.message });
      }
    }
  });

  app.post('/api/generate-random-balance', async (req, res) => {
    const { nhifId } = req.body;
    const maxBalance = 6000;
    const randomBalance = Math.floor(Math.random() * maxBalance) + 1;
  
    try {
      const pool = await sql.connect(config);
      const query = "UPDATE ACC_INFO SET Balance = @Balance WHERE NHIF_ID = @NHIF_ID";
      await pool.request()
        .input('NHIF_ID', sql.Int, nhifId)
        .input('Balance', sql.Decimal(10, 2), randomBalance)
        .query(query);
  
      res.json({ success: true, balance: randomBalance });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  // Get user balance
app.get('/api/get-balance', async (req, res) => {
  const nhifId = req.query.nhifId;
  
  try {
  const pool = await sql.connect(config);
      const query = "SELECT Balance FROM ACC_INFO WHERE NHIF_ID = @NHIF_ID";
      const result = await pool.request()
        .input('NHIF_ID', sql.Int, nhifId)
        .query(query);
  
      if (result.recordset.length > 0) {
        const { Balance } = result.recordset[0];
        res.json({ balance: Balance });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  app.post('/api/update-phone-number', async (req, res) => {
    const { nhifId, phoneNumber } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const query = "UPDATE ACC_INFO SET PhoneNumber = @PhoneNumber WHERE NHIF_ID = @NHIF_ID";
      await pool.request()
        .input('NHIF_ID', sql.Int, nhifId)
        .input('PhoneNumber', sql.VarChar, phoneNumber)
        .query(query);
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  // Update user balance
  app.post('/api/update-balance', async (req, res) => {
    const { nhifId, amount } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const query = "UPDATE ACC_INFO SET Balance = Balance + @Amount WHERE NHIF_ID = @NHIF_ID";
      await pool.request()
        .input('NHIF_ID', sql.Int, nhifId)
        .input('Amount', sql.Decimal(10, 2), amount)
        .query(query);
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  const calculateEndDate = (subscriptionType, currentEndDate) => {
    const endDate = new Date(currentEndDate);
    if (subscriptionType === 'minute') {
      endDate.setMinutes(endDate.getMinutes() + 1);
    } else if (subscriptionType === '30seconds') {
      endDate.setSeconds(endDate.getSeconds() + 30);
    } else if (subscriptionType === '2minutes') {
      endDate.setMinutes(endDate.getMinutes() + 2);
    }
    return endDate;
  };
  
  const subscriptions = [];
  
  // Endpoint for creating a new subscription
  app.post('/api/create-subscription', (req, res) => {
    const subscriptionData = req.body;
    subscriptions.push(subscriptionData);
    res.json({ success: true });
  });
  
  // Function to check and handle expired subscriptions
  function checkExpiredSubscriptions() {
    const currentTime = new Date().toISOString();
    const expiredSubscriptions = subscriptions.filter(
      (subscription) => subscription.endDate < currentTime
    );
  
    expiredSubscriptions.forEach(async (subscription) => {
      try {
        const pool = await sql.connect(config);
  
        // Create a new automatic payment log entry
        const insertPaymentLogQuery = "INSERT INTO Payment_logs (NHIF_ID, Amount, payment_date) VALUES (@NHIF_ID, @Amount, @payment_date)";
        await pool.request()
          .input('NHIF_ID', sql.Int, subscription.nhifId)
          .input('Amount', sql.Decimal(10, 2), subscription.amount)
          .input('payment_date', sql.Date, new Date().toISOString())
          .query(insertPaymentLogQuery);
  
        console.log(`New payment log entry created for user ${subscription.nhifId}`);
  
        // Update the subscription endDate to add another duration
        const newEndDate = calculateEndDate(subscription.subscriptionType, subscription.endDate);
        subscription.endDate = newEndDate.toISOString();
      } catch (error) {
        console.error('Error creating automatic payment:', error);
      }
    });
  }
  
  // Check for expired subscriptions every minute
  setInterval(checkExpiredSubscriptions, 10 * 1000);
  
// Keep track of the latest payment log entry timestamp
let latestPaymentLogTimestamp = null;

// Endpoint for getting new payment log entries
app.get('/api/get-new-payment-logs', async (req, res) => {
  const nhifId = req.query.nhifId;
  const lastTimestamp = req.query.lastTimestamp;

  try {
    const pool = await sql.connect(config);
    const query = `
      SELECT *
      FROM Payment_logs
      WHERE NHIF_ID = @NHIF_ID AND payment_date > @lastTimestamp
      ORDER BY payment_date DESC
    `;
    const result = await pool.request()
      .input('NHIF_ID', sql.Int, nhifId)
      .input('lastTimestamp', sql.DateTimeOffset, lastTimestamp || '1900-01-01T00:00:00')
      .query(query);

    const newPaymentLogs = result.recordset;

    // Update the latestPaymentLogTimestamp if there are new entries
    if (newPaymentLogs.length > 0) {
      latestPaymentLogTimestamp = newPaymentLogs[0].payment_date;
    }

    res.json(newPaymentLogs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

function restartServer() {
  console.log('Restarting server...');
  child_process.spawn(process.argv.shift(), process.argv, {
    cwd: process.cwd(),
    detached: true,
    stdio: 'inherit',
  }).unref();
  process.exit();
}

// endpoint to initialize cancalling of the subscription  
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    console.log('Canceling subscription');
    restartServer();
    res.json({ success: true, message: 'Subscription canceled' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  }); 