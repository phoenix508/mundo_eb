const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);

// View engine
app.set('view engine', 'ejs');
app.set('layout', 'layout');

// Create Destination Schema
const destinationSchema = new mongoose.Schema({
    name: String,
    country: String,
    description: String,
    highlights: [String],
    bestTimeToVisit: String,
    imageUrl: String
});

const Destination = mongoose.model('Destination', destinationSchema);

// Create Contact Schema
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    interests: [String],
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Gallery data
const galleryImages = [
    {
        url: 'https://cdn.pixabay.com/photo/2017/10/29/10/55/big-ben-2899429_960_720.jpg',
        title: 'Big Ben',
        location: 'London, UK'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2019/08/08/06/06/fushimi-inari-4392018_960_720.jpg',
        title: 'Fushimi Inari Shrine',
        location: 'Kyoto, Japan'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2016/07/28/02/02/santorini-1546901_960_720.jpg',
        title: 'Blue Domes',
        location: 'Santorini, Greece'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2021/10/23/16/31/italy-6735340_960_720.jpg',
        title: 'Grand Canal',
        location: 'Venice, Italy'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2017/11/21/05/57/terracotta-warriors-2967435_960_720.jpg',
        title: 'Terracotta Army',
        location: 'XiAn, China'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2023/04/16/11/27/bridge-7930004_960_720.jpg',
        title: 'Dumbo Bridge',
        location: 'Brooklyn, USA'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2016/01/13/17/48/machupicchu-1138641_960_720.jpg',
        title: 'Machu Picchu',
        location: 'Cusco, Peru'
    },
    {
        url: 'https://cdn.pixabay.com/photo/2022/11/01/14/02/the-bund-7562414_960_720.jpg',
        title: 'The Bund',
        location: 'Shanghai, China'
    },
    {
        url: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad',
        title: 'Sydney Opera House',
        location: 'Sydney, Australia'
    }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home',
        message: 'Welcome to Travel Explorer'
    });
});

app.get('/gallery', (req, res) => {
    res.render('gallery', {
        title: 'Gallery',
        galleryImages: galleryImages
    });
});

// Search destinations
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const destinations = await Destination.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { country: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Save contact information
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Add this after your mongoose connection
const sampleDestinations = [
    {
        name: "Paris",
        country: "France",
        description: "The City of Light, famous for the Eiffel Tower and world-class cuisine",
        highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral"],
        bestTimeToVisit: "April to October",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"
    },
    {
        name: "Tokyo",
        country: "Japan",
        description: "A fascinating blend of ultra-modern and traditional",
        highlights: ["Shibuya Crossing", "Mount Fuji", "Senso-ji Temple"],
        bestTimeToVisit: "March to May or September to November",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"
    },
    {
        name: "Venice",
        country: "Italy",
        description: "Historic city of canals, art, and architecture",
        highlights: ["St. Mark's Basilica", "Grand Canal", "Rialto Bridge"],
        bestTimeToVisit: "September to November",
        imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800"
    },
    {
        name: "Santorini",
        country: "Greece",
        description: "Stunning white-washed buildings and beautiful sunsets",
        highlights: ["Oia", "Caldera Views", "Black Sand Beaches"],
        bestTimeToVisit: "June to September",
        imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"
    }
];

// Add this after your Destination model definition
async function seedDatabase() {
    try {
        const count = await Destination.countDocuments();
        if (count === 0) {
            await Destination.insertMany(sampleDestinations);
            console.log('Sample destinations added to database');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Call this after MongoDB connection is established
mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
    seedDatabase();
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 