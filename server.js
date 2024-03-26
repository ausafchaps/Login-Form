const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

// Configuring MySQL connection details
const pool = mysql.createPool({
  host: 'localhost',
  user: 'ausaf',
  password: 'pass',
  database: 'form_data',
});

const app = express();
const port = 3000;
app.use(cors({origin: 'http://127.0.0.1:5500' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/save_form_data', async (req, res) => {
  //Log the form details on console
  console.log(req.body); 

  const { email, password, first_name, last_name, address } = req.body;

  try {
    // Connect to the database
    const connection = await pool.getConnection();

    // Prepare SQL statement with placeholders for security
    const sql = `INSERT INTO users (email, password, first_name, last_name, address) VALUES (?, ?, ?, ?, ?)`;

    // Execute the query with data
    const [result] = await connection.execute(sql, [email, password, first_name, last_name, address]);

    // Release the connection
    await connection.release();

    console.log('Form data saved to database successfully');
    res.send('Form data saved successfully');
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).send('Error saving form data');
  }
});

app.get('/getlist', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    //SQL query to select all columns from the table
    const sql = 'SELECT * FROM users';
    const [rows] = await connection.execute(sql);
    await connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).send('Error fetching user list');
  }
});

app.get('/getUserById', async (req, res) => {
  const userId = req.query.id;
  try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
      await connection.release();
      if (rows.length > 0) {
          res.json(rows[0]);
      } else {
          res.status(404).send('User not found');
      }
  } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).send('Error fetching user by ID');
  }
});

app.post('/updateUser', async (req, res) => {
  const userId = req.query.id;
  const { email, password, first_name, last_name, address } = req.body;
  try {
      const connection = await pool.getConnection();
      const sql = 'UPDATE users SET email=?, password=?, first_name=?, last_name=?, address=? WHERE id=?';
      await connection.execute(sql, [email, password, first_name, last_name, address, userId]);
      await connection.release();
      res.send('User details updated successfully');
  } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).send('Error updating user details');
  }
});


//Start the server on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
