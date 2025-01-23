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
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
app.post('/api/shift', async (req, res) => {
    try {
        const {
            name,
            shiftLocation,
            otherShift,
            bellTechLocation,
            managementInfo,
            technicalInfo,
            start,
            end,
            duration,
        } = req.body;

        // Determine the `location` and `bellOrOtherInfo` fields based on input
        const location = shiftLocation === 'Other' ? otherShift : shiftLocation;
        const bellOrOtherInfo = shiftLocation === 'Bell Tech'
            ? `Bell Tech Info: Location - ${bellTechLocation}, Management - ${managementInfo}, Technical - ${technicalInfo}`
            : shiftLocation === 'Other'
                ? `Reported To: ${req.body.reportedTo}`
                : null;

        // Create a new Shift document
        const newShift = new Shift({
            name,
            location,
            start: new Date(start),
            end: new Date(end),
            duration,
            bellOrOtherInfo,
        });

        await newShift.save();
        res.status(201).json({ message: 'Shift data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving shift data.' });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
