const router = require('express').Router();
const usersController = require('../controllers/usersController');
const requireAuth = require('../middleware/authGuard');

router.post('/login', usersController.login);
router.post('/register', usersController.register);
router.post('/logout', requireAuth, usersController.logout);
router.get('/me', requireAuth, usersController.getCurrentUser);
router.put('/me', requireAuth, usersController.updateProfile);

router.get('/username/:username', requireAuth, usersController.getUserByUsername);
router.get('/:userId', requireAuth, usersController.getUserById);
router.get('/', requireAuth, usersController.getUsers);

module.exports = router;