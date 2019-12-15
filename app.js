const express = require('express');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const morgan = require('morgan');

// Import routes
const userRouter = require('./routes/userRoutes');

// Start express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Development enviroment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, please try again later'
});
app.use('/api', limiter);

// Body parser and setup limiter
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true, limit: '25kb' }));
app.use(cookieParser());

// Mongo data sanitize
app.use(mongoSanitize());

// XSS prevent attacks
app.use(xss());

// Rotes
app.use('/api/v1', userRouter);

app.all('*', (req, res, next) => {
    return next(
        res.status(404).json({
            status: 'fail',
            message: 'Can not serve the request.'
        })
    );
});

module.exports = app;
