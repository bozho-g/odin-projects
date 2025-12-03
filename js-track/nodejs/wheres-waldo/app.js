const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const gameRoutes = require('./routes/game');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', gameRoutes);

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Sorry, page not found.' });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', { message: err.message });
});

app.listen(8000, () => {
    console.log(`Server is running on port: http://localhost:8000`);
});