const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

// Set JWT token
const setToken = (id, expires) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: expires
    });
};

// Set Cookie
const setCookie = (
    user,
    statusCode,
    req,
    res,
    tokenExpire = process.env.TOKEN_EXPIRES
) => {
    const token = setToken(user._id, tokenExpire);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: false,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: {
            user
        }
    });
};

// Signup the user
exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        setCookie(newUser, 201, req, res);
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

// Login the user
exports.login = async (req, res, next) => {
    try {
        // eslint-disable-next-line prefer-destructuring
        const email = req.body.email;
        // eslint-disable-next-line prefer-destructuring
        const password = req.body.password;

        if (!email || !password) {
            throw new AppError(
                'Please provide a valid username or password',
                400
            );
        }

        // Check if user exists
        const user = await User.findOne({ email: email }).select('+password');

        if (!user || !(await user.isPasswordMatched(password, user.password))) {
            throw new AppError('Password is not valid', 401);
        }

        //Set the cookie
        setCookie(user, 200, req, res);
    } catch (err) {
        res.status(err.statusCode).json({
            status: 'failed',
            message: err.message
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        res.cookie('jwt', '', {
            expires: new Date(Date.now() - 5 * 1000),
            httpOnly: true
        });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            message: err
        });
    }
};

// After this function logedout user can not access protected routes
exports.protect = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = await util.promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
                throw new AppError('Unvalid user.', 401);
            }

            if (currentUser.changedPasswordAfter(decoded.iat)) {
                throw new AppError(
                    'User recently changed password! Please log in again.',
                    401
                );
            }

            req.user = currentUser;
            return next();
        } catch (err) {
            return next(
                res.status(err.statusCode).json({
                    status: 'failed',
                    message: err.message
                })
            );
        }
    } else {
        return next(
            res.status(401).json({
                status: 'failed',
                message: 'Unauthorized user'
            })
        );
    }
};

// Update user password
exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.params.id).select('+password');

    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Wrong password.', 401));
    }

    user.password = req.body.password;

    await user.save();

    user.password = undefined;

    setCookie(user, 200, req, res);
};
