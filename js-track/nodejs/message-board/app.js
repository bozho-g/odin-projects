const express = require('express');
const indexRouter = require('./routers/indexRouter');
const { ValidationError } = require('express-validation');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);

app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).send(err);
    }

    return res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});