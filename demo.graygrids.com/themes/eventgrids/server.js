// mongodb+srv://reddyvamsi39:ZAig0FoaaNPsyyOE@cluster1.uzhkvzu.mongodb.net/NIPUNA
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const htmlPath = __dirname;
app.use(express.static(htmlPath));
app.use(express.static(path.join(__dirname, "assets")));


app.get("/", (req, res) => res.sendFile(path.join(htmlPath, "index.html")));
app.get("/about-us", (req, res) => res.sendFile(path.join(htmlPath, "about-us.html")));
app.get("/events", (req, res) => res.sendFile(path.join(htmlPath, "events.html")));
app.get("/team", (req, res) => res.sendFile(path.join(htmlPath, "team.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(htmlPath, "contact.html")));



// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://reddyvamsi39:ZAig0FoaaNPsyyOE@cluster1.uzhkvzu.mongodb.net/NIPUNA', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: String,
    subject: String,
    email: String,
    message: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Contact = mongoose.model('Contact', contactSchema);

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    college: String,
    year: Number,
    course: String,
    location: String,
    amount: Number,
    selectedEvents: { type: Object, required: true }
});
const Registration = mongoose.model('Registration', registrationSchema);



// Student registration with payment
app.post('/register', async (req, res) => {
    try {
        console.log(req.body); // Log the received data

        const { name, email, phone, college, year, course, location, amount, selectedEvents } = req.body;

        // Check for missing fields
        if (!name || !email || !phone || !college || !year || !course || !location || amount === undefined) {
            return res.status(400).send('All fields are required.');
        }

        // Validate if year and amount are numbers
        if (isNaN(year) || isNaN(amount)) {
            return res.status(400).send('Year and Amount should be valid numbers.');
        }

        // Convert selectedEvents object to an array of event names
        const selectedEventsArray = selectedEvents ? Object.keys(selectedEvents) : [];

        // Check if selectedEventsArray is empty
        if (selectedEventsArray.length === 0) {
            return res.status(400).send('At least one event should be selected.');
        }

        // Save the registration data
        const newRegistration = new Registration({ 
            name, 
            email, 
            phone,  // Keep as string (phone numbers may contain leading zeros)
            college, 
            year, 
            course, 
            location, 
            amount, 
            selectedEvents: selectedEventsArray // Store array of event names
        });

        await newRegistration.save();
        res.status(200).json({ message: 'Student registered successfully!' });

    } catch (error) {
        console.error('Error inserting student data:', error);
        res.status(500).send('Server error');
    }
});

// Contact form submission
app.post('/submit-contact', async (req, res) => {
    try {
        console.log('Received data:', req.body);
        
        const { name, subject, email, message } = req.body;
        
        // Debug log
        console.log('Extracted fields:', { name, subject, email, message });
        
        // Validate required fields
        if (!name || !subject || !email || !message) {
            console.log('Missing fields:', { name, subject, email, message });
            return res.status(400).json({ 
                error: 'All fields are required',
                received: { name, subject, email, message }
            });
        }
        
        // Create new contact document
        const newContact = new Contact({
            name,
            subject,
            email,
            message
        });
        
        // Save to database
        await newContact.save();
        console.log('Saved contact:', newContact);
        
        res.status(200).json({ message: 'Message submitted successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ 
            error: 'An error occurred while submitting your message',
            details: error.message
        });
    }
});


app.listen(port, () => {
    console.log("Server running at http://localhost:3000");
});