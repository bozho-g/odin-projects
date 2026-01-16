const router = require('express').Router();
const commentsController = require('../controllers/commentsController');
const requireAuth = require('../middleware/authGuard');

router.get('/post/:postId', requireAuth, commentsController.getComments);
router.post('/post/:postId', requireAuth, commentsController.addComment);
router.put('/:commentId', requireAuth, commentsController.updateComment);
router.delete('/:commentId', requireAuth, commentsController.deleteComment);
router.post('/:commentId/like', requireAuth, commentsController.toggleLike);

module.exports = router;