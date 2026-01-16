const express = require('express');
const router = express.Router();
const cloudinaryController = require('../controllers/cloudinaryController');
const requireAuth = require('../middleware/authGuard');

router.post('/sign/profile', requireAuth, cloudinaryController.profilePictureSignedUrl);
router.post('/sign/post', requireAuth, cloudinaryController.postPictureSignedUrl);
router.delete('/delete', requireAuth, cloudinaryController.deletePictureEndpoint);

module.exports = router;
