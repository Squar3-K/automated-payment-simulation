const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors'); 
const port = 5000;


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
      .input('pass', sql.VarChar(10), req.body.pass)
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
      .input('pass', sql.VarChar(10), password)
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
    const query = "SELECT * FROM Payment_logs WHERE NHIF_ID = @NHIF_ID";
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
  console.log('Received request on /api/payment-log');

  console.log('Received request body:', req.body);
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
      .input('payment_date', sql.DateTime, paymentDate)
      .query(query);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

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
  
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
}); 