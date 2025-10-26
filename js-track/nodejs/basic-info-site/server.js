const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const requestPath = req.url.split('?')[0].toLowerCase();
    const filePath = requestPath === '/' ? 'index.html' : `.${requestPath}`;

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1> <p>The page you are looking for does not exist.</p> <a href="/">Go back to home</a>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'text/html';
        switch (ext) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.html':
            default:
                contentType = 'text/html';
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
