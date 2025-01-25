const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Schema and Model
const shiftSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now }, // Auto-generated timestamp
    name: { type: String, required: true },
    location: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    duration: { type: Number, required: true },
    bellOrOtherInfo: { type: String }, // Includes Bell Tech or "Other" details
});

const Shift = mongoose.model('Shift', shiftSchema);

// Routes

// Serve static files (if hosting a front-end with the same backend)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to handle shift submissions
app.post('/api/shift', async (req, res) => {
    try {
        const {
            name,
            shiftLocation,
            otherShift,
            bellTechLocation,
            managementInfo,
            technicalInfo,
            reportedTo,
            start,
            end,
            duration,
        } = req.body;

        // Validate required fields
        if (!name || !shiftLocation || !start || !end || !duration) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Determine `location` and `bellOrOtherInfo`
        const location = shiftLocation === 'Other' ? otherShift : shiftLocation;
        let bellOrOtherInfo = null;

        if (shiftLocation === 'Bell Tech') {
            bellOrOtherInfo = `Bell Tech Info: Location - ${bellTechLocation}, Management - ${managementInfo}, Technical - ${technicalInfo}`;
        } else if (shiftLocation === 'Other') {
            bellOrOtherInfo = `Reported To: ${reportedTo}`;
        }

        // Create a new Shift document
        const newShift = new Shift({
            name,
            location,
            start: new Date(start),
            end: new Date(end),
            duration,
            bellOrOtherInfo,
        });

        // Save to MongoDB
        await newShift.save();
        res.status(201).json({ message: 'Shift data saved successfully!' });
    } catch (error) {
        console.error('Error saving shift data:', error);
        res.status(500).json({ error: 'Error saving shift data.' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
