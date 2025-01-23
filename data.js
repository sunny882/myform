const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('Cluster0'); // Replace with your specific database name if needed
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// API routes
app.get('/', (req, res) => {
    res.send('Welcome to your MongoDB RESTful API!');
});

app.get('/data', async (req, res) => {
    try {
        const db = await connectToDB();
        const collection = db.collection('your_collection'); // Replace with your collection name
        const data = await collection.find({}).toArray();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
