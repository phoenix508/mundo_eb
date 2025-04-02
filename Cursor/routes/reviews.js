const express = require('express');
const router = express.Router();

// In production, these would be database queries
let reviews = [
    {
        id: 1,
        hotelId: 1,
        hotelName: "SALT of Palmar, Mauritius",
        rating: 5,
        comment: "Absolutely stunning hotel with incredible service. The private beach access was a highlight of our stay.",
        author: "John D.",
        location: "United Kingdom",
        date: "2024-02-15",
        helpfulCount: 12
    },
    {
        id: 2,
        hotelId: 2,
        hotelName: "Angsana Velavaru, Maldives",
        rating: 4,
        comment: "Beautiful overwater villa with amazing views. Service could be a bit more attentive.",
        author: "Sarah M.",
        location: "Australia",
        date: "2024-02-10",
        helpfulCount: 8
    }
];

// Get all reviews for a specific hotel
router.get('/:hotelId', (req, res) => {
    const hotelId = parseInt(req.params.hotelId);
    const hotelReviews = reviews.filter(review => review.hotelId === hotelId);
    res.json(hotelReviews);
});

// Submit a new review
router.post('/', (req, res) => {
    const newReview = {
        id: reviews.length + 1,
        ...req.body,
        date: new Date().toISOString().split('T')[0],
        helpfulCount: 0
    };
    reviews.push(newReview);
    res.status(201).json(newReview);
});

// Update a review
router.put('/:reviewId', (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Review not found' });
    }

    reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        ...req.body,
        id: reviewId
    };

    res.json(reviews[reviewIndex]);
});

// Delete a review
router.delete('/:reviewId', (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Review not found' });
    }

    reviews.splice(reviewIndex, 1);
    res.status(204).send();
});

// Mark review as helpful
router.post('/:reviewId/helpful', (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }

    review.helpfulCount += 1;
    res.json(review);
});

module.exports = router; 