const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch'); // Import node-fetch

const app = express();
const port = 3000;

// MongoDB connection string
const uri = 'mongodb://localhost:27017/recipro';

// Middleware to parse JSON in the request body
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Access the 'recipro' database and 'users' collection
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('recipro');
    const collection = db.collection('users');

    // Insert the new user into the 'users' collection
    const result = await collection.insertOne({ username, password });
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.close();
  }
});

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('recipro');
    const collection = db.collection('users');

    // Check if the user with the provided username exists
    const user = await collection.findOne({ username: trimmedUsername });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Validate the password (assuming your passwords are hashed, use a proper authentication method)
    // For now, this example compares plaintext passwords. In a real-world scenario, use bcrypt or another secure method.
    if (user.password === trimmedPassword) {
      // Here, you can include additional logic based on the user data if needed
      // For example, fetch user-specific data from the 'users' collection

      // Fetch additional data using the fetchData route
      const fetchDataResponse = await fetch('http://localhost:3000/fetchData');
      const fetchedData = await fetchDataResponse.json();

      // Include the fetched data in the login response if needed
      res.json({ success: true, message: 'Login successful', userData: fetchedData.data });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.close();
  }
});

// Handle contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('recipro');
    const collection = db.collection('contact_form');

    // Insert the contact form data into the 'contact_form' collection
    const result = await collection.insertOne({ name, email, subject, message });

    res.json({ success: true, message: 'Contact form data submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.close();
  }
});

app.get('/contactData', async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('recipro');
    const collection = db.collection('contact_form');

    // Fetch all documents from the 'contact_form' collection
    const contactData = await collection.find({}).toArray();

    res.json(contactData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.close();
  }
});

// Handle fetching data
app.get('/fetchData', async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('recipro');
    const collection = db.collection('users');

    const cursor = collection.find({});
    const result = await cursor.toArray();

    console.log(result);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
