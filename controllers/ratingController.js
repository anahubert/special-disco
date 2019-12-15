const Rating = require('./../models/ratingModel');
const User = require('./../models/userModel');

// Like the user and save the Rating document
exports.likeUser = async (req, res, next) => {
    try {
        if (req.user._id === req.params.id) {
            throw new Error('You can not add likes to yourself', 501);
        }
        const newRating = await Rating.create({
            parent_id: req.user._id,
            child_id: req.params.id
        });

        return res.status(201).json({
            status: 'success',
            results: 0,
            data: {
                rating: newRating
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            res.status(209).json({
                status: 'success',
                message: 'Already liked.'
            });
        } else {
            res.status(501).json({
                status: 'fail',
                message: err.message
            });
        }
    }
};

// Delete rating
exports.unlikeUser = async (req, res, next) => {
    try {
        const rating = await Rating.findOneAndDelete({
            parent_id: req.user._id,
            child_id: req.params.id
        });

        return res.status(200).json({
            status: 'success',
            results: 0,
            data: {
                rating: rating
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Can not serve the request.'
        });
    }
};

// Get likes for the user
exports.getUserLikes = async (req, res) => {
    try {
        const userRatings = await Rating.find({
            child_id: req.params.id
        });

        return res.status(200).json({
            status: 'success',
            results: userRatings.length,
            data: {
                likes: userRatings
            }
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'fail',
            message: 'Can not serve the request.'
        });
    }
};

// Get most liked users
exports.getMostLiked = async (req, res) => {
    try {
        const users = await User.find().sort({ likes: -1 });

        return res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users: users
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Can not serve the request.'
        });
    }
};
