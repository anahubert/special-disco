const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const ratingController = require('./../controllers/ratingController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/user/:id', ratingController.getUserLikes);
router.get('/most-liked', ratingController.getMostLiked);

// authenticated calls
router.use(authController.protect);

router.post('/logout', authController.logout);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
    '/me/update-password',
    userController.getMe,
    authController.updatePassword
);

router.post('/user/:id/like', ratingController.likeUser);
router.delete('/user/:id/unlike', ratingController.unlikeUser);

module.exports = router;
