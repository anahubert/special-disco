const mongoose = require('mongoose');

const User = require('./../models/userModel');

const ratingSchema = new mongoose.Schema({
    parent_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    child_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

// Populate ratings with user data
ratingSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'parent_id',
        select: 'name email'
    });
    next();
});

// Calculate likes on rating schema and update the user likes
ratingSchema.statics.calcRatings = async function(userId) {
    const stats = await this.aggregate([
        {
            $match: { child_id: userId }
        },
        {
            $group: {
                _id: '$child_id',
                likes: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await User.findByIdAndUpdate(userId, {
            likes: stats[0].likes
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            likes: 0
        });
    }
};

// After user like, save stats to the User document
ratingSchema.post('save', function() {
    this.constructor.calcRatings(this.child_id);
});

// findByIdAndDelete
ratingSchema.pre(/^findOneAndDelete/, async function(next) {
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

// After there update the User stats
ratingSchema.post(/^findOneAndDelete/, async function() {
    await this.r.constructor.calcRatings(this.r.child_id);
});

//Unique index for many-to-many Rating schema
ratingSchema.index({ parent_id: 1, child_id: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
