const { Router } = require('express');
const query = require('../db/pool');
const { validate, Joi } = require('express-validation');

const indexRouter = Router();

const messageValidation = {
    body: Joi.object({
        text: Joi.string().max(500).required(),
        user: Joi.string().max(100).required()
    })
};

indexRouter.get('/', async (req, res) => {
    const { rows: messages } = await query('SELECT * FROM messages ORDER BY created_at DESC');
    res.render('index', { messages });
});

indexRouter.get('/new', (req, res) => {
    res.render('form');
});

indexRouter.post('/new', validate(messageValidation), async (req, res) => {
    const { text, user } = req.body;
    await query('INSERT INTO messages (author, message) VALUES ($1, $2)', [user, text]);
    res.redirect('/');
});

indexRouter.get('/:messageId', async (req, res) => {
    const messageId = parseInt(req.params.messageId, 10);
    const { rows: messages } = await query('SELECT * FROM messages WHERE id = $1', [messageId]);

    if (messages.length > 0) {

        res.render('message', { message: messages[0] });
    } else {
        res.status(404).send('Message not found');
    }
});

module.exports = indexRouter;