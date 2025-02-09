
// mongodb+srv://reddyvamsi39:ZAig0FoaaNPsyyOE@cluster1.uzhkvzu.mongodb.net/NIPUNA
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

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
const mongoURI = 'mongodb+srv://reddyvamsi39:ZAig0FoaaNPsyyOE@cluster1.uzhkvzu.mongodb.net/NIPUNA';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schemas and models
const contactSchema = new mongoose.Schema({
    name: String,
    subject: String,
    email: String,
    message: String
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
    eventsSelected: [String]
});
const Registration = mongoose.model('Registration', registrationSchema);



// Student registration with payment
app.post('/register', async (req, res) => {
    try {
        console.log(req.body); // Log the received data

        const { name, email, phone, college, year, course, location, amount, eventsSelected } = req.body;

        // Check for missing fields
        if (!name || !email || !phone || !college || !year || !course || !location || amount === undefined) {
            return res.status(400).send('All fields are required.');
        }

        // Validate if phone, year, and amount are numbers
        if (isNaN(phone) || isNaN(year) || isNaN(amount)) {
            return res.status(400).send('Phone, Year, and Amount should be valid numbers.');
        }

        // Check if the eventsSelected is a non-empty array
        // if (!Array.isArray(eventsSelected) || eventsSelected.length === 0) {
        //     return res.status(400).send('At least one event should be selected.');
        // }

        // Save the registration data
        const newRegistration = new Registration({ name, email, phone, college, year, course, location, amount, eventsSelected });
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
        const { name, subject, email, message } = req.body;
        if (!name || !subject || !email || !message) {
            return res.status(400).send('All fields are required.');
        }
        const newContact = new Contact({ name, subject, email, message });
        await newContact.save();
        res.status(200).send('Message submitted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
