const router = require('express').Router();
const postsController = require('../controllers/postsController');
const requireAuth = require('../middleware/authGuard');

router.get('/', requireAuth, postsController.getAllPosts);
router.get('/feed', requireAuth, postsController.getFollowedPosts);
router.get('/:postId', requireAuth, postsController.getPostById);
router.get('/user/username/:username', requireAuth, postsController.getUserPostsByUsername);
router.get('/user/:userId', requireAuth, postsController.getUserPosts);

router.post('/', requireAuth, postsController.createPost);
router.put('/:postId', requireAuth, postsController.editPost);
router.delete('/:postId', requireAuth, postsController.deletePost);

router.post('/:postId/like', requireAuth, postsController.toggleLike);

module.exports = router;