const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Assuming you have a User model
const Feedback = require('../models/Feedback');  // Using the Feedback model we created earlier


// POST /feedback - Create new feedback
router.post('/', async (req, res) => {
    try {
        const { studentUniqueId, tutorUniqueId, feedbackText, rating } = req.body;

        // Validate request body
        if (!studentUniqueId || !tutorUniqueId || !feedbackText || !rating) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        // Validate that both student and tutor exist
        const [student, tutor] = await Promise.all([
            User.findById(studentUniqueId),
            User.findById(tutorUniqueId)
        ]);

        if (!student || !tutor) {
            return res.status(404).json({ 
                message: 'Student or tutor not found' 
            });
        }

        if (tutor.role !== 'Tutor') {
            return res.status(400).json({ 
                message: 'Selected user is not a tutor' 
            });
        }

        // Create new feedback
        const newFeedback = new Feedback({
            studentUniqueId,
            tutorUniqueId,
            feedbackText,
            rating
        });

        await newFeedback.save();

        // Find the tutor user
        const tutorRecord = await User.findById(tutorUniqueId);

        // Update tutor's rating
        const currentRating = tutorRecord.rating || 0; // fallback to 0 if undefined
        const currentNumberOfRatings = tutorRecord.numberOfRating || 0;

        const newNumberOfRatings = currentNumberOfRatings + 1;
        const newAverageRating = ((currentRating * currentNumberOfRatings) + rating) / newNumberOfRatings;

        tutorRecord.rating = newAverageRating;
        tutorRecord.numberOfRating = newNumberOfRatings;

        // Save tutor's updated profile
        await tutorRecord.save();

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: newFeedback
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ 
            message: 'Error submitting feedback', 
            error: error.message 
        });
    }
});

module.exports = router;