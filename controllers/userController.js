const User = require('./../models/userModel');

// Set user id
exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

// Get user by param id
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        return res.status(200).json({
            status: 'success',
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Can not serve the request get user.'
        });
    }
};
