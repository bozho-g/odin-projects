const express = require('express');
const mountRoutes = require('./routers');
const { ValidationError } = require('express-validation');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mountRoutes(app);

app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).render('errorPage', { errors: err.errors });
    }

    return res.status(err.statusCode || 500).render('errorPage', { errors: err });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});