const router = require('express').Router();
const followsController = require('../controllers/followsController');
const requireAuth = require('../middleware/authGuard');

router.get('/incoming', requireAuth, followsController.getIncomingFollows);
router.get('/outgoing', requireAuth, followsController.getOutgoingFollows);
router.get('/following', requireAuth, followsController.getAllFollowing);
router.get('/followers', requireAuth, followsController.getAllFollowers);

router.post('/:userId', requireAuth, followsController.sendFollowRequest);
router.delete('/:userId/request', requireAuth, followsController.cancelFollowRequest);

router.put('/:userId/respond', requireAuth, followsController.respondToFollowRequest);

router.delete('/:userId', requireAuth, followsController.unFollowUser);
router.delete('/:userId/remove', requireAuth, followsController.removeFollower);

module.exports = router;