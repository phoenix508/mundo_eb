const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const nodemailer = require('nodemailer');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process'); // Import child_process to run Python scripts
const reviewsRouter = require('./routes/reviews');
// require('dotenv').config(); // Load environment variables

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');  // Set default layout
app.use(expressLayouts);

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

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
    res.render('index');
});

app.get('/hotel', (req, res) => {
    res.render('hotel', { 
        title: 'Hotel Reviews'
    });
});

app.get('/gallery', (req, res) => {
    res.render('gallery', {
        title: 'Gallery',
        galleryImages: galleryImages
    });
});

// Proxy route for Google Places API
app.get('/api/places/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = process.env.MAPS_API_KEY;

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: `top attractions in ${city}`,
                key: apiKey
            }
        });

        const attractions = response.data.results.slice(0, 3).map(attraction => ({
            name: attraction.name,
            description: attraction.formatted_address // You can customize this to include more details
        }));

        res.json(attractions);
    } catch (error) {
        console.error('Error fetching data from Google Places API:', error);
        res.status(500).json({ error: 'Failed to fetch attractions' });
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

// New route for AI agent
app.post('/api/ask-agent', async (req, res) => {
    const { question } = req.body;
    console.log('Received question:', question); // Debugging line

    // Call the Python script
    const pythonProcess = spawn('python', ['util.py', question]);

    pythonProcess.stdout.on('data', (data) => {
        console.log('Data from Python script:', data.toString()); // Log the output
        res.json({ response: data.toString() });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error communicating with AI agent' });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`); // Debugging line
    });
});

// Add this route in your existing routes section
app.get('/travel-tips', (req, res) => {
    res.render('travel-tips', { title: 'Travel Tips' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!'
    });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/services', (req, res) => {
    res.render('services', { title: 'Services' });
});

app.use('/api/reviews', reviewsRouter);

// Add this with your other routes
app.get('/legal', (req, res) => {
    res.render('legal', { title: 'Privacy Policy & Terms of Use' });
});

// Important: Use port 8081 for Elastic Beanstalk
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app; 