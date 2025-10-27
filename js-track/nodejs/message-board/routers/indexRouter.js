const { Router } = require('express');

const indexRouter = Router();

const messages = [
    {
        id: 0,
        text: "Hi there!",
        user: "Amando",
        added: new Date()
    },
    {
        id: 1,
        text: "Hello World!",
        user: "Charles",
        added: new Date()
    }
];

indexRouter.get('/', (req, res) => {
    res.render('index', { messages });
});

indexRouter.get('/new', (req, res) => {
    res.render('form');
});

indexRouter.post('/new', (req, res) => {
    const { text, user } = req.body;
    messages.push({ text, user, added: new Date(), id: messages.length });
    res.redirect('/');
});

indexRouter.get('/:messageId', (req, res) => {
    const messageId = parseInt(req.params.messageId, 10);
    const message = messages[messageId];
    if (message) {
        res.render('message', { message });
    } else {
        res.status(404).send('Message not found');
    }
});

module.exports = indexRouter;